import inquirer from "inquirer";
import { menu } from "../utils/menu.js";
import { syncProfiles } from "./profiles/syncProfiles.js";

export async function showProfiles(): Promise<void> {
  await profileSubmenu();
}

async function profileSubmenu(): Promise<void> {
  const { questChoice } = await inquirer.prompt<{ questChoice: string }>([
    {
      type: "list",
      name: "questChoice",
      message: "Select a quest option:",
      choices: [
        { name: "🦲 Sync Profile", value: "syncProfiles" },
        { name: "🚪 Back to Menu", value: "back" },
      ],
    },
  ]);

  switch (questChoice) {
    case "syncProfiles":
      await syncProfiles();
      break;
    case "back":
      console.clear();
      await menu();
      break;
  }
}
