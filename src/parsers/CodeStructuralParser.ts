import { createHash } from "crypto";
import * as path from "path";
import { ICodeParser } from "@/core/interfaces/IParser";
import { CodeChunk, CodeMetadata } from "@/core/types/Document";

function chunkId(source: string, qualifier: string): string {
  return createHash("sha256").update(`${source}::${qualifier}`).digest("hex").slice(0, 32);
}

interface ParsedSymbol {
  name: string;
  type: CodeMetadata["symbolType"];
  content: string;
  startLine: number;
  endLine: number;
}

export class CodeStructuralParser implements ICodeParser {
  readonly supportedLanguages = ["typescript", "javascript", "python"];

  async parse(content: string, source: string): Promise<CodeChunk[]> {
    const language = this.detectLanguage(source);
    const symbols = this.extractSymbols(content, language);

    if (symbols.length === 0) {
      return this.fallbackChunk(content, source, language);
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
      },
    }));
  }

  private detectLanguage(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const map: Record<string, string> = {
      ".ts": "typescript",
      ".tsx": "typescript",
      ".js": "javascript",
      ".jsx": "javascript",
      ".py": "python",
    };
    return map[ext] ?? "unknown";
  }

  private extractSymbols(content: string, language: string): ParsedSymbol[] {
    if (language === "python") {
      return this.extractPythonSymbols(content);
    }
    return this.extractJsTsSymbols(content);
  }

  private extractJsTsSymbols(content: string): ParsedSymbol[] {
    const symbols: ParsedSymbol[] = [];
    const lines = content.split("\n");

    const patterns: Array<{ regex: RegExp; type: CodeMetadata["symbolType"] }> = [
      { regex: /^export\s+(default\s+)?(abstract\s+)?class\s+(\w+)/, type: "class" },
      { regex: /^class\s+(\w+)/, type: "class" },
      { regex: /^export\s+(default\s+)?interface\s+(\w+)/, type: "interface" },
      { regex: /^interface\s+(\w+)/, type: "interface" },
      { regex: /^export\s+(default\s+)?(async\s+)?function\s*\*?\s*(\w+)/, type: "function" },
      { regex: /^(async\s+)?function\s*\*?\s*(\w+)/, type: "function" },
      { regex: /^export\s+(const|let|var)\s+(\w+)\s*=\s*(async\s+)?\(/, type: "function" },
      { regex: /^(const|let|var)\s+(\w+)\s*=\s*(async\s+)?\(/, type: "function" },
      { regex: /^export\s+(const|let|var)\s+(\w+)/, type: "variable" },
    ];

    let i = 0;
    while (i < lines.length) {
      const line = lines[i].trim();
      let matched = false;

      for (const { regex, type } of patterns) {
        const m = line.match(regex);
        if (m) {
          const name = m[m.length - 1];
          const startLine = i + 1;
          const endLine = this.findBlockEnd(lines, i);
          const blockContent = lines.slice(i, endLine).join("\n");
          symbols.push({ name, type, content: blockContent, startLine, endLine });
          i = endLine;
          matched = true;
          break;
        }
      }

      if (!matched) i++;
    }

    return symbols;
  }

  private extractPythonSymbols(content: string): ParsedSymbol[] {
    const symbols: ParsedSymbol[] = [];
    const lines = content.split("\n");

    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      const classMatch = line.match(/^class\s+(\w+)/);
      const funcMatch = line.match(/^def\s+(\w+)/);

      if (classMatch || funcMatch) {
        const name = (classMatch ?? funcMatch)![1];
        const type: CodeMetadata["symbolType"] = classMatch ? "class" : "function";
        const startLine = i + 1;
        const endLine = this.findPythonBlockEnd(lines, i);
        const blockContent = lines.slice(i, endLine).join("\n");
        symbols.push({ name, type, content: blockContent, startLine, endLine });
        i = endLine;
      } else {
        i++;
      }
    }

    return symbols;
  }

  private findBlockEnd(lines: string[], startIdx: number): number {
    let depth = 0;
    let foundOpen = false;

    for (let i = startIdx; i < lines.length; i++) {
      for (const ch of lines[i]) {
        if (ch === "{") { depth++; foundOpen = true; }
        else if (ch === "}") { depth--; }
      }
      if (foundOpen && depth === 0) return i + 1;
    }

    return Math.min(startIdx + 50, lines.length);
  }

  private findPythonBlockEnd(lines: string[], startIdx: number): number {
    const baseIndent = lines[startIdx].match(/^(\s*)/)?.[1].length ?? 0;

    for (let i = startIdx + 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim() === "") continue;
      const indent = line.match(/^(\s*)/)?.[1].length ?? 0;
      if (indent <= baseIndent) return i;
    }

    return lines.length;
  }

  private fallbackChunk(content: string, source: string, language: string): CodeChunk[] {
    const MAX = 2000;
    const chunks: CodeChunk[] = [];
    let start = 0;
    let idx = 0;

    while (start < content.length) {
      const slice = content.slice(start, start + MAX);
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
      });
      start += MAX - 100;
      idx++;
    }

    return chunks;
  }
}
