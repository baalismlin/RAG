import * as fs from "fs/promises";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

import { getPool, closePool } from "../src/db/PostgresClient";

async function main() {
  const schemaPath = path.resolve(__dirname, "../src/db/schema.sql");
  const sql = await fs.readFile(schemaPath, "utf-8");
  const pool = getPool();

  console.log("🗄️  Running database migration...");
  await pool.query(sql);
  console.log("✅ Migration complete.");
}

main()
  .catch((err) => { console.error("Migration failed:", err); process.exit(1); })
  .finally(() => closePool());
