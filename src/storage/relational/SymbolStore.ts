import { ISymbolStore, SymbolLookupOptions } from "@/core/interfaces/ISymbolStore";
import { CodeSymbol } from "@/core/types/CodeKnowledge";
import { getPool } from "@/storage/relational/PostgresClient";

export class SymbolStore implements ISymbolStore {
  async upsertSymbols(symbols: CodeSymbol[]): Promise<void> {
    if (symbols.length === 0) return;
    const pool = getPool();

    const values: unknown[] = [];
    const placeholders: string[] = [];
    let p = 1;

    for (const s of symbols) {
      placeholders.push(`($${p++},$${p++},$${p++},$${p++},$${p++},$${p++},$${p++},$${p++},$${p++})`);
      values.push(s.id, s.name, s.symbolType, s.language, s.filePath, s.startLine, s.endLine, s.content, s.signature ?? null);
    }

    await pool.query(
      `INSERT INTO symbols (id,name,symbol_type,language,file_path,start_line,end_line,content,signature)
       VALUES ${placeholders.join(",")}
       ON CONFLICT (id) DO UPDATE SET
         name=EXCLUDED.name, symbol_type=EXCLUDED.symbol_type,
         language=EXCLUDED.language, file_path=EXCLUDED.file_path,
         start_line=EXCLUDED.start_line, end_line=EXCLUDED.end_line,
         content=EXCLUDED.content, signature=EXCLUDED.signature,
         indexed_at=NOW()`,
      values
    );
  }

  async lookup(opts: SymbolLookupOptions): Promise<CodeSymbol[]> {
    const pool = getPool();
    const conditions: string[] = [];
    const values: unknown[] = [];
    let p = 1;

    if (opts.name !== undefined) {
      conditions.push(opts.exactMatch ? `name = $${p++}` : `lower(name) LIKE lower($${p++})`);
      values.push(opts.exactMatch ? opts.name : `%${opts.name}%`);
    }
    if (opts.filePath !== undefined) { conditions.push(`file_path = $${p++}`); values.push(opts.filePath); }
    if (opts.symbolType !== undefined) { conditions.push(`symbol_type = $${p++}`); values.push(opts.symbolType); }
    if (opts.language !== undefined) { conditions.push(`language = $${p++}`); values.push(opts.language); }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const { rows } = await pool.query(`SELECT * FROM symbols ${where} ORDER BY name LIMIT 200`, values);
    return rows.map(this.rowToSymbol);
  }

  async getById(id: string): Promise<CodeSymbol | null> {
    const pool = getPool();
    const { rows } = await pool.query("SELECT * FROM symbols WHERE id = $1", [id]);
    return rows.length > 0 ? this.rowToSymbol(rows[0]) : null;
  }

  async deleteByFile(filePath: string): Promise<void> {
    await getPool().query("DELETE FROM symbols WHERE file_path = $1", [filePath]);
  }

  async deleteBySource(source: string): Promise<void> {
    await this.deleteByFile(source);
  }

  async deleteAll(): Promise<void> {
    await getPool().query("DELETE FROM symbols");
  }

  async count(): Promise<number> {
    const { rows } = await getPool().query("SELECT COUNT(*) as count FROM symbols");
    return Number(rows[0]?.count ?? 0);
  }

  private rowToSymbol(row: Record<string, unknown>): CodeSymbol {
    return {
      id:          row.id as string,
      name:        row.name as string,
      symbolType:  row.symbol_type as CodeSymbol["symbolType"],
      language:    row.language as string,
      filePath:    row.file_path as string,
      startLine:   row.start_line as number,
      endLine:     row.end_line as number,
      content:     row.content as string,
      signature:   row.signature as string | undefined,
    };
  }
}
