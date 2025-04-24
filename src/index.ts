import { log } from "./utils/log.js";
import { menu } from "./utils/menu.js";
import { formatTime } from "./utils/formatTime.js";

async function initiate(): Promise<void> {
  try {
    await menu();
  } catch (e) {
    log.error(
      `${formatTime(new Date())} | Error in initiate: ${(e as Error).message}`
    );
  }
}

initiate();
