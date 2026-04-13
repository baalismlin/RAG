import { DocumentStore } from "@/storage/DocumentStore"
import { IVectorStore } from "@/core/interfaces/IVectorStore"
import { AnyChunk, RetrievedChunk, DocumentChunk } from "@/core/types"

describe("DocumentStore", () => {
  let mockVectorStore: IVectorStore
  let documentStore: DocumentStore

  beforeEach(() => {
    mockVectorStore = {
      addChunks: jest.fn(),
      similaritySearch: jest.fn(),
      deleteCollection: jest.fn(),
      deleteChunksBySource: jest.fn(),
      count: jest.fn(),
    } as unknown as IVectorStore

    documentStore = new DocumentStore(mockVectorStore)
  })

  describe("save", () => {
    it("should add chunks to vector store", async () => {
      const chunks: DocumentChunk[] = [
        {
          id: "1",
          content: "test content",
          metadata: {
            source: "test.txt",
            type: "markdown",
            title: "test",
            chunkIndex: 0,
          },
        },
      ]

      await documentStore.save(chunks)

      expect(mockVectorStore.addChunks).toHaveBeenCalledWith(chunks)
    })
  })

  describe("semanticSearch", () => {
    it("should delegate to vector store similarity search", async () => {
      const mockChunk: DocumentChunk = {
        id: "1",
        content: "result",
        metadata: {
          source: "test.txt",
          type: "markdown",
          title: "test",
          chunkIndex: 0,
        },
      }
      const mockResults: RetrievedChunk[] = [
        {
          chunk: mockChunk,
          score: 0.9,
          storeType: "document",
        },
      ]
      jest.mocked(mockVectorStore.similaritySearch).mockResolvedValue(mockResults)

      const results = await documentStore.semanticSearch("test query", 5)

      expect(mockVectorStore.similaritySearch).toHaveBeenCalledWith("test query", 5)
      expect(results).toEqual(mockResults)
    })
  })

  describe("deleteBySource", () => {
    it("should delegate to vector store deleteChunksBySource", async () => {
      await documentStore.deleteBySource("test.txt")

      expect(mockVectorStore.deleteChunksBySource).toHaveBeenCalledWith("test.txt")
    })
  })

  describe("deleteAll", () => {
    it("should delegate to vector store deleteCollection", async () => {
      await documentStore.deleteAll()

      expect(mockVectorStore.deleteCollection).toHaveBeenCalled()
    })
  })

  describe("count", () => {
    it("should delegate to vector store count", async () => {
      jest.mocked(mockVectorStore.count).mockResolvedValue(42)

      const count = await documentStore.count()

      expect(mockVectorStore.count).toHaveBeenCalled()
      expect(count).toBe(42)
    })
  })
})
