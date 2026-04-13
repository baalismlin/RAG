import { IStorage } from "./IStorage"
import { CodeSymbol, SymbolKind } from "../types"

export interface SymbolLookupOptions {
  name?: string
  filePath?: string
  symbolType?: SymbolKind
  language?: string
  exactMatch?: boolean
}

export interface ISymbolStore extends IStorage {
  upsertSymbols(symbols: CodeSymbol[]): Promise<void>
  lookup(options: SymbolLookupOptions): Promise<CodeSymbol[]>
  getById(id: string): Promise<CodeSymbol | null>
  deleteByFile(filePath: string): Promise<void>
}
