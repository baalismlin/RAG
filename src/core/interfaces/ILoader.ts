import { AnyChunk } from "../types/Document";

/**
 * Loader interface for reading files from disk and producing chunks.
 * Loaders handle file I/O and delegate parsing to IParser implementations.
 * Each loader supports specific file extensions.
 */
export interface ILoader {
  /**
   * List of file extensions this loader can process (e.g., [".md", ".pdf"]).
   * Used by LoaderFactory to select the appropriate loader for a file.
   */
  readonly supportedExtensions: string[];

  /**
   * Load a file and return its parsed chunks.
   * Reads the file content, delegates to a parser, and enriches chunks with metadata.
   * @param filePath - Absolute or relative path to the file to load
   * @returns Array of chunks extracted from the file
   */
  load(filePath: string): Promise<AnyChunk[]>;

  /**
   * Check if this loader can handle the given file.
   * Typically checks the file extension against supportedExtensions.
   * @param filePath - Path to the file to check
   * @returns True if the loader can process this file type
   */
  canHandle(filePath: string): boolean;
}
