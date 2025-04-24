import axios from "axios";
import path from "path";
import * as fs from "fs";
import { log } from "../../utils/log.js";
import { formatTime } from "../../utils/formatTime.js";
import { writeLogs } from "../../utils/writeLogs.js";

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

export async function syncProfiles(): Promise<void> {
  let accounts = await getAccounts();
  let updatedCount = 0;
  let errorCount = 0;
  const errors = [];

  for (const account of accounts.Axie) {
    if(!account.walletAddress || !account.accountName){

      try {
        const response = await axios.get(`https://athena.skymavis.com/v2/private/users/me/profiles`, {
          headers: {
              accept: "*/*",
              "accept-language": "en-US,en;q=0.9",
              authorization: `Bearer ${account.accessToken}`,
              "content-type": "application/json",
              origin: "https://app.axieinfinity.com",
              priority: "u=1, i",
              referer: "https://app.axieinfinity.com/",
              "sec-ch-ua": '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
              "sec-ch-ua-mobile": "?0",
              "sec-ch-ua-platform": '"Windows"',
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "same-site",
              "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
            }
        });

        const profile = response.data;
        account.accountName = profile["profile.name"];
        account.walletAddress = profile["account.wallet.secondary"];

        fs.writeFileSync(accountsPath, JSON.stringify(accounts, null, 2));
        updatedCount++;
        log.success(`Account updated: ${account.accountName} - ${account.walletAddress}`);
      }catch (error) {
        errorCount++;
        errors.push(account.accessToken);
        log.error(`Failed to update account info: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    } else {
      log.info(`Account already up to date.`);
    }
  }

  log.info(`Sync completed with: ${updatedCount} accounts successfully updated and ${errorCount} errors.`);

  if (errors.length > 0) {
    log.info(`Access logs to see failed accesstokens.`);
    writeLogs(
      path.resolve("./axie_data/logs/errors"),
      "error",
      errors.join(', ')
    );
  }
}