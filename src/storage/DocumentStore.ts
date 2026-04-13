import { IContentStore } from "@/core/interfaces/IContentStore"
import { IVectorStore } from "@/core/interfaces/IVectorStore"
import { AnyChunk, RetrievedChunk, CodeSymbol, SymbolRelation } from "@/core/types"

/**
 * High-level document storage abstraction.
 * Wraps a vector store to provide document-specific storage operations.
 * Implements IContentStore interface.
 */
export class DocumentStore implements IContentStore {
  constructor(private readonly vectorStore: IVectorStore) {}

  async save(
    chunks: AnyChunk[],
    symbols?: CodeSymbol[],
    relations?: SymbolRelation[]
  ): Promise<void> {
    await this.vectorStore.addChunks(chunks)
  }

  async semanticSearch(query: string, topK = 5): Promise<RetrievedChunk[]> {
    return this.vectorStore.similaritySearch(query, topK)
  }

  async deleteBySource(source: string): Promise<void> {
    await this.vectorStore.deleteChunksBySource(source)
  }

  async deleteAll(): Promise<void> {
    await this.vectorStore.deleteCollection()
  }

  async count(): Promise<number> {
    return this.vectorStore.count()
  }
}
