import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbDir = path.resolve(__dirname, "../../axie_data/database");
const dbPath = path.join(dbDir, "axie_accounts.db");

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS axie_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    secret TEXT NOT NULL,
    lootrushWallet TEXT NOT NULL,
    email TEXT,
    password TEXT,
    profile TEXT NOT NULL
  )
`);

export function insertAccount(
  secret: string = "",
  email: string = "",
  lootrushWallet: string = "",
  password: string = "",
  profile: string = ""
): void {
  const stmt = db.prepare(`
    INSERT INTO axie_accounts (secret, email, lootrushWallet, password, profile)
    VALUES (?, ?, ?, ?, ?)
  `);
  stmt.run(secret, email, lootrushWallet, password, profile);
}

export function getAllAccounts(): any[] {
  const stmt = db.prepare(`SELECT * FROM axie_accounts`);
  return stmt.all();
}
