import * as path from "path"
import { v4 as uuidv4 } from "uuid"
import { ILoader } from "@/core/interfaces/ILoader"
import { CodeChunk, ParsedResult } from "@/core/types"
import { UnifiedCodeParser } from "@/parsers/UnifiedCodeParser"

const SUPPORTED_EXTENSIONS: Record<string, string> = {
  ".ts": "typescript",
  ".tsx": "typescript",
  ".js": "javascript",
  ".jsx": "javascript",
  ".py": "python",
}

export class CodeLoader implements ILoader {
  readonly supportedExtensions = Object.keys(SUPPORTED_EXTENSIONS)
  private readonly parser = new UnifiedCodeParser()

  canHandle(filePath: string): boolean {
    return path.extname(filePath).toLowerCase() in SUPPORTED_EXTENSIONS
  }

  async load(filePath: string): Promise<ParsedResult> {
    return await this.parser.parse(filePath)
  }
}
