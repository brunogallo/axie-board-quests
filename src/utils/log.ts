import chalk from "chalk";
import { formatTime } from "../utils/formatTime.js";

export const log = {
  error: (msg: string): void =>
    console.log(
      chalk.gray(`[${formatTime(new Date())}] ❌`),
      chalk.white(`${msg}`)
    ),
  info: (msg: string): void =>
    console.log(
      chalk.gray(`[${formatTime(new Date())}] 💡`),
      chalk.white(`${msg}`)
    ),
  neutral: (msg: string): void => console.log(chalk.gray(msg)),
  success: (msg: string): void =>
    console.log(
      chalk.gray(`[${formatTime(new Date())}] ✅`),
      chalk.white(`${msg}`)
    ),
  warning: (msg: string): void =>
    console.log(
      chalk.gray(`[${formatTime(new Date())}] ⚠️`),
      chalk.white(`${msg}`)
    ),
  subheader: (msg: string): void => console.log(chalk.hex("#FFA500")(msg)),
  header: (msg: string): void => console.log(chalk.hex("#03FCA9")(msg)),
  divider: (): void =>
    console.log(
      chalk.bold(
        "─────────────────────────────────────────────────────────────────────────────────"
      )
    ),
};

export const greenStyle = (text: string): string => chalk.inverse(text);

export const startASCII = `
─────────────────────────────────────────────────────────────────────────────────
─────────────────────────────────────────────────────────────────────────────────
888888b.    .d88888b.  888b     d888 888888b.   8888888888 8888888b.   .d8888b.  
888  "88b  d88P" "Y88b 8888b   d8888 888  "88b  888        888   Y88b d88P  Y88b 
888  .88P  888     888 88888b.d88888 888  .88P  888        888    888 Y88b.      
8888888K.  888     888 888Y88888P888 8888888K.  8888888    888   d88P  "Y888b.   
888  "Y88b 888     888 888 Y888P 888 888  "Y88b 888        8888888P"      "Y88b. 
888    888 888     888 888  Y8P  888 888    888 888        888 T88b         "888 
888   d88P Y88b. .d88P 888   "   888 888   d88P 888        888  T88b  Y88b  d88P 
8888888P"   "Y88888P"  888       888 8888888P"  8888888888 888   T88b  "Y8888P"
─────────────────────────────────────────────────────────────────────────────────
─────────────────────────────────────────────────────────────────────────────────
`;
