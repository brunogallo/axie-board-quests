import { ethers } from 'ethers';
import axios from "axios";
import path from "path";
import * as fs from "fs";
import { log } from "../utils/log.js";
import { formatTime } from "../utils/formatTime.js";
import { atiaAbi } from "./atia/atiaABI.js";
import chalk from "chalk";

const rpc = 'https://api.roninchain.com/rpc';
const provider = new ethers.JsonRpcProvider(rpc, 2020, { batchMaxCount: 1 });
const keysPath = path.join("./config", "privateKeys.json");
const atiaContract = new ethers.Contract('0x9d3936dbd9a794ee31ef9f13814233d435bd806c', atiaAbi, provider);
  
async function getWallets(key: string) {
    try {
        return JSON.parse(fs.readFileSync(keysPath, "utf8"))[key];
      } catch (error) {
        log.error(
          `${formatTime(new Date())} | [ERROR] Failed to load JSON file: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
        process.exit(1);
    }
}

export async function claimAXS(): Promise<void> {
  const keys = await getWallets('keys');
  log.subheader(`\n⚙️ Starting the claim (${keys.length} wallets)`);

  for (const key of keys) {
    if (!key.claimPrivateKey) {
      log.warning(`No private key found!`);
      log.error(key);
      return;
    }

    const signer = new ethers.Wallet(key.claimPrivateKey, provider);

    for (const delegatee of key.claimPrivateKey) {
      await isActivated(delegatee).then(async ({ status, streak }) => {
        if (status) {
          log.info(`⏱️ Already activated for ${chalk.gray(delegatee.slice(-4))} (streak: ${chalk.yellow(streak)})`);
        } else {
          await activateStreak(signer, delegatee).then(({ status, streak }) => {
            if (!status) return;
            log.success(`Activated for ${chalk.gray(delegatee.slice(-4))} (streak: ${chalk.yellow(streak)})`);
          });
        }
      });
    }
  }
}

async function isActivated(address: string) {
  const { currentStreakCount } = await atiaContract.getStreak(address);
  const { _, hasPrayedToday } = await atiaContract.getActivationStatus(address);

  return { status: hasPrayedToday, streak: Number(currentStreakCount) };
}

async function activateStreak(signer: ethers.Wallet, delegatee: string) {
  const connectedContract = <ethers.Contract>atiaContract.connect(signer);
  try {
    const { currentStreakCount } = await connectedContract.getStreak(delegatee);
    const tx = await connectedContract.activateStreak(delegatee);
    await tx.wait();
    return { status: true, streak: Number(currentStreakCount) + 1 };
  } catch (e: Error | any) {
    log.error(`Failed to pray for ${chalk.gray(delegatee.slice(-4))} ${e.code} (${e.info?.error?.message})`);
    return { status: false };
  }
}