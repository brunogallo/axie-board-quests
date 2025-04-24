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
async function initPremierQuests(
  userAddress: string,
  accessToken: string
): Promise<any> {
  try {
    const data = JSON.stringify({
      operationName: "InitPremierQuests",
      variables: {
        userAddress: userAddress,
      },
      query: `mutation InitPremierQuests($userAddress: String!) {
        initPremierQuests: initQuests(userAddress: $userAddress) {
          ...QuestFields
          __typename
        }
      }
      fragment QuestFields on Quest {
        type
        title
        status
        tier
        category
        slot
        rerollTimes
        points
        mAxsReward
        board
        iconUrl
        variant {
          id
          labels
          __typename
        }
        startedAt
        expiredAt
        description
        __typename
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

    const response = await axios.post<GraphQLResponse>(
      config.url,
      config.data,
      config
    );
    if (response.data?.data?.initPremierQuests) {
      return { success: true, msg: "" };
    } else {
      const errorMessage =
        response?.data?.errors?.[0]?.message || "Unknown error";
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

export async function rollPremierQuests(): Promise<void> {
  log.subheader(`\n🧰 ROLL: 💪 Roll all Premier board quests.`);

  let accounts = await getAccounts();

  for (const account of accounts.Axie) {
    log.subheader(`\n🦲 PROFILE: ${account.accountName}`);

    try {
      const response = await initPremierQuests(
        account.walletAddress,
        account.accessToken
      );

      if (response.success) {
        log.success(`Success: ${response.msg}`);
      } else {
        log.error(`Error: ${response.msg}`);
        continue;
      }

      const quests = response.data?.initPremierQuests;
      if (!quests || quests.length === 0) {
        log.warning(
          `No premier board quests found for account: ${account.walletAddress}`
        );
        continue;
      }

      for (const quest of quests) {
        log.info(`Quest Title: ${quest.title}`);
        log.info(`Status: ${quest.status}`);
        log.info(`Tier: ${quest.tier}`);
        log.info(`Category: ${quest.category}`);
        log.info(`Points: ${quest.points}`);
        log.info(`MAXS Reward: ${quest.mAxsReward}`);
        log.info(`Started At: ${quest.startedAt}`);
        log.info(`Expired At: ${quest.expiredAt}`);
      }
    } catch (error) {
      log.error(`Error processing account ${account.walletAddress}: ${error}`);
    }
  }
}
