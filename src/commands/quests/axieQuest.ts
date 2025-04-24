import axios from "axios";
import path from "path";
import * as fs from "fs";
import { log } from "../../utils/log.js";
import { formatTime } from "../../utils/formatTime.js";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
const cf_clearance = fs.readFileSync("config/cf_clearanse.txt", "utf-8").trim();
const jar = new CookieJar();
const client = wrapper(axios.create({ jar }));
const accountsPath = path.join("./config", "accounts.json");

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
  questType: string,
  variant: string
): Promise<string | undefined> {
  try {
    const data = JSON.stringify({
      query: `mutation VerifyQuest($questType: QuestType!, $variant: String!) {
                verifyQuest(questType: $questType, variant: $variant) {
                    title
                    status
                }
            }`,
      variables: { questType, variant },
    });

    const config = {
      method: "post",
      url: "https://graphql-gateway.axieinfinity.com/graphql",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0",
        "Content-Type": "application/json",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
        Authorization: `Bearer ${accessToken}`,
        origin: "https://app.axieinfinity.com",
        Cookie:
          "cf_clearance=mIW8PwZVnuXnbHnzVOk3zeBUXTrA4txiYZBJBXVQ.kU-1745509012-1.2.1.1-Y2Umfl2gxxztW4YUqma608enuvak8GHJKTLilmFUgNPGH01bUmzxYVkZl350BlCjGye.BqwwdsEeWkzCVgQ.tviHSY6wF0ullMGRnBSJa3VZei7keHxgkqIi8D6.vptHyP3gw6nHy7MiETptSfzbSv8.WWUUW1HiQ3SKG4WPq1cpvxvvyTibkpUJsE1yqLVXTqzqbRQBpYkaLS.xGjzJqr8hdvaAB59KjiWztdLgP1Gs9N7eTSirQkEkIvKbOmBHp8vpvtVSrYmCVDzkKzhb9H0hmpzQSBKsTV94WNTooOAIGwBnOcZ.kyMnuW1wf5ggjn5MkSnfnivOxpfcAjxXenVYwwZT6OXPFERs3IBwLDxb.8P0Pw6PkRA8jxN7SDEw",
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
    console.log(error);
  }
}

export async function claimQuests(): Promise<void> {
  log.subheader(`\n🧰 CLAIM: 🏆 Win 1 battle in Classic/Origins.`);

  let accounts = await getAccounts();

  const questTypes = [
    { type: "Win1ClassicBattle", variant: "0" },
    { type: "Win1OriginsBattle", variant: "0" },
  ];

  for (const account of accounts.Axie) {
    log.subheader(`\n🦲 PROFILE: ${account.accountName}`);

    const promises = questTypes.map((quest) =>
      claimQuest(
        account.accessToken,
        account.accountName,
        quest.type,
        quest.variant
      )
    );
    await Promise.all(promises);
  }
}
