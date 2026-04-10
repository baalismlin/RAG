export type SymbolKind = "class" | "function" | "interface" | "variable" | "method" | "other"
export type RelationType = "imports" | "extends" | "implements" | "calls" | "uses"

export interface CodeSymbol {
  id: string
  name: string
  symbolType: SymbolKind
  language: string
  filePath: string
  startLine: number
  endLine: number
  content: string
  signature?: string
}

export interface SymbolRelation {
  id?: number
  fromSymbolId: string
  toSymbolName: string
  toSymbolId?: string
  relationType: RelationType
  filePath: string
  lineNumber?: number
}

export interface TraversalNode {
  symbol: CodeSymbol
  depth: number
  via?: SymbolRelation
}
