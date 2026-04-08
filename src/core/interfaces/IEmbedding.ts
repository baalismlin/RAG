/**
 * Embedding interface for converting text to vector representations.
 * Implementations can use local models (Ollama) or cloud APIs (OpenAI, etc.).
 */
export interface IEmbedding {
  /**
   * Generate a single embedding vector for a query text.
   * Used for similarity search queries.
   * @param text - Single text string to embed
   * @returns Embedding vector as an array of numbers
   */
  embedQuery(text: string): Promise<number[]>;

  /**
   * Generate embedding vectors for multiple documents.
   * Used for indexing batches of chunks.
   * @param texts - Array of text strings to embed
   * @returns Array of embedding vectors, one per input text
   */
  embedDocuments(texts: string[]): Promise<number[][]>;
}
