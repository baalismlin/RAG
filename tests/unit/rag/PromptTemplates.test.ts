import { SYSTEM_PROMPT, buildUserPrompt } from "@/rag/PromptTemplates"

describe("PromptTemplates", () => {
  describe("SYSTEM_PROMPT", () => {
    it("should be a non-empty string", () => {
      expect(SYSTEM_PROMPT).toBeTruthy()
      expect(typeof SYSTEM_PROMPT).toBe("string")
    })
  })

  describe("buildUserPrompt", () => {
    it("should build prompt for document queries", () => {
      const prompt = buildUserPrompt("test question", "test context", "document")

      expect(prompt).toContain("test question")
      expect(prompt).toContain("test context")
    })

    it("should build prompt for code queries", () => {
      const prompt = buildUserPrompt("test question", "test context", "code")

      expect(prompt).toContain("test question")
      expect(prompt).toContain("test context")
    })

    it("should build prompt for hybrid queries", () => {
      const prompt = buildUserPrompt("test question", "test context", "hybrid")

      expect(prompt).toContain("test question")
      expect(prompt).toContain("test context")
    })
  })
})
