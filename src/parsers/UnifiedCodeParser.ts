import * as fs from "fs/promises"
import * as path from "path"
import { createHash } from "crypto"
import { v4 as uuidv4 } from "uuid"
import { LanguageRegistry } from "./languages/LanguageRegistry"
import { CodeChunk } from "@/core/types/Document"
import { CodeSymbol, SymbolRelation, SymbolKind } from "@/core/types/CodeKnowledge"
import { SymbolInfo } from "./languages/ILanguageStrategy"

export interface ParsedCode {
  chunks: CodeChunk[]
  symbols: CodeSymbol[]
  relations: SymbolRelation[]
}

function symbolId(filePath: string, name: string, type: string, startLine: number): string {
  return createHash("sha256")
    .update(`${filePath}::${name}::${type}::${startLine}`)
    .digest("hex")
    .slice(0, 32)
}

export class UnifiedCodeParser {
  private readonly languageRegistry = LanguageRegistry.getDefault()

  async parse(filePath: string): Promise<ParsedCode> {
    const content = await fs.readFile(filePath, "utf-8")
    const ext = path.extname(filePath).toLowerCase()
    const language = this.detectLanguage(ext)

    const strategy = this.languageRegistry.get(ext)
    const symbolInfos = strategy ? strategy.extract(content, ext) : []

    const symbols: CodeSymbol[] = symbolInfos.map((info: SymbolInfo) => ({
      id: symbolId(filePath, info.name, info.type, info.startLine),
      name: info.name,
      symbolType: info.type as SymbolKind,
      language,
      filePath,
      startLine: info.startLine,
      endLine: info.endLine,
      content: info.content,
    }))

    const chunks = this.createChunks(content, filePath, language, symbols)
    const relations = this.extractRelations(content, filePath, symbols, language)

    return { chunks, symbols, relations }
  }

  private detectLanguage(ext: string): string {
    const map: Record<string, string> = {
      ".ts": "typescript",
      ".tsx": "typescript",
      ".js": "javascript",
      ".jsx": "javascript",
      ".py": "python",
    }
    return map[ext] ?? "unknown"
  }

  private createChunks(
    content: string,
    filePath: string,
    language: string,
    symbols: CodeSymbol[]
  ): CodeChunk[] {
    const lines = content.split("\n")
    const chunks: CodeChunk[] = []
    const chunkSize = 50

    if (symbols.length === 0) {
      // No symbols found, chunk by line count
      for (let i = 0; i < lines.length; i += chunkSize) {
        const chunkLines = lines.slice(i, i + chunkSize)
        chunks.push({
          id: uuidv4(),
          content: chunkLines.join("\n"),
          metadata: {
            source: filePath,
            type: "code",
            language,
            symbolType: "other",
            symbolName: "",
            filePath,
            chunkIndex: chunks.length,
            startLine: i + 1,
            endLine: Math.min(i + chunkSize, lines.length),
          },
        })
      }
      return chunks
    }

    // Chunk by symbols
    for (const symbol of symbols) {
      const symbolLines = lines.slice(symbol.startLine - 1, symbol.endLine)
      chunks.push({
        id: uuidv4(),
        content: symbolLines.join("\n"),
        metadata: {
          source: filePath,
          type: "code",
          language,
          symbolType: symbol.symbolType,
          symbolName: symbol.name,
          filePath,
          chunkIndex: chunks.length,
          startLine: symbol.startLine,
          endLine: symbol.endLine,
        },
      })
    }

    // Add remaining lines as chunks
    const coveredRanges = symbols.map((s) => ({ start: s.startLine, end: s.endLine }))
    let currentLine = 1
    for (let i = 0; i < lines.length; i += chunkSize) {
      const start = i + 1
      const end = Math.min(i + chunkSize, lines.length)

      // Skip if this range overlaps with any symbol
      const overlaps = coveredRanges.some((r) => start <= r.end && end >= r.start)

      if (!overlaps) {
        const chunkLines = lines.slice(start - 1, end)
        if (chunkLines.length > 0) {
          chunks.push({
            id: uuidv4(),
            content: chunkLines.join("\n"),
            metadata: {
              source: filePath,
              type: "code",
              language,
              symbolType: "other",
              symbolName: "",
              filePath,
              chunkIndex: chunks.length,
              startLine: start,
              endLine: end,
            },
          })
        }
      }
    }

    return chunks
  }

  private extractRelations(
    content: string,
    filePath: string,
    symbols: CodeSymbol[],
    language: string
  ): SymbolRelation[] {
    const relations: SymbolRelation[] = []
    const lines = content.split("\n")
    const symbolByName = new Map(symbols.map((s) => [s.name, s]))

    if (language === "python") {
      return this.extractPythonRelations(content, filePath, symbols)
    }

    return this.extractJsTsRelations(content, filePath, symbols)
  }

