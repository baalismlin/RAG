import { RetrievedChunk, isCodeChunk, CodeMetadata } from "@/core/types"

const MAX_CONTEXT_CHARS = 6000

export class ContextBuilder {
  build(chunks: RetrievedChunk[]): string {
    const parts: string[] = []
    let totalChars = 0

    for (const { chunk, storeType } of chunks) {
      const header = this.buildHeader(
        chunk.id,
        storeType,
        chunk.metadata as unknown as Record<string, unknown>
      )
      const entry = `${header}\n${chunk.content}\n`

      if (totalChars + entry.length > MAX_CONTEXT_CHARS) break
      parts.push(entry)
      totalChars += entry.length
    }

    return parts.join("\n---\n")
  }

  private buildHeader(
    id: string,
    storeType: "document" | "code",
    metadata: Record<string, unknown>
  ): string {
    if (storeType === "code") {
      const symbolName = metadata.symbolName as string | undefined
      const symbolType = metadata.symbolType as string | undefined
      const filePath = metadata.filePath as string | undefined
      const startLine = metadata.startLine as number | undefined
      const endLine = metadata.endLine as number | undefined
      return `[CODE | ${symbolType ?? "symbol"}: ${symbolName ?? "unknown"} | ${filePath ?? ""}:${startLine ?? 0}-${endLine ?? 0}]`
    }

    const source = metadata.source as string | undefined
    const section = metadata.section as string | undefined
    return `[DOC | ${source ?? "unknown"}${section ? ` | section: ${section}` : ""}]`
  }
}
