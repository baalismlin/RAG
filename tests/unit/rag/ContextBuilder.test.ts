import { ContextBuilder } from "@/rag/ContextBuilder";
import { RetrievedChunk } from "@/core/types/QueryResult";

describe("ContextBuilder", () => {
  let builder: ContextBuilder;

  beforeEach(() => {
    builder = new ContextBuilder();
  });

  function makeDocChunk(id: string, content: string, source: string, section = ""): RetrievedChunk {
    return {
      chunk: {
        id,
        content,
        metadata: { source, type: "markdown" as const, chunkIndex: 0, section },
      },
      score: 0.9,
      storeType: "document",
    };
  }

  function makeCodeChunk(id: string, content: string, filePath: string, symbolName: string): RetrievedChunk {
    return {
      chunk: {
        id,
        content,
        metadata: {
          source: filePath,
          type: "code" as const,
          language: "typescript",
          symbolType: "function" as const,
          symbolName,
          filePath,
          startLine: 1,
          endLine: 10,
          chunkIndex: 0,
        },
      },
      score: 0.85,
      storeType: "code",
    };
  }

  it("builds a context string from document chunks", () => {
    const chunks = [makeDocChunk("1", "Some documentation text.", "readme.md", "Overview")];
    const context = builder.build(chunks);

    expect(context).toContain("DOC");
    expect(context).toContain("readme.md");
    expect(context).toContain("Some documentation text.");
  });

  it("builds a context string from code chunks", () => {
    const chunks = [makeCodeChunk("1", "function greet() {}", "src/utils.ts", "greet")];
    const context = builder.build(chunks);

    expect(context).toContain("CODE");
    expect(context).toContain("greet");
    expect(context).toContain("src/utils.ts");
  });

  it("returns empty string for empty chunks", () => {
    const context = builder.build([]);
    expect(context).toBe("");
  });

  it("respects max context length", () => {
    const bigChunks = Array.from({ length: 20 }, (_, i) =>
      makeDocChunk(String(i), "X".repeat(500), `doc${i}.md`)
    );
    const context = builder.build(bigChunks);
    expect(context.length).toBeLessThanOrEqual(7000);
  });

  it("joins multiple chunks with separator", () => {
    const chunks = [
      makeDocChunk("1", "First chunk.", "a.md"),
      makeDocChunk("2", "Second chunk.", "b.md"),
    ];
    const context = builder.build(chunks);
    expect(context).toContain("---");
  });
});
