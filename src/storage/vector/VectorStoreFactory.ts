import { IVectorStore } from "@/core/interfaces/IVectorStore"
import { IEmbedding } from "@/core/interfaces/IEmbedding"
import { ChromaDocumentVectorStore } from "./ChromaDocumentStore"
import { ChromaCodeVectorStore } from "./ChromaCodeStore"

/**
 * Factory for creating vector store instances.
 */
export class VectorStoreFactory {
  static createDocumentStore(embedding: IEmbedding): IVectorStore {
    return new ChromaDocumentVectorStore(embedding)
  }

  static createCodeStore(embedding: IEmbedding): IVectorStore {
    return new ChromaCodeVectorStore(embedding)
  }
}
