import { IVectorStore } from "@/core/interfaces/IVectorStore"
import { IEmbedding } from "@/core/interfaces/IEmbedding"
import { ChromaDocumentStore } from "./ChromaDocumentStore"
import { ChromaCodeStore } from "./ChromaCodeStore"

export class VectorStoreFactory {
  static createDocumentStore(embedding: IEmbedding): IVectorStore {
    return new ChromaDocumentStore(embedding)
  }

  static createCodeStore(embedding: IEmbedding): IVectorStore {
    return new ChromaCodeStore(embedding)
  }
}
