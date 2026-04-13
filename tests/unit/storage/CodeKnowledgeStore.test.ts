import { CodeKnowledgeStore } from "@/storage/CodeKnowledgeStore"
import { IVectorStore } from "@/core/interfaces/IVectorStore"
import { ISymbolStore } from "@/core/interfaces/ISymbolStore"
import { IGraphStore } from "@/core/interfaces/IGraphStore"
import { AnyChunk, RetrievedChunk, CodeSymbol, SymbolRelation, CodeChunk } from "@/core/types"

describe("CodeKnowledgeStore", () => {
  let mockVectorStore: IVectorStore
  let mockSymbolStore: ISymbolStore
  let mockGraphStore: IGraphStore
  let codeStore: CodeKnowledgeStore

  beforeEach(() => {
    mockVectorStore = {
      addChunks: jest.fn(),
      similaritySearch: jest.fn(),
      deleteCollection: jest.fn(),
      deleteChunksBySource: jest.fn(),
      count: jest.fn(),
    } as unknown as IVectorStore

    mockSymbolStore = {
      upsertSymbols: jest.fn(),
      lookup: jest.fn(),
      deleteByFile: jest.fn(),
      deleteAll: jest.fn(),
    } as unknown as ISymbolStore

    mockGraphStore = {
      upsertRelations: jest.fn(),
      getOutgoing: jest.fn(),
      getIncoming: jest.fn(),
      traverse: jest.fn(),
      deleteByFile: jest.fn(),
      deleteAll: jest.fn(),
    } as unknown as IGraphStore

    codeStore = new CodeKnowledgeStore(mockVectorStore, mockSymbolStore, mockGraphStore)
  })

  describe("save", () => {
    it("should save chunks, symbols, and relations in parallel", async () => {
      const chunks: CodeChunk[] = [
        {
          id: "1",
          content: "code",
          metadata: {
            source: "test.ts",
            type: "code",
            language: "ts",
            symbolType: "function",
            symbolName: "test",
            filePath: "test.ts",
            chunkIndex: 0,
            startLine: 1,
            endLine: 5,
          },
        },
      ]
      const symbols: CodeSymbol[] = [{ id: "s1", name: "test", symbolType: "function", language: "ts", filePath: "test.ts", startLine: 1, endLine: 5, content: "" }]
      const relations: SymbolRelation[] = [{ fromSymbolId: "s1", toSymbolId: "s2", toSymbolName: "s2", relationType: "calls", filePath: "test.ts", lineNumber: 3 }]

      await codeStore.save(chunks, symbols, relations)

      expect(mockVectorStore.addChunks).toHaveBeenCalledWith(chunks)
      expect(mockSymbolStore.upsertSymbols).toHaveBeenCalledWith(symbols)
      expect(mockGraphStore.upsertRelations).toHaveBeenCalledWith(relations)
    })
  })

  describe("semanticSearch", () => {
    it("should delegate to vector store", async () => {
      const mockChunk: CodeChunk = {
        id: "1",
        content: "code",
        metadata: {
          source: "test.ts",
          type: "code",
          language: "ts",
          symbolType: "function",
          symbolName: "test",
          filePath: "test.ts",
          chunkIndex: 0,
          startLine: 1,
          endLine: 5,
        },
      }
      const mockResults: RetrievedChunk[] = [
        { chunk: mockChunk, score: 0.9, storeType: "code" },
      ]
      jest.mocked(mockVectorStore.similaritySearch).mockResolvedValue(mockResults)

      const results = await codeStore.semanticSearch("test", 5)

      expect(mockVectorStore.similaritySearch).toHaveBeenCalledWith("test", 5)
      expect(results).toEqual(mockResults)
    })
  })

  describe("deleteByFile", () => {
    it("should delete from all stores in parallel", async () => {
      await codeStore.deleteByFile("test.ts")

      expect(mockVectorStore.deleteChunksBySource).toHaveBeenCalledWith("test.ts")
      expect(mockSymbolStore.deleteByFile).toHaveBeenCalledWith("test.ts")
      expect(mockGraphStore.deleteByFile).toHaveBeenCalledWith("test.ts")
    })
  })

  describe("deleteAll", () => {
    it("should delete from all stores in parallel", async () => {
      await codeStore.deleteAll()

      expect(mockVectorStore.deleteCollection).toHaveBeenCalled()
      expect(mockSymbolStore.deleteAll).toHaveBeenCalled()
      expect(mockGraphStore.deleteAll).toHaveBeenCalled()
    })
  })
})
