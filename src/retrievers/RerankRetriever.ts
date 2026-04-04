import { IRetriever, IRerankRetriever } from "@/core/interfaces/IRetriever";
import { RetrievedChunk } from "@/core/types/QueryResult";

/**
 * Placeholder rerank retriever. Extends a base retriever by fetching more
 * candidates and re-ordering them. Replace `rerankScores` with a real
 * cross-encoder model call (e.g., via Ollama) for production use.
 */
export class RerankRetriever implements IRerankRetriever {
  private readonly baseRetriever: IRetriever;

  constructor(baseRetriever: IRetriever) {
    this.baseRetriever = baseRetriever;
  }

  async retrieve(query: string, topK = 4): Promise<RetrievedChunk[]> {
    return this.retrieveAndRerank(query, topK * 2, topK);
  }

  async retrieveAndRerank(query: string, topK = 8, rerankTopK = 4): Promise<RetrievedChunk[]> {
    const candidates = await this.baseRetriever.retrieve(query, topK);
    const reranked = await this.rerankScores(query, candidates);
    reranked.sort((a, b) => b.score - a.score);
    return reranked.slice(0, rerankTopK);
  }

  private async rerankScores(query: string, chunks: RetrievedChunk[]): Promise<RetrievedChunk[]> {
    const queryTokens = new Set(query.toLowerCase().split(/\s+/));
    return chunks.map((c) => {
      const contentTokens = c.chunk.content.toLowerCase().split(/\s+/);
      const overlap = contentTokens.filter((t) => queryTokens.has(t)).length;
      const boost = overlap / Math.max(queryTokens.size, 1);
      return { ...c, score: c.score * 0.7 + boost * 0.3 };
    });
  }
}
