import { CodeMetadata } from "@/core/types/Document"

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