  private extractJsTsRelations(
    content: string,
    filePath: string,
    symbols: CodeSymbol[]
  ): SymbolRelation[] {
    const relations: SymbolRelation[] = []
    const lines = content.split("\n")
    const symbolByName = new Map(symbols.map((s) => [s.name, s]))

    lines.forEach((line, idx) => {
      const lineNo = idx + 1
      const trimmed = line.trim()

      const importMatch = trimmed.match(
        /^import\s+(?:type\s+)?(?:\{([^}]+)\}|(\w+))\s+from\s+['"]([^'"]+)['"]/
      )
      if (importMatch) {
        const names = importMatch[1]
          ? importMatch[1]
              .split(",")
              .map((n) => n.trim().replace(/\s+as\s+\w+$/, ""))
              .filter(Boolean)
          : [importMatch[2]]
        for (const name of names) {
          const src = symbols[0]
          if (src) {
            relations.push({
              fromSymbolId: src.id,
              toSymbolName: name,
              toSymbolId: symbolByName.get(name)?.id,
              relationType: "imports",
              filePath,
              lineNumber: lineNo,
            })
          }
        }
      }

      const extendsMatch = trimmed.match(
        /^(?:export\s+)?(?:abstract\s+)?class\s+(\w+)\s+extends\s+(\w+)/
      )
      if (extendsMatch) {
        const child = symbolByName.get(extendsMatch[1])
        if (child) {
          relations.push({
            fromSymbolId: child.id,
            toSymbolName: extendsMatch[2],
            toSymbolId: symbolByName.get(extendsMatch[2])?.id,
            relationType: "extends",
            filePath,
            lineNumber: lineNo,
          })
        }
      }

      const implementsMatch = trimmed.match(
        /^(?:export\s+)?(?:abstract\s+)?class\s+(\w+).*implements\s+(.+?)(?:\s*\{|$)/
      )
      if (implementsMatch) {
        const child = symbolByName.get(implementsMatch[1])
        if (child) {
          const ifaces = implementsMatch[2]
            .split(",")
            .map((n) => n.trim())
            .filter(Boolean)
          for (const iface of ifaces) {
            relations.push({
              fromSymbolId: child.id,
              toSymbolName: iface,
              toSymbolId: symbolByName.get(iface)?.id,
              relationType: "implements",
              filePath,
              lineNumber: lineNo,
            })
          }
        }
      }

      const callMatch = trimmed.match(/\bnew\s+(\w+)\s*\(/g)
      if (callMatch) {
        const ownerSymbol = this.findOwningSymbol(symbols, lineNo)
        if (ownerSymbol) {
          for (const m of callMatch) {
            const name = m.match(/new\s+(\w+)/)![1]
            relations.push({
              fromSymbolId: ownerSymbol.id,
              toSymbolName: name,
              toSymbolId: symbolByName.get(name)?.id,
              relationType: "calls",
              filePath,
              lineNumber: lineNo,
            })
          }
        }
      }
    })

    return relations
  }

  private extractPythonRelations(
    content: string,
    filePath: string,
    symbols: CodeSymbol[]
  ): SymbolRelation[] {
    const relations: SymbolRelation[] = []
    const lines = content.split("\n")
    const symbolByName = new Map(symbols.map((s) => [s.name, s]))

    lines.forEach((line, idx) => {
      const lineNo = idx + 1
      const trimmed = line.trim()

      const importMatch = trimmed.match(/^from\s+\S+\s+import\s+(.+)/)
      if (importMatch && symbols[0]) {
        const names = importMatch[1]
          .split(",")
          .map((n) => n.trim())
          .filter(Boolean)
        for (const name of names) {
          relations.push({
            fromSymbolId: symbols[0].id,
            toSymbolName: name,
            toSymbolId: symbolByName.get(name)?.id,
            relationType: "imports",
            filePath,
            lineNumber: lineNo,
          })
        }
      }

      const classMatch = trimmed.match(/^class\s+(\w+)\s*\(([^)]+)\)/)
      if (classMatch) {
        const child = symbolByName.get(classMatch[1])
        if (child) {
          const bases = classMatch[2]
            .split(",")
            .map((n) => n.trim())
            .filter((n) => n !== "object")
          for (const base of bases) {
            relations.push({
              fromSymbolId: child.id,
              toSymbolName: base,
              toSymbolId: symbolByName.get(base)?.id,
              relationType: "extends",
              filePath,
              lineNumber: lineNo,
            })
          }
        }
      }
    })

    return relations
  }

  private findOwningSymbol(symbols: CodeSymbol[], lineNo: number): CodeSymbol | undefined {
    return symbols
      .filter((s) => s.startLine <= lineNo && s.endLine >= lineNo)
      .sort((a, b) => b.startLine - a.startLine)[0]
  }
}
