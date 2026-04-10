import { RetrievedChunk } from "../types/QueryResult"

/**
 * Retriever interface for fetching relevant chunks from a vector store.
 * Different implementations may target different indices (documents, code, or hybrid).
 */
export interface IRetriever {
  /**
   * Retrieve the most relevant chunks for a given query.
   * Performs vector similarity search and returns scored results.
   * @param query - Search query text
   * @param topK - Maximum number of results to return (default varies by implementation)
   * @returns Array of retrieved chunks with similarity scores
   */
  retrieve(query: string, topK?: number): Promise<RetrievedChunk[]>
}

/**
 * Retriever with reranking capability.
 * Retrieves a larger initial set, then re-scores using a more sophisticated method
 * (e.g., cross-encoder or token overlap) to improve precision.
 */
export interface IRerankRetriever extends IRetriever {
  /**
   * Retrieve and rerank chunks for a query.
   * First retrieves a larger set, then applies reranking to return the best results.
   * @param query - Search query text
   * @param topK - Final number of results to return after reranking
   * @param rerankTopK - Number of candidates to retrieve before reranking (typically > topK)
   * @returns Reranked array of retrieved chunks with scores
   */
  retrieveAndRerank(query: string, topK?: number, rerankTopK?: number): Promise<RetrievedChunk[]>
}
