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
async function fetchQuests(
  userAddress: string,
  accessToken: string
): Promise<any> {
  try {
    const data = JSON.stringify({
      query: `query GetUserQuestsByBoard($userAddress: String!, $questBoard: QuestBoard!, $startedDatetime: DateTime) {
        userQuests(userAddress: $userAddress) {
          quests(questBoard: $questBoard, startedDatetime: $startedDatetime) {
            ...QuestFields
            __typename
          }
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
        __typename
      }`,
      variables: {
        questBoard: "Premier",
        userAddress: userAddress,
      },
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
    return response.data.data.userQuests.quests;
  } catch (error) {
    log.error("Failed to fetch quests");
    throw new Error("Failed to fetch quests");
  }
}

// Function to claim a quest by verifying it
async function claimQuest(
  accessToken: string,
  accountName: string,
  questType: string,
  variant: string
): Promise<string | undefined> {
  try {
    const data = JSON.stringify({
      query: `mutation VerifyQuest($userAddress: String!, $questType: QuestType!, $variant: String!) {
            verifyQuest(userAddress: $userAddress, questType: $questType, variant: $variant) {
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
              }
            }
          }`,
      variables: { userAddress: accountName, questType, variant },
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
      console.log(response.data);
      outputMessage = `Quest is already completed or invalid accessToken.`;
      log.warning(outputMessage);
      return outputMessage;
    }

    if (response.data.data.verifyQuest.status === "Open") {
      outputMessage = `${response.data.data.verifyQuest.title} - Status: ${response.data.data.verifyQuest.status}`;
      log.info(outputMessage);
    } else {
      outputMessage = `${response.data.data.verifyQuest.title} - Status: ${response.data.data.verifyQuest.status}`;
      log.success(outputMessage);
    }

    return outputMessage;
  } catch (error) {
    log.error(`Error on account: ${accountName} - ${questType}`);
  }
}

// Main function to claim quests
export async function claimQuests(): Promise<void> {
  log.subheader(`\n🧰 CLAIM: 💪 All Premier board quests.`);

  let accounts = await getAccounts();

  for (const account of accounts.Axie) {
    log.subheader(`\n🦲 PROFILE: ${account.accountName}`);

    try {
      const quests = await fetchQuests(
        account.walletAddress,
        account.accessToken
      );

      if (quests.length === 0) {
        log.warning(
          `No premier board found for account: ${account.walletAddress}`
        );
        continue;
      }

      // Process each quest and verify if it is "Open" or not
      for (const quest of quests) {
        if (quest.status === "Open") {
          await claimQuest(
            account.accessToken,
            account.walletAddress,
            quest.type,
            quest.variant.id
          );
        } else {
          log.success(
            `Quest already completed or not available: ${quest.title}`
          );
        }
      }
    } catch (error) {
      log.error(`Failed to process quests for account: ${account.accountName}`);
    }
  }
}
