import * as fs from "fs/promises"
import * as path from "path"
import { v4 as uuidv4 } from "uuid"
import { ILoader } from "@/core/interfaces/ILoader"
import { CodeChunk } from "@/core/types/Document"
import { CodeStructuralParser } from "@/parsers/CodeStructuralParser"

const SUPPORTED_EXTENSIONS: Record<string, string> = {
  ".ts": "typescript",
  ".tsx": "typescript",
  ".js": "javascript",
  ".jsx": "javascript",
  ".py": "python",
}

export class CodeLoader implements ILoader {
  readonly supportedExtensions = Object.keys(SUPPORTED_EXTENSIONS)
  private readonly parser: CodeStructuralParser

  constructor() {
    this.parser = new CodeStructuralParser()
  }

  canHandle(filePath: string): boolean {
    return path.extname(filePath).toLowerCase() in SUPPORTED_EXTENSIONS
  }

  async load(filePath: string): Promise<CodeChunk[]> {
    const content = await fs.readFile(filePath, "utf-8")
    const ext = path.extname(filePath).toLowerCase()
    const language = SUPPORTED_EXTENSIONS[ext] ?? "unknown"
    const chunks = await this.parser.parse(content, filePath)
    return chunks.map((chunk, i) => ({
      ...chunk,
      id: chunk.id || uuidv4(),
      metadata: {
        ...chunk.metadata,
        language,
        filePath,
        chunkIndex: i,
      },
    }))
  }
}
