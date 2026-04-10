import { IStorage } from "./IStorage"
import { AnyChunk } from "../types/Document"

/**
 * Base interface for content stores (DocumentStore and CodeKnowledgeStore).
 * Provides methods for indexing and managing content without exposing underlying storage details.
 */
export interface IContentStore extends IStorage {
  /**
   * Index content from a file.
   * @param filePath - The file path to index
   * @param chunks - The chunks to store
   */
  indexFile(filePath: string, chunks: AnyChunk[]): Promise<void>

  /**
   * Perform semantic search on stored content.
   * @param query - Search query text
   * @param topK - Maximum number of results to return
   */
  semanticSearch(query: string, topK?: number): Promise<any[]>
}
