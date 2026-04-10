import { IGraphStore } from "@/core/interfaces/IGraphStore"
import { SymbolRelation, RelationType, TraversalNode } from "@/core/types/CodeKnowledge"
import { getPool } from "@/storage/relational/PostgresClient"
import { SymbolStore } from "@/storage/relational/SymbolStore"

export class GraphStore implements IGraphStore {
  private readonly symbolStore: SymbolStore

  constructor(symbolStore: SymbolStore) {
    this.symbolStore = symbolStore
  }

  async upsertRelations(relations: SymbolRelation[]): Promise<void> {
    if (relations.length === 0) return
    const pool = getPool()

    for (const r of relations) {
      await pool.query(
        `INSERT INTO symbol_relations (from_symbol_id,to_symbol_name,to_symbol_id,relation_type,file_path,line_number)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT DO NOTHING`,
        [
          r.fromSymbolId,
          r.toSymbolName,
          r.toSymbolId ?? null,
          r.relationType,
          r.filePath,
          r.lineNumber ?? null,
        ]
      )
    }
  }

  async getOutgoing(fromSymbolId: string, type?: RelationType): Promise<SymbolRelation[]> {
    const pool = getPool()
    const cond = type ? "AND relation_type = $2" : ""
    const vals: unknown[] = type ? [fromSymbolId, type] : [fromSymbolId]
    const { rows } = await pool.query(
      `SELECT * FROM symbol_relations WHERE from_symbol_id = $1 ${cond} ORDER BY id`,
      vals
    )
    return rows.map(this.rowToRelation)
  }

  async getIncoming(toSymbolId: string, type?: RelationType): Promise<SymbolRelation[]> {
    const pool = getPool()
    const cond = type ? "AND relation_type = $2" : ""
    const vals: unknown[] = type ? [toSymbolId, type] : [toSymbolId]
    const { rows } = await pool.query(
      `SELECT * FROM symbol_relations WHERE to_symbol_id = $1 ${cond} ORDER BY id`,
      vals
    )
    return rows.map(this.rowToRelation)
  }

  async traverse(
    startId: string,
    direction: "outgoing" | "incoming",
    maxDepth: number
  ): Promise<TraversalNode[]> {
    const visited = new Set<string>([startId])
    const result: TraversalNode[] = []
    const queue: Array<{ id: string; depth: number; via?: SymbolRelation }> = [
      { id: startId, depth: 0 },
    ]

    while (queue.length > 0) {
      const { id, depth, via } = queue.shift()!
      if (depth > maxDepth) continue

      const symbol = await this.symbolStore.getById(id)
      if (!symbol) continue

      result.push({ symbol, depth, via })

      if (depth < maxDepth) {
        const relations =
          direction === "outgoing" ? await this.getOutgoing(id) : await this.getIncoming(id)

        for (const rel of relations) {
          const nextId = direction === "outgoing" ? rel.toSymbolId : rel.fromSymbolId
          if (nextId && !visited.has(nextId)) {
            visited.add(nextId)
            queue.push({ id: nextId, depth: depth + 1, via: rel })
          }
        }
      }
    }

    return result
  }

  async deleteByFile(filePath: string): Promise<void> {
    await getPool().query("DELETE FROM symbol_relations WHERE file_path = $1", [filePath])
  }

  async deleteBySource(source: string): Promise<void> {
    await this.deleteByFile(source)
  }

  async deleteAll(): Promise<void> {
    await getPool().query("DELETE FROM symbol_relations")
  }

  async count(): Promise<number> {
    const { rows } = await getPool().query("SELECT COUNT(*) as count FROM symbol_relations")
    return Number(rows[0]?.count ?? 0)
  }

  private rowToRelation(row: Record<string, unknown>): SymbolRelation {
    return {
      id: row.id as number,
      fromSymbolId: row.from_symbol_id as string,
      toSymbolName: row.to_symbol_name as string,
      toSymbolId: row.to_symbol_id as string | undefined,
      relationType: row.relation_type as RelationType,
      filePath: row.file_path as string,
      lineNumber: row.line_number as number | undefined,
    }
  }
}
