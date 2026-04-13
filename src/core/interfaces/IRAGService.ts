import { QueryResult, ChatMessage } from "../types"

/**
 * RAG (Retrieval-Augmented Generation) service interface.
 * The main entry point for querying documents and code with natural language.
 * Orchestrates retrieval, context building, and LLM generation.
 */
export interface IRAGService {
  /**
   * Execute a RAG query against the indexed documents and code.
   * The service will retrieve relevant chunks, build context, and generate an answer.
   * @param question - The user's natural language question
   * @param history - Optional conversation history for multi-turn conversations
   * @returns Query result containing the answer, retrieved chunks, and metadata
   */
  query(question: string, history?: ChatMessage[]): Promise<QueryResult>
}
