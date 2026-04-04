import { AnyChunk } from "../types/Document";

export interface ILoader {
  readonly supportedExtensions: string[];
  load(filePath: string): Promise<AnyChunk[]>;
  canHandle(filePath: string): boolean;
}
