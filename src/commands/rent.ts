import axios from "axios";
import inquirer from "inquirer";
import chalk from "chalk";
import path from "path";
import * as fs from "fs";
import { sleep } from "../utils/sleep.js";
import { log } from "../utils/log.js";
import { menu } from "../utils/menu.js";
import { AxiosRequestConfig } from "axios";
const cf_clearance = fs
  .readFileSync("./config/cf_clearanse.txt", "utf-8")
  .trim();

const accountsPath = path.join("./config", "accounts.json");

interface Account {
  accountName: string;
  accountWallet: string;
  accessToken: string;
  refreshToken: string;
}

interface Accounts {
  Axie: Account[];
}

interface ClaimQuestResponse {
  data: {
    axies: AxiesData;
  };
}

interface AxiePart {
  name: string;
  class: string;
  type: string;
}

interface AxieInfo {
  id: number;
  name: string;
  class: string;
  axpInfo: {
    level: number;
  };
  parts: AxiePart[];
}

interface AxiesData {
  total: number;
}

interface AxiesResponse {
  data: {
    axies: {
      total: number;
      results: AxieInfo[];
    };
  };
}

let accounts: Accounts;

try {
  accounts = JSON.parse(fs.readFileSync(accountsPath, "utf8")) as Accounts;
} catch (error) {
  log.error(
    `Failed to load JSON file: ${
      error instanceof Error ? error.message : "Unknown error"
    }`
  );
  process.exit(1);
}

export async function showRent(): Promise<void> {
  await questSubmenu();
}

async function questSubmenu(): Promise<void> {
  const { questChoice } = await inquirer.prompt<{ questChoice: string }>([
    {
      type: "list",
      name: "questChoice",
      message: "Select a quest option:",
      choices: [
        { name: "🔎 Consult Rent", value: "rent" },
        { name: "🔎 Consult Specific Rent", value: "spectrack" },
        { name: "⏳ Track Rent", value: "track" },
        { name: "🚪 Back to Menu", value: "back" },
      ],
    },
  ]);

  switch (questChoice) {
    case "rent":
      await consultRent();
      break;
    case "track":
      await trackRent(60);
      break;
    case "spectrack":
      const { wallet } = await inquirer.prompt<{ wallet: string }>([
        {
          type: "input",
          name: "wallet",
          message: "Enter the wallet address:",
        },
      ]);
      await verifySpecificRent(wallet);
      break;
    case "back":
      console.clear();
      await menu();
      break;
  }
}

async function GetTotalOwnedAxiesByUser(
  AccountWallet: string,
  AccountName: string
): Promise<string> {
  try {
    const data = JSON.stringify({
      operationName: "GetTotalOwnedAxiesByUser",
      variables: {
        owner: AccountWallet,
      },
      query:
        "query GetTotalOwnedAxiesByUser($owner: String) {\n  axies(owner: $owner) {\n    total\n    __typename\n  }\n}\n",
    });

    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://graphql-gateway.axieinfinity.com/graphql",
      headers: {
        Host: "graphql-gateway.axieinfinity.com",
        "sec-ch-ua-platform": '"Windows"',
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
        accept: "*/*",
        "sec-ch-ua":
          '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
        "content-type": "application/json",
        "sec-ch-ua-mobile": "?0",
        origin: "https://app.axieinfinity.com",
        Cookie: `cf_clearance=${cf_clearance}`,
        "sec-fetch-site": "same-site",
        "sec-fetch-mode": "cors",
        "sec-fetch-dest": "empty",
        referer: "https://app.axieinfinity.com/",
        "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
        priority: "u=1, i",
        pragma: "no-cache",
        "cache-control": "no-cache",
      },
      data: data,
    };

    const response = await axios.post<ClaimQuestResponse>(
      config.url,
      data,
      config
    );

    const TotalAxies = response.data.data.axies.total;
    const OutputMessage = `Total available: ${TotalAxies}`;
    log.subheader(`🦲 PROFILE: ${AccountName}`);

    if (TotalAxies < 3) {
      //sendWebhook(
      //  `Detected ${TotalAxies} Axies on account: ${AccountName}`,
      //  AccountName,
      //  AccountWallet
      //);
      log.warning(`${OutputMessage}\n`);
    } else {
      log.success(`${OutputMessage}\n`);
    }

    return OutputMessage;
  } catch (error) {
    log.error(`Error on account: ${AccountName} - Axie verification`);
    return "Error occurred";
  }
}

