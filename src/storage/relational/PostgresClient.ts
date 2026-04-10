import { Pool, PoolConfig } from "pg"

const config: PoolConfig = {
  host: process.env.PG_HOST ?? "localhost",
  port: Number(process.env.PG_PORT ?? 5432),
  database: process.env.PG_DATABASE ?? "rag",
  user: process.env.PG_USER ?? "rag",
  password: process.env.PG_PASSWORD ?? "rag",
  max: 10,
  idleTimeoutMillis: 30_000,
}

let _pool: Pool | null = null

export function getPool(): Pool {
  if (!_pool) {
    _pool = new Pool(config)
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
