import * as fs from "fs/promises";
import * as path from "path";
import { IVectorStore } from "@/core/interfaces/IVectorStore";
import { LoaderFactory } from "@/loaders/LoaderFactory";
import { AnyChunk, isCodeChunk } from "@/core/types/Document";

export interface IndexingResult {
  totalFiles: number;
  totalChunks: number;
  docChunks: number;
  codeChunks: number;
  errors: string[];
}

export class IndexingService {
  private readonly docStore: IVectorStore;
  private readonly codeStore: IVectorStore;

  constructor(docStore: IVectorStore, codeStore: IVectorStore) {
    this.docStore = docStore;
    this.codeStore = codeStore;
  }

  async indexDirectory(dirPath: string): Promise<IndexingResult> {
    const result: IndexingResult = { totalFiles: 0, totalChunks: 0, docChunks: 0, codeChunks: 0, errors: [] };
    const files = await this.collectFiles(dirPath);

    const docChunks: AnyChunk[] = [];
    const codeChunks: AnyChunk[] = [];

    for (const file of files) {
      const loader = LoaderFactory.getLoader(file);
      if (!loader) continue;

      try {
        const chunks = await loader.load(file);
        result.totalFiles++;

        for (const chunk of chunks) {
          if (isCodeChunk(chunk)) {
            codeChunks.push(chunk);
          } else {
            docChunks.push(chunk);
          }
        }
      } catch (err) {
        result.errors.push(`Failed to load ${file}: ${String(err)}`);
      }
    }

    if (docChunks.length > 0) {
      await this.docStore.addChunks(docChunks);
      result.docChunks = docChunks.length;
    }

    if (codeChunks.length > 0) {
      await this.codeStore.addChunks(codeChunks);
      result.codeChunks = codeChunks.length;
    }

    result.totalChunks = result.docChunks + result.codeChunks;
    return result;
  }

  async indexFile(filePath: string): Promise<IndexingResult> {
    const result: IndexingResult = { totalFiles: 0, totalChunks: 0, docChunks: 0, codeChunks: 0, errors: [] };
    const loader = LoaderFactory.getLoader(filePath);
    if (!loader) {
      result.errors.push(`No loader for ${filePath}`);
      return result;
    }

    try {
      const chunks = await loader.load(filePath);
      result.totalFiles = 1;

      const docChunks = chunks.filter((c) => !isCodeChunk(c));
      const codeChunks = chunks.filter(isCodeChunk);

      if (docChunks.length > 0) await this.docStore.addChunks(docChunks);
      if (codeChunks.length > 0) await this.codeStore.addChunks(codeChunks);

      result.docChunks = docChunks.length;
      result.codeChunks = codeChunks.length;
      result.totalChunks = chunks.length;
    } catch (err) {
      result.errors.push(`Failed to index ${filePath}: ${String(err)}`);
    }

    return result;
  }

  private async collectFiles(dirPath: string): Promise<string[]> {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        const subFiles = await this.collectFiles(fullPath);
        files.push(...subFiles);
      } else if (entry.isFile()) {
        files.push(fullPath);
      }
    }

    return files;
  }
}
