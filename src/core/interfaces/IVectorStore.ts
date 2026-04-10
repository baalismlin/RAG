import { IStorage } from "./IStorage"
import { AnyChunk } from "../types/Document"
import { RetrievedChunk } from "../types/QueryResult"

/**
 * Vector store interface for managing document/code embeddings.
 * Provides methods for adding, searching, and deleting chunks in a vector database.
 */
export interface IVectorStore extends IStorage {
  /**
   * Add or update chunks in the vector store.
   * Uses upsert semantics — existing chunks with matching IDs are replaced.
   * @param chunks - Array of chunks to add/update
   */
  addChunks(chunks: AnyChunk[]): Promise<void>

  /**
   * Perform similarity search to find the most relevant chunks for a query.
   * @param query - Search query text
   * @param topK - Maximum number of results to return
   * @returns Array of retrieved chunks with similarity scores
   */
  similaritySearch(query: string, topK: number): Promise<RetrievedChunk[]>

  /**
   * Delete the entire collection from the vector store.
   * This is a destructive operation that removes all data.
   */
  deleteCollection(): Promise<void>

  /**
   * Delete all chunks associated with a specific source file path.
   * Used during incremental sync to remove stale chunks when a file changes or is deleted.
   * @param source - The source file path to delete chunks for
   */
  deleteChunksBySource(source: string): Promise<void>
}
