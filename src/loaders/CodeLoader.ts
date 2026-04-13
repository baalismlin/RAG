import * as fs from "fs/promises"
import { UnifiedCodeParser } from "@/parsers/UnifiedCodeParser"
import { AbstractLoader } from "./AbstractLoader"

export class CodeLoader extends AbstractLoader {

  constructor() {
    super([".ts", ".tsx", ".js", ".jsx", ".py"], new UnifiedCodeParser())
  }

  protected async readContent(filePath: string): Promise<string> {
    return fs.readFile(filePath, "utf-8")
  }

}
