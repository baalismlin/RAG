import { CodeSymbol, SymbolKind } from "../types/CodeKnowledge";

export interface SymbolLookupOptions {
  name?: string;
  filePath?: string;
  symbolType?: SymbolKind;
  language?: string;
  exactMatch?: boolean;
}

export interface ISymbolStore {
  upsertSymbols(symbols: CodeSymbol[]): Promise<void>;
  lookup(options: SymbolLookupOptions): Promise<CodeSymbol[]>;
  getById(id: string): Promise<CodeSymbol | null>;
  deleteByFile(filePath: string): Promise<void>;
  deleteAll(): Promise<void>;
}
