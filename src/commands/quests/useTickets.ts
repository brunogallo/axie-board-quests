import axios from "axios";
import path from "path";
import * as fs from "fs";
import { log } from "../../utils/log.js";
import { formatTime } from "../../utils/formatTime.js";
const cf_clearance = fs.readFileSync("config/cf_clearanse.txt", "utf-8").trim();

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

// Function to fetch quests from GraphQL
async function unlockPremierQuests(
  userAddress: string,
  accessToken: string
): Promise<{ success: boolean; msg: string }> {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = "0x";

    const data = JSON.stringify({
      operationName: "UnlockPremierQuests",
      variables: {
        unlockType: "PremierTicket",
        signature: signature,
        timestamp: timestamp,
        userAddress: userAddress,
      },
      query: `mutation UnlockPremierQuests($userAddress: String!, $unlockType: PremierQuestUnlockType!, $timestamp: Int!, $signature: String!) {
        unlockPremierQuests(
          userAddress: $userAddress
          unlockType: $unlockType
          timestamp: $timestamp
          signature: $signature
        )
      }`,
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

    const response = await axios.post(config.url, config.data, config);

    if (response.data?.data?.unlockPremierQuests) {
      return { success: true, msg: "" };
    } else {
      const errorMessage =
        response?.data?.errors[0]?.message || "Unknown error";
      return { success: false, msg: errorMessage };
    }
  } catch (error) {
    console.error("Failed to unlock premier quests", error);
    return {
      success: false,
      msg: "An error occurred while processing the request",
    };
  }
}

export async function useTickets(): Promise<void> {
  console.log(`\n🧰 PREMIER: 💪 Using tickets for all accounts.`);

  let accounts = await getAccounts();

  for (const account of accounts.Axie) {
    console.log(`\n🦲 PROFILE: ${account.accountName}`);

    try {
      const result = await unlockPremierQuests(
        account.walletAddress,
        account.accessToken
      );

      if (result.success) {
        log.success(`Successfully unlocked quests for account!`);
      } else {
        log.error(`${result.msg}`);
      }
    } catch (error: any) {
      log.error(`${error.message}`);
    }
  }
}
