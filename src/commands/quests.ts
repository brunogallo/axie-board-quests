import inquirer from "inquirer";
import { menu } from "../utils/menu.js";
import { claimQuests } from "../commands/quests/axieQuest.js";
import { atiaQuests } from "../commands/quests/atiaQuest.js";
import { pouchQuests } from "../commands/quests/pouchQuest.js";
import { cocochocoQuests } from "../commands/quests/cocochocoQuest.js";

export async function showQuests(): Promise<void> {
  await questSubmenu();
}

async function questSubmenu(): Promise<void> {
  const { questChoice } = await inquirer.prompt<{ questChoice: string }>([
    {
      type: "list",
      name: "questChoice",
      message: "Select a quest option:",
      choices: [
        { name: "🏆 Win battle in Classic/Origins", value: "claim" },
        { name: "🙏 Activate Atia", value: "atia" },
        { name: "📦 Open a pouch", value: "pouch" },
        { name: "🍫 Feed Cocochoco", value: "cocochoco" },
        { name: "🚪 Back to Menu", value: "back" },
      ],
    },
  ]);

  switch (questChoice) {
    case "claim":
      await claimQuests();
      break;
    case "atia":
      await atiaQuests();
      break;
    case "pouch":
      await pouchQuests();
      break;
    case "cocochoco":
      await cocochocoQuests();
      break;
    case "back":
      console.clear();
      await menu();
      break;
  }
}
