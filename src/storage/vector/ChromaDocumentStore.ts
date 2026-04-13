import { ChromaClient, Collection } from "chromadb"
import { IVectorStore } from "@/core/interfaces/IVectorStore"
import { IEmbedding } from "@/core/interfaces/IEmbedding"
import { AnyChunk, RetrievedChunk } from "@/core/types"
import { config } from "@/lib/config"

/**
 * ChromaDB implementation for document vector storage.
 * Implements IVectorStore interface for storing and retrieving document chunks.
 */
export class ChromaDocumentVectorStore implements IVectorStore {
  private readonly client: ChromaClient
  private collection: Collection | null = null
  private readonly collectionName: string
  private readonly embedding: IEmbedding

  constructor(
    embedding: IEmbedding,
    collectionName = config.chroma.docCollection,
    chromaUrl = config.chroma.url
  ) {
    this.client = new ChromaClient({ path: chromaUrl })
    this.collectionName = collectionName
    this.embedding = embedding
  }

  private async getCollection(): Promise<Collection> {
    if (!this.collection) {
      this.collection = await this.client.getOrCreateCollection({ name: this.collectionName })
    }
    return this.collection
  }

  async addChunks(chunks: AnyChunk[]): Promise<void> {
    if (chunks.length === 0) return
    const collection = await this.getCollection()

    const ids = chunks.map((c) => c.id)
    const documents = chunks.map((c) => c.content)
    const metadatas = chunks.map(
      (c) => c.metadata as unknown as Record<string, string | number | boolean>
    )
    const embeddings = await this.embedding.embedDocuments(documents)

    await collection.upsert({ ids, documents, metadatas, embeddings })
  }

  async similaritySearch(query: string, topK: number): Promise<RetrievedChunk[]> {
    const collection = await this.getCollection()
    const queryEmbedding = await this.embedding.embedQuery(query)

    const results = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: topK,
    })

    const retrieved: RetrievedChunk[] = []
    const ids = results.ids[0] ?? []
    const documents = results.documents[0] ?? []
    const metadatas = results.metadatas[0] ?? []
    const distances = results.distances?.[0] ?? []

    for (let i = 0; i < ids.length; i++) {
      retrieved.push({
        chunk: {
          id: ids[i],
          content: documents[i] ?? "",
          metadata: metadatas[i] as unknown as AnyChunk["metadata"],
        } as AnyChunk,
        score: 1 - (distances[i] ?? 0),
        storeType: "document",
      })
    }

    return retrieved
  }

  async deleteCollection(): Promise<void> {
    await this.client.deleteCollection({ name: this.collectionName })
    this.collection = null
  }

  async deleteAll(): Promise<void> {
    await this.deleteCollection()
  }

  async deleteChunksBySource(source: string): Promise<void> {
    const collection = await this.getCollection()
    await collection.delete({ where: { source } })
  }

  async deleteBySource(source: string): Promise<void> {
    await this.deleteChunksBySource(source)
  }

  async count(): Promise<number> {
    const collection = await this.getCollection()
    return collection.count()
  }
}
