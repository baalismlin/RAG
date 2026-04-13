import { createHash } from "crypto"
import { IDocumentParser } from "@/core/interfaces/IParser"
import { DocumentChunk, ParsedResult } from "@/core/types"

function chunkId(source: string, index: number): string {
  return createHash("sha256").update(`${source}::${index}`).digest("hex").slice(0, 32)
}

const DEFAULT_CHUNK_SIZE = 1000
const DEFAULT_CHUNK_OVERLAP = 200

export class SemanticDocumentParser implements IDocumentParser {
  private readonly chunkSize: number
  private readonly chunkOverlap: number

  constructor(chunkSize = DEFAULT_CHUNK_SIZE, chunkOverlap = DEFAULT_CHUNK_OVERLAP) {
    this.chunkSize = chunkSize
    this.chunkOverlap = chunkOverlap
  }

  async parse(content: string, source: string): Promise<ParsedResult> {
    const sections = this.splitBySections(content)
    const chunks: DocumentChunk[] = []

    for (const section of sections) {
      const sectionChunks = this.chunkText(section.content, section.heading)
      for (const chunkContent of sectionChunks) {
        chunks.push({
          id: chunkId(source, chunks.length),
          content: chunkContent,
          metadata: {
            source,
            type: "markdown",
            chunkIndex: chunks.length,
            section: section.heading,
          },
        })
      }
    }

    return { chunks: chunks.length > 0 ? chunks : this.fallbackChunk(content, source) }
  }

  private splitBySections(content: string): Array<{ heading: string; content: string }> {
    const lines = content.split("\n")
    const sections: Array<{ heading: string; content: string }> = []
    let currentHeading = ""
    let currentLines: string[] = []

    for (const line of lines) {
      const headingMatch = line.match(/^#{1,3}\s+(.+)/)
      if (headingMatch) {
        if (currentLines.length > 0) {
          sections.push({ heading: currentHeading, content: currentLines.join("\n").trim() })
        }
        currentHeading = headingMatch[1]
        currentLines = [line]
      } else {
        currentLines.push(line)
      }
    }

    if (currentLines.length > 0) {
      sections.push({ heading: currentHeading, content: currentLines.join("\n").trim() })
    }

    return sections.filter((s) => s.content.trim().length > 0)
  }

  private chunkText(text: string, section: string): string[] {
    if (text.length <= this.chunkSize) {
      return [text]
    }

    const chunks: string[] = []
    let start = 0

    while (start < text.length) {
      let end = start + this.chunkSize

      if (end < text.length) {
        const lastPeriod = text.lastIndexOf(".", end)
        const lastNewline = text.lastIndexOf("\n", end)
        const breakPoint = Math.max(lastPeriod, lastNewline)
        if (breakPoint > start + this.chunkSize * 0.5) {
          end = breakPoint + 1
        }
      }

      end = Math.min(end, text.length)
      const prefix = section ? `[${section}]\n` : ""
      chunks.push(prefix + text.slice(start, end).trim())
      if (end >= text.length) break
      start = end - this.chunkOverlap
    }

    return chunks.filter((c) => c.trim().length > 0)
  }

  private fallbackChunk(content: string, source: string): DocumentChunk[] {
    return [
      {
        id: chunkId(source, 0),
        content: content.slice(0, this.chunkSize),
        metadata: { source, type: "markdown", chunkIndex: 0 },
      },
    ]
  }
}
