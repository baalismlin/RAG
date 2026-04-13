import * as fs from "fs/promises"
import * as path from "path"
import { ILoader } from "@/core/interfaces/ILoader"
import { DocumentChunk, ParsedResult } from "@/core/types"
import { SemanticDocumentParser } from "@/parsers/SemanticDocumentParser"

export class PDFLoader implements ILoader {
  readonly supportedExtensions = [".pdf"]
  private readonly parser: SemanticDocumentParser

  constructor() {
    this.parser = new SemanticDocumentParser()
  }

  canHandle(filePath: string): boolean {
    return path.extname(filePath).toLowerCase() === ".pdf"
  }

  async load(filePath: string): Promise<ParsedResult> {
    const buffer = await fs.readFile(filePath)
    // Dynamic import to avoid issues with pdf-parse in Next.js edge runtime
    const pdfParse = (await import("pdf-parse")).default
    const data = await pdfParse(buffer)
    const content = data.text
    return await this.parser.parse(content, filePath)
  }
}
