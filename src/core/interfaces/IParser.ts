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
export interface ICodeParser {
  /**
   * Parse code file into chunks, symbols, and relations.
   * Code parsers extract functions, classes, interfaces, and other symbols.
   * @param filePath - Path to the code file to parse
   * @returns ParsedCode containing chunks, symbols, and relations
   */
  parse(filePath: string): Promise<ParsedResult>

  /**
   * List of programming languages this parser supports.
   * Used to determine if the parser can handle a given code file.
   */
  readonly supportedLanguages: string[]
}
