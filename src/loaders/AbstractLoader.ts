import * as path from "path"
import { ILoader } from "@/core/interfaces/ILoader"
import { ParsedResult } from "@/core/types"
import { ICodeParser, IDocumentParser } from "@/core/interfaces/IParser"

export abstract class AbstractLoader implements ILoader {
  readonly supportedExtensions: string[]
  readonly parser: any

  protected constructor(supportedExtensions: string[], parser: ICodeParser | IDocumentParser) {
    this.supportedExtensions = supportedExtensions
    this.parser = null
  }

  canHandle(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase()
    return this.supportedExtensions.includes(ext)
  }

  async load(filePath: string): Promise<ParsedResult> {
    const content = await this.readContent(filePath)
    return this.parser.parse(content, filePath)
  }

  protected abstract readContent(filePath: string): Promise<string>
}
