import { RAGService } from "@/rag/RAGService"
import { IRetriever } from "@/core/interfaces/IRetriever"
import { QueryResult, ChatMessage, RetrievedChunk } from "@/core/types"

describe("RAGService", () => {
  let ragService: RAGService
  let mockDocRetriever: IRetriever
  let mockCodeRetriever: IRetriever
  let mockHybridRetriever: IRetriever

  beforeEach(() => {
    mockDocRetriever = {
      retrieve: jest.fn(),
    } as unknown as IRetriever

    mockCodeRetriever = {
      retrieve: jest.fn(),
    } as unknown as IRetriever

    mockHybridRetriever = {
      retrieve: jest.fn(),
    } as unknown as IRetriever

    ragService = new RAGService({
      docRetriever: mockDocRetriever,
      codeRetriever: mockCodeRetriever,
      hybridRetriever: mockHybridRetriever,
    })
  })

  describe("query", () => {
    it("should classify and route document queries", async () => {
      const mockChunks: RetrievedChunk[] = []
      jest.mocked(mockDocRetriever.retrieve).mockResolvedValue(mockChunks)

      // Mock fetch for LLM call
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ message: { content: "test answer" } }),
      } as Response)

      const result = await ragService.query("What is this project about?")

      expect(result.queryType).toBe("document")
      expect(mockDocRetriever.retrieve).toHaveBeenCalled()
    })

    it("should classify and route code queries", async () => {
      const mockChunks: RetrievedChunk[] = []
      jest.mocked(mockCodeRetriever.retrieve).mockResolvedValue(mockChunks)

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ message: { content: "test answer" } }),
      } as Response)

      const result = await ragService.query("What does the function do?")

      expect(result.queryType).toBe("code")
      expect(mockCodeRetriever.retrieve).toHaveBeenCalled()
    })
  })
})
