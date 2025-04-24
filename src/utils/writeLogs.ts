import fs from "fs";
import path from "path";

export function writeLogs(
  Dir: string,
  prefixoArquivo: string,
  message: unknown
): void {
  createLogDirsIfNotExists(Dir);

  const timestampLocal = new Date().toISOString().replace(/[:.]/g, "-");
  const logFileName = `${prefixoArquivo}_${timestampLocal}.txt`;
  const caminhoArquivo = path.join(Dir, logFileName);

  const logMessage = `[${new Date().toLocaleString()}] ${String(message)}\n`;

  fs.writeFileSync(caminhoArquivo, logMessage, { encoding: "utf-8" });
}

function createLogDirsIfNotExists(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}
