import { Webhook, MessageBuilder } from "discord-webhook-node";
import { log } from "../utils/log.js";
import { config } from "../config/dotenv.js";

export async function sendWebhook(
  WebhookContent: string,
  AccountName: string,
  AccountWallet: string
): Promise<void> {
  try {
    const hook = new Webhook(config.discWH);
    const embed = new MessageBuilder()
      .setTitle("Inventory")
      .setAuthor(`${AccountName} - ${AccountWallet}`)
      .setUrl("https://app.axieinfinity.com/profile/inventory/axies/") // Corrected method
      .setColor(0xd63e33) // Corrected to a numeric color value
      .setDescription(WebhookContent)
      .setTimestamp();

    await hook.send(embed); // Await the send operation
  } catch (error) {
    log.error(
      `Ocorreu um erro ao tentar enviar a webhook (${AccountName} - ${AccountWallet})`
    );
  }
}
