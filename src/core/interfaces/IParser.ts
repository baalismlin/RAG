import { ParsedResult } from "../types"

/**
 * Parser specialized for document content (Markdown, PDF, etc.).
 * Produces DocumentChunk with section-aware metadata.
 */
export interface IDocumentParser {
  /**
   * Parse document content into chunks.
   * Document parsers typically split by headings and then by size limits.
   * @param content - Raw document content
   * @param source - Source identifier (file path)
   * @returns Array of document chunks with section metadata
   */
  parse(content: string, source: string): Promise<ParsedResult>
}

/**
 * Parser specialized for code content.
 * Produces ParsedCode containing chunks, symbols, and relations.
 */

export type ICodeParser = IDocumentParser

