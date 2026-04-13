import * as fs from "fs/promises"
import { SemanticDocumentParser } from "@/parsers/SemanticDocumentParser"
import { AbstractLoader } from "./AbstractLoader"

export class MarkdownLoader extends AbstractLoader {
  constructor() {
    super([".md", ".mdx"], new SemanticDocumentParser())
  }

  protected async readContent(filePath: string): Promise<string> {
    return fs.readFile(filePath, "utf-8")
  }
}
