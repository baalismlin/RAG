import { IRetriever } from "@/core/interfaces/IRetriever"
import { RetrievedChunk } from "@/core/types/QueryResult"

export class HybridRetriever implements IRetriever {
  private readonly docRetriever: IRetriever
  private readonly codeRetriever: IRetriever

  constructor(docRetriever: IRetriever, codeRetriever: IRetriever) {
    this.docRetriever = docRetriever
    this.codeRetriever = codeRetriever
  }

  async retrieve(query: string, topK = 4): Promise<RetrievedChunk[]> {
    const half = Math.ceil(topK / 2)
    const [docResults, codeResults] = await Promise.all([
      this.docRetriever.retrieve(query, half),
      this.codeRetriever.retrieve(query, half),
    ])

    const merged = [...docResults, ...codeResults]
    merged.sort((a, b) => b.score - a.score)
    return merged.slice(0, topK)
  }
}
