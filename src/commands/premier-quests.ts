import inquirer from "inquirer";
import { menu } from "../utils/menu.js";
import { claimQuests } from "./quests/premierQuest.js";
import { useTickets } from "./quests/useTickets.js";
import { rollPremierQuests } from "./quests/rollPremierQuest.js";

export async function showPremierQuests(): Promise<void> {
  await questSubmenu();
}

async function questSubmenu(): Promise<void> {
  const { questChoice } = await inquirer.prompt<{ questChoice: string }>([
    {
      type: "list",
      name: "questChoice",
      message: "Select a quest option:",
      choices: [
        { name: "📄 Roll Quests", value: "roll" },
        { name: "💪 Complete All", value: "claim" },
        { name: "🎫 Use Tickets", value: "tickets" },
        { name: "🚪 Back to Menu", value: "back" },
      ],
    },
  ]);

  switch (questChoice) {
    case "claim":
      await claimQuests();
      break;
    case "tickets":
      await useTickets();
      break;
    case "roll":
      await rollPremierQuests();
      break;
    case "back":
      console.clear();
      await menu();
      break;
  }
}
