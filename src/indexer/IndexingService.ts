import * as fs from "fs/promises";
import * as path from "path";
import { IVectorStore } from "@/core/interfaces/IVectorStore";
import { LoaderFactory } from "@/loaders/LoaderFactory";
import { AnyChunk, isCodeChunk } from "@/core/types/Document";
import { CodeKnowledgeStore } from "@/code/CodeKnowledgeStore";
import { RelationExtractor } from "@/ast/RelationExtractor";

export interface IndexingResult {
  totalFiles: number;
  totalChunks: number;
  docChunks: number;
  codeChunks: number;
  errors: string[];
}

interface ManifestEntry {
  mtime: number;
  size: number;
}

interface FileManifest {
  files: Record<string, ManifestEntry>;
  lastSync: string;
}

export interface SyncResult extends IndexingResult {
  added: number;
  updated: number;
  removed: number;
  unchanged: number;
}

export class IndexingService {
  private readonly docStore: IVectorStore;
  private readonly codeStore: IVectorStore;
  private readonly codeKnowledge?: CodeKnowledgeStore;
  private readonly relationExtractor = new RelationExtractor();

  constructor(docStore: IVectorStore, codeStore: IVectorStore, codeKnowledge?: CodeKnowledgeStore) {
    this.docStore = docStore;
    this.codeStore = codeStore;
    this.codeKnowledge = codeKnowledge;
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

        if (this.codeKnowledge && chunks.some(isCodeChunk)) {
          await this.indexCodeKnowledge(file, chunks.filter(isCodeChunk));
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
      if (codeChunks.length > 0) {
        await this.codeStore.addChunks(codeChunks);
        if (this.codeKnowledge) {
          await this.indexCodeKnowledge(filePath, codeChunks);
        }
      }

      result.docChunks = docChunks.length;
      result.codeChunks = codeChunks.length;
      result.totalChunks = chunks.length;
    } catch (err) {
      result.errors.push(`Failed to index ${filePath}: ${String(err)}`);
    }

    return result;
  }

  private async indexCodeKnowledge(filePath: string, _chunks: AnyChunk[]): Promise<void> {
    const content = await fs.readFile(filePath, "utf-8").catch(() => "");
    if (!content || !this.codeKnowledge) return;
    const { symbols, relations } = this.relationExtractor.extract(content, filePath);
    await this.codeKnowledge.indexCodeFile(_chunks, symbols, relations);
  }

  async syncDirectory(dirPath: string, manifestPath?: string): Promise<SyncResult> {
    const resolvedManifest = manifestPath ?? path.join(dirPath, ".index-manifest.json");
    const manifest = await this.loadManifest(resolvedManifest);

    const result: SyncResult = {
      totalFiles: 0, totalChunks: 0, docChunks: 0, codeChunks: 0,
      errors: [], added: 0, updated: 0, removed: 0, unchanged: 0,
    };

    const currentFiles = (await this.collectFiles(dirPath))
      .filter((f) => LoaderFactory.getLoader(f) !== null);

    const currentSet = new Set(currentFiles);

    for (const trackedPath of Object.keys(manifest.files)) {
      if (!currentSet.has(trackedPath)) {
        try {
          await this.docStore.deleteChunksBySource(trackedPath);
          await this.codeStore.deleteChunksBySource(trackedPath);
          await this.codeKnowledge?.deleteByFile(trackedPath);
          delete manifest.files[trackedPath];
          result.removed++;
        } catch (err) {
          result.errors.push(`Failed to remove deleted file ${trackedPath}: ${String(err)}`);
        }
      }
    }

    for (const filePath of currentFiles) {
      let stat: { mtime: number; size: number };
      try {
        const s = await fs.stat(filePath);
        stat = { mtime: s.mtimeMs, size: s.size };
      } catch (err) {
        result.errors.push(`Cannot stat ${filePath}: ${String(err)}`);
        continue;
      }

      const entry = manifest.files[filePath];
      const isNew = !entry;
      const isChanged = entry && (entry.mtime !== stat.mtime || entry.size !== stat.size);

      if (!isNew && !isChanged) {
        result.unchanged++;
        continue;
      }

      if (!isNew) {
        try {
          await this.docStore.deleteChunksBySource(filePath);
          await this.codeStore.deleteChunksBySource(filePath);
          await this.codeKnowledge?.deleteByFile(filePath);
        } catch (err) {
          result.errors.push(`Failed to clear old chunks for ${filePath}: ${String(err)}`);
          continue;
        }
      }

      const fileResult = await this.indexFile(filePath);
      result.totalFiles++;
      result.docChunks += fileResult.docChunks;
      result.codeChunks += fileResult.codeChunks;
      result.totalChunks += fileResult.totalChunks;
      result.errors.push(...fileResult.errors);

      if (fileResult.errors.length === 0) {
        manifest.files[filePath] = stat;
        if (isNew) result.added++;
        else result.updated++;
      }
    }

    manifest.lastSync = new Date().toISOString();
    await this.saveManifest(resolvedManifest, manifest);

    return result;
  }

  private async loadManifest(manifestPath: string): Promise<FileManifest> {
    try {
      const raw = await fs.readFile(manifestPath, "utf-8");
      return JSON.parse(raw) as FileManifest;
    } catch {
      return { files: {}, lastSync: "" };
    }
  }

  private async saveManifest(manifestPath: string, manifest: FileManifest): Promise<void> {
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
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
