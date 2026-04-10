import { IContentStore } from "@/core/interfaces/IContentStore"
import { IVectorStore } from "@/core/interfaces/IVectorStore"
import { AnyChunk } from "@/core/types/Document"
import { RetrievedChunk } from "@/core/types/QueryResult"
import { CodeSymbol, SymbolRelation } from "@/core/types/CodeKnowledge"

export class DocumentStore implements IContentStore {
  constructor(private readonly vectorStore: IVectorStore) {}

  async indexFile(
    filePath: string,
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
