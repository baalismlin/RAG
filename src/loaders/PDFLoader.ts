import * as fs from "fs/promises";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";
import { ILoader } from "@/core/interfaces/ILoader";
import { DocumentChunk } from "@/core/types/Document";
import { SemanticDocumentParser } from "@/parsers/SemanticDocumentParser";

export class PDFLoader implements ILoader {
  readonly supportedExtensions = [".pdf"];
  private readonly parser: SemanticDocumentParser;

  constructor() {
    this.parser = new SemanticDocumentParser();
  }

  canHandle(filePath: string): boolean {
    return path.extname(filePath).toLowerCase() === ".pdf";
  }

  async load(filePath: string): Promise<DocumentChunk[]> {
    const buffer = await fs.readFile(filePath);
    // Dynamic import to avoid issues with pdf-parse in Next.js edge runtime
    const pdfParse = (await import("pdf-parse")).default;
    const data = await pdfParse(buffer);
    const content = data.text;
    const chunks = await this.parser.parse(content, filePath);
    return chunks.map((chunk, i) => ({
      ...chunk,
      id: chunk.id || uuidv4(),
      metadata: {
        ...chunk.metadata,
        totalChunks: chunks.length,
        chunkIndex: i,
        title: path.basename(filePath, ".pdf"),
      },
    }));
  }
}
