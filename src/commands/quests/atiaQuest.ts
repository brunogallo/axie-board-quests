import axios from "axios";
import path from "path";
import * as fs from "fs";
import { log } from "../../utils/log.js";
import { formatTime } from "../../utils/formatTime.js";

const accountsPath = path.join("./config", "accounts.json");
const cf_clearance = fs.readFileSync("config/cf_clearanse.txt", "utf-8").trim();

async function getAccounts() {
  try {
    return JSON.parse(fs.readFileSync(accountsPath, "utf8")) as Accounts;
  } catch (error) {
    log.error(
      `${formatTime(new Date())} | [ERROR] Failed to load JSON file: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    process.exit(1);
  }
}

async function claimQuest(
  accessToken: string,
  accountName: string,
  walletAddress: string,
  questType: string,
  variant: string
): Promise<string | undefined> {
  try {
    const data = JSON.stringify({
      operationName: "VerifyQuest",
      query: `mutation VerifyQuest($userAddress: String!, $questType: QuestType!, $variant: String!) {
              verifyQuest(userAddress: $userAddress, questType: $questType, variant: $variant) {
                  title
                  status
              }
          }`,
      variables: { userAddress: walletAddress, questType, variant },
    });

    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://graphql-gateway.axieinfinity.com/graphql",
      headers: {
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9",
        authorization: `Bearer ${accessToken}`,
        "content-type": "application/json",
        origin: "https://app.axieinfinity.com",
        Cookie: `cf_clearance=${cf_clearance}`,
        priority: "u=1, i",
        referer: "https://app.axieinfinity.com/",
        "sec-ch-ua":
          '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
      },
      data: data,
    };

    const response = await axios.post<ClaimQuestResponse>(
      config.url,
      config.data,
      config
    );
    let outputMessage = null;

    if (!response.data.data) {
      outputMessage = `Quest is already completed or invalid accessToken.`;
      log.warning(outputMessage);
      return outputMessage;
    }

    if (response.data.data.verifyQuest.status == "Open") {
      outputMessage = `${response.data.data.verifyQuest.title} - Status: ${response.data.data.verifyQuest.status}`;
      log.info(outputMessage);
    } else {
      outputMessage = `${response.data.data.verifyQuest.title} - Status: ${response.data.data.verifyQuest.status}`;
      log.success(outputMessage);
    }

    return outputMessage;
  } catch (error) {
    log.error(`\nError on account: ${accountName} - ${questType}`);
  }
}

export async function atiaQuests(): Promise<void> {
  log.subheader(`\n🧰 CLAIM: 🙏 Pray Atia's Blessing.`);

  let accounts = await getAccounts();

  for (const account of accounts.Axie) {
    log.subheader(`\n🦲 PROFILE: ${account.accountName}`);

    const questTypes = [
      { type: "PrayAtia", variant: "0", userAddress: account.walletAddress },
    ];

    const promises = questTypes.map((quest) =>
      claimQuest(
        account.accessToken,
        account.accountName,
        account.walletAddress,
        quest.type,
        quest.variant
      )
    );
    await Promise.all(promises);
  }
}
