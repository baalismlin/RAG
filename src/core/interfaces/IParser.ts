import { AnyChunk, DocumentChunk, CodeChunk } from "../types/Document";

export interface IParser {
  parse(content: string, source: string): Promise<AnyChunk[]>;
}

export interface IDocumentParser extends IParser {
  parse(content: string, source: string): Promise<DocumentChunk[]>;
}

export interface ICodeParser extends IParser {
  parse(content: string, source: string): Promise<CodeChunk[]>;
  readonly supportedLanguages: string[];
}
