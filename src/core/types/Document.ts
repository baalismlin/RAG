export type DocumentType = "markdown" | "pdf" | "code";
export type QueryType = "document" | "code" | "hybrid";

export interface DocumentChunk {
  id: string;
  content: string;
  metadata: DocumentMetadata;
}

export interface DocumentMetadata {
  source: string;
  type: DocumentType;
  chunkIndex: number;
  totalChunks?: number;
  title?: string;
  section?: string;
}

export interface CodeChunk {
  id: string;
  content: string;
  metadata: CodeMetadata;
}

export interface CodeMetadata {
  source: string;
  type: DocumentType;
  language: string;
  symbolType: "function" | "class" | "method" | "interface" | "variable" | "other";
  symbolName: string;
  filePath: string;
  startLine: number;
  endLine: number;
  chunkIndex: number;
  signature?: string;
  docComment?: string;
  modifiers?: string[];
  parentName?: string;
}

export type AnyChunk = DocumentChunk | CodeChunk;

export function isCodeChunk(chunk: AnyChunk): chunk is CodeChunk {
  return (chunk.metadata as CodeMetadata).symbolName !== undefined;
}
