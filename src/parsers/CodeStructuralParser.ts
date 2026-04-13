import { createHash } from "crypto"
import * as path from "path"
import { ICodeParser } from "@/core/interfaces/IParser"
import { CodeChunk } from "@/core/types/Document"
import { SymbolInfo } from "@/core/types/Parsers"
import { LanguageRegistry } from "./languages/LanguageRegistry"

function chunkId(source: string, qualifier: string): string {
  return createHash("sha256").update(`${source}::${qualifier}`).digest("hex").slice(0, 32)
}

const EXT_TO_LANGUAGE: Record<string, string> = {
  ".ts": "typescript",
  ".tsx": "typescript",
  ".js": "javascript",
  ".jsx": "javascript",
  ".py": "python",
}

export class CodeStructuralParser implements ICodeParser {
  readonly supportedLanguages = ["typescript", "javascript", "python"]
  private readonly registry: LanguageRegistry

  constructor(registry?: LanguageRegistry) {
    this.registry = registry ?? LanguageRegistry.getDefault()
  }

  async parse(content: string, source: string): Promise<CodeChunk[]> {
    const ext = path.extname(source).toLowerCase()
    const language = EXT_TO_LANGUAGE[ext] ?? "unknown"
    const strategy = this.registry.get(ext)

    let symbols: SymbolInfo[] = []
    if (strategy) {
      try {
        symbols = strategy.extract(content, ext)
      } catch (err) {
        console.warn(
          `[CodeStructuralParser] tree-sitter extraction failed for ${source}: ${String(err)}`
        )
      }
    }

    if (symbols.length === 0) {
      return this.fallbackChunk(content, source, language)
    }

    return symbols.map((sym, i) => ({
      id: chunkId(source, `${sym.name}::${sym.type}::${sym.startLine}`),
      content: sym.content,
      metadata: {
        source,
        type: "code" as const,
        language,
        symbolType: sym.type,
        symbolName: sym.name,
        filePath: source,
        startLine: sym.startLine,
        endLine: sym.endLine,
        chunkIndex: i,
        signature: sym.signature,
        docComment: sym.docComment,
        modifiers: sym.modifiers,
        parentName: sym.parentName,
      },
    }))
  }

  private fallbackChunk(content: string, source: string, language: string): CodeChunk[] {
    const MAX = 2000
    const chunks: CodeChunk[] = []
    let start = 0
    let idx = 0

    while (start < content.length) {
      const slice = content.slice(start, start + MAX)
      chunks.push({
        id: chunkId(source, `fallback::${idx}`),
        content: slice,
        metadata: {
          source,
          type: "code",
          language,
          symbolType: "other",
          symbolName: `chunk_${idx}`,
          filePath: source,
          startLine: start,
          endLine: start + slice.split("\n").length,
          chunkIndex: idx,
        },
      })
      start += MAX - 100
      idx++
    }

    return chunks
  }
}
