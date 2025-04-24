import dotenv from "dotenv";
dotenv.config();

export const config = {
  rentRefresh: process.env.RENTS_DELAY_MILLISECONDS || 60,
  claimRefresh: process.env.CLAIM_DELAY_MILLISECONDS || 18000,
  discWH: process.env.DISCORD_WEBHOOK || "",
  roninRPC: process.env.RONIN_RPC || "https://api.roninchain.com/rpc",
  accountPW: process.env.ACCOUNT_PASSWORD || "",
};
