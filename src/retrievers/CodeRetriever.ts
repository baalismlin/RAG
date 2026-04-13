import { IRetriever } from "@/core/interfaces/IRetriever"
import { IVectorStore } from "@/core/interfaces/IVectorStore"
import { RetrievedChunk } from "@/core/types/QueryResult"
import { config } from "@/lib/config"

export class CodeRetriever implements IRetriever {
  private readonly store: IVectorStore
  private readonly defaultTopK: number

  constructor(store: IVectorStore, defaultTopK = config.retrieval.topKCode) {
    this.store = store
    this.defaultTopK = defaultTopK
  }

  async retrieve(query: string, topK = this.defaultTopK): Promise<RetrievedChunk[]> {
    return this.store.similaritySearch(query, topK)
  }
}
