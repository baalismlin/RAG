import { createHash } from "crypto"
import * as path from "path"
import { CodeSymbol, SymbolRelation, SymbolKind } from "@/core/types/CodeKnowledge"

function symbolId(filePath: string, name: string, type: string, startLine: number): string {
  return createHash("sha256")
    .update(`${filePath}::${name}::${type}::${startLine}`)
    .digest("hex")
    .slice(0, 32)
}

interface RawSymbol {
  name: string
  type: SymbolKind
  startLine: number
  endLine: number
  content: string
  signature?: string
}

export class RelationExtractor {
  extract(
    content: string,
    filePath: string
  ): { symbols: CodeSymbol[]; relations: SymbolRelation[] } {
    const language = this.detectLanguage(filePath)
    const rawSymbols =
      language === "python" ? this.extractPythonSymbols(content) : this.extractJsTsSymbols(content)

    const symbols: CodeSymbol[] = rawSymbols.map((s) => ({
      id: symbolId(filePath, s.name, s.type, s.startLine),
      name: s.name,
      symbolType: s.type,
      language,
      filePath,
      startLine: s.startLine,
      endLine: s.endLine,
      content: s.content,
      signature: s.signature,
    }))

    const relations: SymbolRelation[] =
      language === "python"
        ? this.extractPythonRelations(content, filePath, symbols)
        : this.extractJsTsRelations(content, filePath, symbols)

    return { symbols, relations }
  }

  private detectLanguage(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase()
    const map: Record<string, string> = {
      ".ts": "typescript",
      ".tsx": "typescript",
      ".js": "javascript",
      ".jsx": "javascript",
      ".py": "python",
    }
    return map[ext] ?? "unknown"
  }

  private extractJsTsSymbols(content: string): RawSymbol[] {
    const symbols: RawSymbol[] = []
    const lines = content.split("\n")

    const patterns: Array<{ regex: RegExp; type: SymbolKind; nameGroup: number }> = [
      {
        regex: /^export\s+(?:default\s+)?(?:abstract\s+)?class\s+(\w+)/,
        type: "class",
        nameGroup: 1,
      },
      { regex: /^class\s+(\w+)/, type: "class", nameGroup: 1 },
      { regex: /^export\s+(?:default\s+)?interface\s+(\w+)/, type: "interface", nameGroup: 1 },
      { regex: /^interface\s+(\w+)/, type: "interface", nameGroup: 1 },
      {
        regex: /^export\s+(?:default\s+)?(?:async\s+)?function\s*\*?\s*(\w+)/,
        type: "function",
        nameGroup: 1,
      },
      { regex: /^(?:async\s+)?function\s*\*?\s*(\w+)/, type: "function", nameGroup: 1 },
      {
        regex: /^export\s+(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\(/,
        type: "function",
        nameGroup: 1,
      },
      { regex: /^(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\(/, type: "function", nameGroup: 1 },
      { regex: /^export\s+(?:const|let|var)\s+(\w+)/, type: "variable", nameGroup: 1 },
    ]

    let i = 0
    while (i < lines.length) {
      const line = lines[i].trim()
      let matched = false
      for (const { regex, type, nameGroup } of patterns) {
        const m = line.match(regex)
        if (m) {
          const name = m[nameGroup]
          const startLine = i + 1
          const endLine = this.findBlockEnd(lines, i)
          const blockContent = lines.slice(i, endLine).join("\n")
          symbols.push({ name, type, startLine, endLine, content: blockContent, signature: line })
          i = endLine
          matched = true
          break
        }
      }
      if (!matched) i++
    }
    return symbols
  }

  private extractPythonSymbols(content: string): RawSymbol[] {
    const symbols: RawSymbol[] = []
    const lines = content.split("\n")
    let i = 0
    while (i < lines.length) {
      const line = lines[i]
      const classMatch = line.match(/^class\s+(\w+)/)
      const funcMatch = line.match(/^def\s+(\w+)/)
      if (classMatch ?? funcMatch) {
        const name = (classMatch ?? funcMatch)![1]
        const type: SymbolKind = classMatch ? "class" : "function"
        const startLine = i + 1
        const endLine = this.findPythonBlockEnd(lines, i)
        symbols.push({
          name,
          type,
          startLine,
          endLine,
          content: lines.slice(i, endLine).join("\n"),
          signature: line.trim(),
        })
        i = endLine
      } else {
        i++
      }
    }
    return symbols
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

  private findBlockEnd(lines: string[], startIdx: number): number {
    let depth = 0
    let foundOpen = false
    for (let i = startIdx; i < lines.length; i++) {
      for (const ch of lines[i]) {
        if (ch === "{") {
          depth++
          foundOpen = true
        } else if (ch === "}") depth--
      }
      if (foundOpen && depth === 0) return i + 1
    }
    return Math.min(startIdx + 50, lines.length)
  }

  private findPythonBlockEnd(lines: string[], startIdx: number): number {
    const baseIndent = lines[startIdx].match(/^(\s*)/)?.[1].length ?? 0
    for (let i = startIdx + 1; i < lines.length; i++) {
      if (lines[i].trim() === "") continue
      const indent = lines[i].match(/^(\s*)/)?.[1].length ?? 0
      if (indent <= baseIndent) return i
    }
    return lines.length
  }
}
