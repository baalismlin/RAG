/**
 * Parser-related types
 */

import { CodeChunk } from "./Document"
import { CodeSymbol, SymbolRelation } from "./CodeKnowledge"

export interface ParsedCode {
  chunks: CodeChunk[]
  symbols: CodeSymbol[]
  relations: SymbolRelation[]
}

export interface SymbolInfo {
  name: string
  type: CodeMetadata["symbolType"]
  startLine: number
  endLine: number
  content: string
  signature?: string
  docComment?: string
  modifiers?: string[]
  parentName?: string
}

export interface ILanguageStrategy {
  readonly language: string
  readonly extensions: readonly string[]
  extract(source: string, ext?: string): SymbolInfo[]
}

// Re-export CodeMetadata for use in SymbolInfo
import type { CodeMetadata } from "./Document"
