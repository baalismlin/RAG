import * as fs from "fs/promises"
import * as path from "path"
import { ILoader } from "@/core/interfaces/ILoader"
import { ParsedResult } from "@/core/types"
import { SemanticDocumentParser } from "@/parsers/SemanticDocumentParser"

export class MarkdownLoader implements ILoader {
  readonly supportedExtensions = [".md", ".mdx"]
  private readonly parser: SemanticDocumentParser

  constructor() {
    this.parser = new SemanticDocumentParser()
  }

  canHandle(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase()
    return this.supportedExtensions.includes(ext)
  }

  async load(filePath: string): Promise<ParsedResult> {
    const content = await fs.readFile(filePath, "utf-8")
    return await this.parser.parse(content, filePath)
  }
}
