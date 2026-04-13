import { Pool, PoolConfig } from "pg"
import { config } from "@/lib/config"

const poolConfig: PoolConfig = {
  host: config.postgres.host,
  port: config.postgres.port,
  database: config.postgres.database,
  user: config.postgres.user,
  password: config.postgres.password,
  max: 10,
  idleTimeoutMillis: 30_000,
}

let _pool: Pool | null = null

export function getPool(): Pool {
  if (!_pool) {
    _pool = new Pool(poolConfig)
    _pool.on("error", (err: Error) => {
      console.error("[PostgresClient] idle client error:", err.message)
    })
  }
  return _pool
}

export async function closePool(): Promise<void> {
  if (_pool) {
    await _pool.end()
    _pool = null
  }
}
