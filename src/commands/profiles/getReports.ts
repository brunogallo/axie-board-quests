import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let server: any = null;

export async function getReports(): Promise<void> {
  const app = express();
  const port = 3000;
  app.use(express.static("./web"));
  server = app.listen(port);
}

export function stopServer(): void {
  if (server) {
    server.close();
    server = null;
  } else {
  }
}
