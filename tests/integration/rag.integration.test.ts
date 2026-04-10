/**
 * Integration tests for the RAG pipeline.
 * These tests use real parsers/retrievers but mock the vector store and LLM.
 */

import { SemanticDocumentParser } from "@/parsers/SemanticDocumentParser"
import { CodeStructuralParser } from "@/parsers/CodeStructuralParser"
import { ContextBuilder } from "@/rag/ContextBuilder"
import { QueryClassifier } from "@/rag/QueryClassifier"
import { HybridRetriever } from "@/retrievers/HybridRetriever"
import { IRetriever } from "@/core/interfaces/IRetriever"
import { RetrievedChunk } from "@/core/types/QueryResult"
import { LanguageRegistry } from "@/parsers/languages/LanguageRegistry"
import { ILanguageStrategy, SymbolInfo } from "@/parsers/languages/ILanguageStrategy"

class MockTypeScriptStrategy implements ILanguageStrategy {
  readonly language = "typescript"
  readonly extensions = [".ts", ".tsx", ".js", ".jsx"] as const

  extract(source: string, ext?: string): SymbolInfo[] {
    const symbols: SymbolInfo[] = []

    if (source.includes("class DataService")) {
      symbols.push({
        name: "DataService",
        type: "class",
        startLine: 1,
        endLine: 3,
        content: source,
        signature: "export class DataService",
      })
    }

    return symbols
  }
}

function makeRetriever(chunks: RetrievedChunk[]): IRetriever {
  return { retrieve: async () => chunks }
}

describe("RAG Pipeline integration", () => {
  it("parses markdown and builds context for a doc query", async () => {
    const parser = new SemanticDocumentParser(500, 50)
    const content = `# Overview\n\nThis system is a RAG pipeline.\n\n## Features\n\nSupports docs and code.`
    const chunks = await parser.parse(content, "overview.md")

    expect(chunks.length).toBeGreaterThan(0)
    expect(chunks[0].content).toContain("RAG pipeline")

    const retrieved: RetrievedChunk[] = chunks.map((c) => ({
      chunk: c,
      score: 0.9,
      storeType: "document" as const,
    }))

    const builder = new ContextBuilder()
    const context = builder.build(retrieved)
    expect(context).toContain("overview.md")
    expect(context).toContain("RAG pipeline")
  })

  it("parses TypeScript code and builds context for a code query", async () => {
    const mockRegistry = LanguageRegistry.create([new MockTypeScriptStrategy()])
    const parser = new CodeStructuralParser(mockRegistry)
    const code = `export class DataService {\n  async fetchData(id: string): Promise<string> {\n    return \`data-\${id}\`;\n  }\n}`
    const chunks = await parser.parse(code, "service.ts")

    expect(chunks.length).toBeGreaterThan(0)
    const clsChunk = chunks.find((c) => c.metadata.symbolName === "DataService")
    expect(clsChunk).toBeDefined()

    const retrieved: RetrievedChunk[] = chunks.map((c) => ({
      chunk: c,
      score: 0.85,
      storeType: "code" as const,
    }))

    const builder = new ContextBuilder()
    const context = builder.build(retrieved)
    expect(context).toContain("CODE")
    expect(context).toContain("DataService")
  })

  it("HybridRetriever merges and sorts by score", async () => {
    const docChunks: RetrievedChunk[] = [
      {
        chunk: {
          id: "d1",
          content: "Doc chunk",
          metadata: { source: "a.md", type: "markdown", chunkIndex: 0 },
        },
        score: 0.7,
        storeType: "document",
      },
    ]
    const codeChunks: RetrievedChunk[] = [
      {
        chunk: {
          id: "c1",
          content: "Code chunk",
          metadata: {
            source: "b.ts",
            type: "code",
            language: "typescript",
            symbolType: "function",
            symbolName: "foo",
            filePath: "b.ts",
            startLine: 1,
            endLine: 5,
            chunkIndex: 0,
          },
        },
        score: 0.9,
        storeType: "code",
      },
    ]

    const hybrid = new HybridRetriever(makeRetriever(docChunks), makeRetriever(codeChunks))
    const results = await hybrid.retrieve("test query", 4)

    expect(results.length).toBe(2)
    expect(results[0].score).toBeGreaterThanOrEqual(results[1].score)
  })

  it("QueryClassifier routes correctly end-to-end", () => {
    const classifier = new QueryClassifier()
    expect(classifier.classify("How is the fetchData function implemented?")).toBe("code")
    expect(classifier.classify("What does the installation guide say?")).toBe("document")
  })
})
