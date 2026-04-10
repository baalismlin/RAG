import { AnyChunk, DocumentChunk, CodeChunk } from "../types/Document"

/**
 * Base parser interface for converting raw content into chunks.
 * Parsers handle the logic of splitting content into semantically meaningful pieces.
 */
export interface IParser {
  /**
   * Parse content and return chunks.
   * @param content - Raw text content to parse
   * @param source - Source identifier (typically file path) for metadata
   * @returns Array of parsed chunks
   */
  parse(content: string, source: string): Promise<AnyChunk[]>
}

/**
 * Parser specialized for document content (Markdown, PDF, etc.).
 * Produces DocumentChunk with section-aware metadata.
 */
export interface IDocumentParser extends IParser {
  /**
   * Parse document content into chunks.
   * Document parsers typically split by headings and then by size limits.
   * @param content - Raw document content
   * @param source - Source identifier (file path)
   * @returns Array of document chunks with section metadata
   */
  parse(content: string, source: string): Promise<DocumentChunk[]>
}

/**
 * Parser specialized for code content.
 * Produces CodeChunk with symbol-level metadata (functions, classes, etc.).
 */
export interface ICodeParser extends IParser {
  /**
   * Parse code content into symbol-level chunks.
   * Code parsers extract functions, classes, interfaces, and other symbols.
   * @param content - Raw code content
   * @param source - Source identifier (file path)
   * @returns Array of code chunks with symbol metadata
   */
  parse(content: string, source: string): Promise<CodeChunk[]>

  /**
   * List of programming languages this parser supports.
   * Used to determine if the parser can handle a given code file.
   */
  readonly supportedLanguages: string[]
}
