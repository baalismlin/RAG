import { IRetriever } from "@/core/interfaces/IRetriever";
import { IVectorStore } from "@/core/interfaces/IVectorStore";
import { RetrievedChunk } from "@/core/types/QueryResult";

const DEFAULT_TOP_K = parseInt(process.env.TOP_K_DOCS ?? "4", 10);

export class DocumentRetriever implements IRetriever {
  private readonly store: IVectorStore;
  private readonly defaultTopK: number;

  constructor(store: IVectorStore, defaultTopK = DEFAULT_TOP_K) {
    this.store = store;
    this.defaultTopK = defaultTopK;
  }

  async retrieve(query: string, topK = this.defaultTopK): Promise<RetrievedChunk[]> {
    return this.store.similaritySearch(query, topK);
  }
}
