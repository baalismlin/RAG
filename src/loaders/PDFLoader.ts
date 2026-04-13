import * as fs from "fs/promises"
import { SemanticDocumentParser } from "@/parsers/SemanticDocumentParser"
import { AbstractLoader } from "./AbstractLoader"

export class PDFLoader extends AbstractLoader {
  constructor() {
    super([".pdf"], new SemanticDocumentParser())
  }

  protected async readContent(filePath: string): Promise<string> {
    const buffer = await fs.readFile(filePath)
    const pdfParse = (await import("pdf-parse")).default
    const data = await pdfParse(buffer)
    return data.text
  }
}
