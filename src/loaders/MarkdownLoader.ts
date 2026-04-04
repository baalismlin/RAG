import * as fs from "fs/promises";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";
import { ILoader } from "@/core/interfaces/ILoader";
import { DocumentChunk } from "@/core/types/Document";
import { SemanticDocumentParser } from "@/parsers/SemanticDocumentParser";

export class MarkdownLoader implements ILoader {
  readonly supportedExtensions = [".md", ".mdx"];
  private readonly parser: SemanticDocumentParser;

  constructor() {
    this.parser = new SemanticDocumentParser();
  }

  canHandle(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    return this.supportedExtensions.includes(ext);
  }

  async load(filePath: string): Promise<DocumentChunk[]> {
    const content = await fs.readFile(filePath, "utf-8");
    const chunks = await this.parser.parse(content, filePath);
    return chunks.map((chunk, i) => ({
      ...chunk,
      id: chunk.id || uuidv4(),
      metadata: {
        ...chunk.metadata,
        totalChunks: chunks.length,
        chunkIndex: i,
      },
    }));
  }
}
