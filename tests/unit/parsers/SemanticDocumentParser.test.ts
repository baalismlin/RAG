import { SemanticDocumentParser } from "@/parsers/SemanticDocumentParser"
import { DocumentChunk } from "@/core/types"

describe("SemanticDocumentParser", () => {
  let parser: SemanticDocumentParser

  beforeEach(() => {
    parser = new SemanticDocumentParser(200, 20)
  })

  it("parses a simple markdown document into chunks", async () => {
    const content = `# Introduction\n\nThis is the introduction section.\n\n## Details\n\nHere are the details of the system.`
    const { chunks } = await parser.parse(content, "test.md")
    const docChunks = chunks as DocumentChunk[]

    expect(docChunks.length).toBeGreaterThan(0)
    expect(docChunks[0].metadata.source).toBe("test.md")
    expect(docChunks[0].metadata.type).toBe("markdown")
  })

  it("assigns correct section metadata from headings", async () => {
    const content = `# Overview\n\nSome overview text.\n\n## Architecture\n\nArchitecture details here.`
    const { chunks } = await parser.parse(content, "doc.md")
    const docChunks = chunks as DocumentChunk[]

    const sections = docChunks.map((c) => c.metadata.section)
    expect(sections.some((s) => s === "Overview" || s === "Architecture")).toBe(true)
  })

  it("splits long content into multiple chunks", async () => {
    const longContent = "A".repeat(600)
    const { chunks } = await parser.parse(longContent, "long.md")
    const docChunks = chunks as DocumentChunk[]

    expect(docChunks.length).toBeGreaterThan(1)
  })

  it("assigns sequential chunkIndex values", async () => {
    const content = `# Section\n\n${"Word ".repeat(100)}`
    const { chunks } = await parser.parse(content, "indexed.md")
    const docChunks = chunks as DocumentChunk[]

    docChunks.forEach((chunk, i) => {
      expect(chunk.metadata.chunkIndex).toBe(i)
    })
  })

  it("returns at least one chunk for empty-ish content", async () => {
    const { chunks } = await parser.parse("Hello world", "minimal.md")
    const docChunks = chunks as DocumentChunk[]
    expect(docChunks.length).toBeGreaterThanOrEqual(1)
  })
})
