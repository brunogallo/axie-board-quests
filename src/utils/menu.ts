import inquirer from "inquirer";
import { log, startASCII, greenStyle } from "./log.js";
import { showQuests } from "../commands/quests.js";
import { showPremierQuests } from "../commands/premier-quests.js";
import { showProfiles } from "../commands/profiles.js";
import { checkBlessings } from "../commands/atia/prayAtia.js";
import { claimAXS } from "../commands/claim.js";

export async function menu(): Promise<void> {
  console.clear();
  log.header(startASCII);
  console.log("");

  const choices = [
    { name: "📆 Standard Board", value: "1" },
    { name: "✨ Premium Board", value: "2" },
    { name: "🙏 Pray Atia's Blessing", value: "3" },
    { name: "🦲 Accounts", value: "4" },
    { name: "🙏 Claim", value: "5" },
    { name: "⚙️ Options", value: "6" },
  ];

  const { choice } = await inquirer.prompt<{ choice: string }>([
    {
      type: "list",
      name: "choice",
      message: greenStyle("Select an option:"),
      choices,
    },
  ]);

  switch (choice) {
    case "1":
      await showQuests();
      break;
    case "2":
      await showPremierQuests();
      break;
    case "3":
      await checkBlessings();
      break;
    case "4":
      await showProfiles();
      break;
    case "5":
      await claimAXS();
      break;
    case "6":
      console.log("Options selected");
      break;
    default:
      log.error(`Invalid choice. Please select 1, 2, or 3.`);
  }
}

export async function restartMenu(): Promise<void> {
  let running = true;

  while (running) {
    await menu();

    const { back } = await inquirer.prompt([
      {
        type: "confirm",
        name: "back",
        message: "Press ENTER to return to the main menu or exit.",
      },
    ]);

    if (!back) {
      running = false;
    }
  }
}
