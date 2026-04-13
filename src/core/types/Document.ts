/**
 * Document and chunk types
 */

export type DocumentType = "markdown" | "pdf" | "code"
export type QueryType = "document" | "code" | "hybrid"

export interface DocumentMetadata {
  source: string
  type: Exclude<DocumentType, "code">
  chunkIndex: number
  totalChunks?: number
  title?: string
  section?: string
}

export interface CodeMetadata {
  source: string
  type: "code"
  language: string
  symbolType: "function" | "class" | "method" | "interface" | "variable" | "other"
  symbolName: string
  filePath: string
  startLine: number
  endLine: number
  chunkIndex: number
  signature?: string
  docComment?: string
  modifiers?: string[]
  parentName?: string
}

export interface DocumentChunk {
  id: string
  content: string
  metadata: DocumentMetadata
}

export interface CodeChunk {
  id: string
  content: string
  metadata: CodeMetadata
}

export type AnyChunk = DocumentChunk | CodeChunk

export function isCodeChunk(chunk: AnyChunk): chunk is CodeChunk {
  return chunk.metadata.type === "code"
}