export async function verifySpecificRent(
  Wallet: string
): Promise<string | void> {
  try {
    const account = accounts.Axie.find((acc) => acc.accountWallet === Wallet);

    const data = JSON.stringify({
      query: `query GetMyAxiesInventory($auctionType: AuctionType, $criteria: AxieSearchCriteria, $from: Int, $sort: SortBy, $size: Int, $owner: String, $rep15Roles: [Rep15TokenUserRole!]) {
        axies(auctionType: $auctionType, criteria: $criteria, from: $from, sort: $sort, size: $size, owner: $owner, rep15Roles: $rep15Roles) {
          total
          results {
            id
            name
            class
            axpInfo {
              level
            }
            parts {
              name
              class
              type
            }
          }
        }
      }`,
      variables: {
        auctionType: "All",
        from: 0,
        sort: "LevelDesc",
        size: 24,
        owner: Wallet,
        rep15Roles: ["Owner", "Delegatee"],
      },
    });

    const config: AxiosRequestConfig = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://graphql-gateway.axieinfinity.com/graphql",
      headers: {
        "content-type": "application/json",
        origin: "https://app.axieinfinity.com",
        Cookie: `cf_clearance=${cf_clearance}`,
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
      },
      data: data,
    };

    const response = await axios(config);
    const axiesResponse: AxiesResponse = response.data;

    if (!axiesResponse.data || !axiesResponse.data.axies.results.length) {
      const outputMessage = `${account?.accountName} > No Axie found or error in API response.`;
      log.warning(outputMessage);
      return outputMessage;
    }

    const axies = axiesResponse.data.axies.results;
    log.success(` Axies found: ${axies.length}\n`);

    axies.forEach((axie) => {
      console.log(chalk.blueBright.bold("✨ Axie ID: ") + axie.id);
      console.log(chalk.blueBright.bold("✨ Name: ") + axie.name);
      console.log(chalk.blueBright.bold("✨ Class: ") + axie.class);
      console.log(chalk.blueBright.bold("✨ Level: ") + axie.axpInfo.level);
      console.log(chalk.blueBright.bold("✨ Axie Parts:"));

      axie.parts.forEach((part) => {
        console.log(
          chalk.magentaBright("     Part: ") +
            chalk.bold(`${part.name}, Class: ${part.class}, Type: ${part.type}`)
        );
      });

      console.log("");
    });

    return `Axies successfully loaded for ${account?.accountName}.`;
  } catch (error: any) {
    log.error(`Error fetching Axies inventory: ${error.message}`);
  }
}

export async function consultRent(): Promise<void> {
  const verifyRentsLogs: string[] = [];

  for (const account of accounts.Axie) {
    const verifyRentsOutput = await GetTotalOwnedAxiesByUser(
      account.accountWallet,
      account.accountName
    );

    const OutputLogRents = `[${new Date().toLocaleString()}] ${verifyRentsOutput}\n`;
    verifyRentsLogs.push(OutputLogRents);
    await sleep(5000);
  }

  const OutputLogsString = verifyRentsLogs.join("\n");
}

export async function trackRent(intervalMinutes: number): Promise<void> {
  if (intervalMinutes < 30) {
    log.info(`The interval needs to be at least 30 minutes`);
    return;
  }
  while (true) {
    await consultRent();
    log.info(`Waiting ${intervalMinutes} minutes until next check...`);
    await sleep(intervalMinutes * 60000);
  }
}
