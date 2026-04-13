import { IStorage } from "./IStorage"
import { CodeSymbol, SymbolRelation, AnyChunk, RetrievedChunk } from "../types"

/**
 * Base interface for content stores (DocumentStore and CodeKnowledgeStore).
 * Provides methods for indexing and managing content without exposing underlying storage details.
 */
export interface IContentStore extends IStorage {
  /**
   * Index content from a file.
   * @param chunks - The chunks to store
   * @param symbols - Optional symbols to store (for code stores)
   * @param relations - Optional relations to store (for code stores)
   */
  save(
    chunks: AnyChunk[],
    symbols?: CodeSymbol[],
    relations?: SymbolRelation[]
  ): Promise<void>

  /**
   * Perform semantic search on stored content.
   * @param query - Search query text
   * @param topK - Maximum number of results to return
   */
  semanticSearch(query: string, topK?: number): Promise<RetrievedChunk[]>
}
