import * as fs from "fs/promises"
import * as path from "path"
import { IContentStore } from "@/core/interfaces/IContentStore"
import { IndexingResult, SyncResult } from "@/core/interfaces/IIndexing"
import { LoaderFactory } from "@/loaders/LoaderFactory"
import { isCodeChunk } from "@/core/types/Document"
import { UnifiedCodeParser } from "@/parsers/UnifiedCodeParser"

interface ManifestEntry {
  mtime: number
  size: number
}

interface FileManifest {
  files: Record<string, ManifestEntry>
  lastSync: string
}

export class IndexingService {
  private readonly docStore: IContentStore
  private readonly codeStore: IContentStore
  private readonly codeParser = new UnifiedCodeParser()

  constructor(docStore: IContentStore, codeStore: IContentStore) {
    this.docStore = docStore
    this.codeStore = codeStore
  }

  async syncDirectory(dirPath: string, manifestPath?: string): Promise<SyncResult> {
    const resolvedManifest = manifestPath ?? path.join(dirPath, ".index-manifest.json")
    const manifest = await this.loadManifest(resolvedManifest)

    const result: SyncResult = {
      totalFiles: 0,
      totalChunks: 0,
      docChunks: 0,
      codeChunks: 0,
      errors: [],
      added: 0,
      updated: 0,
      removed: 0,
      unchanged: 0,
    }

    const currentFiles = (await this.collectFiles(dirPath)).filter(
      (f) => LoaderFactory.getLoader(f) !== null
    )

    const currentSet = new Set(currentFiles)

    for (const trackedPath of Object.keys(manifest.files)) {
      if (!currentSet.has(trackedPath)) {
        try {
          await this.docStore.deleteBySource(trackedPath)
          await this.codeStore.deleteBySource(trackedPath)
          delete manifest.files[trackedPath]
          result.removed++
        } catch (err) {
          result.errors.push(`Failed to remove deleted file ${trackedPath}: ${String(err)}`)
        }
      }
    }

    for (const filePath of currentFiles) {
      let stat: { mtime: number; size: number }
      try {
        const s = await fs.stat(filePath)
        stat = { mtime: s.mtimeMs, size: s.size }
      } catch (err) {
        result.errors.push(`Cannot stat ${filePath}: ${String(err)}`)
        continue
      }

      const entry = manifest.files[filePath]
      const isNew = !entry
      const isChanged = entry && (entry.mtime !== stat.mtime || entry.size !== stat.size)

      if (!isNew && !isChanged) {
        result.unchanged++
        continue
      }

      if (!isNew) {
        try {
          await this.docStore.deleteBySource(filePath)
          await this.codeStore.deleteBySource(filePath)
        } catch (err) {
          result.errors.push(`Failed to clear old chunks for ${filePath}: ${String(err)}`)
          // Skip indexing if deletion fails to avoid inconsistent state
          continue
        }
      }

      const fileResult = await this.indexFile(filePath)
      result.totalFiles++
      result.docChunks += fileResult.docChunks
      result.codeChunks += fileResult.codeChunks
      result.totalChunks += fileResult.totalChunks
      result.errors.push(...fileResult.errors)

      // Only update manifest if indexing succeeded without errors
      if (fileResult.errors.length === 0) {
        manifest.files[filePath] = stat
        if (isNew) result.added++
        else result.updated++
      }
    }

    manifest.lastSync = new Date().toISOString()
    await this.saveManifest(resolvedManifest, manifest)

    return result
  }

  private async indexFile(filePath: string): Promise<IndexingResult> {
    const result: IndexingResult = {
      totalFiles: 0,
      totalChunks: 0,
      docChunks: 0,
      codeChunks: 0,
      errors: [],
    }
    const loader = LoaderFactory.getLoader(filePath)
    if (!loader) {
      result.errors.push(`No loader for ${filePath}`)
      return result
    }

    try {
      result.totalFiles = 1

      // Check if this is a code file
      const isCode = loader.constructor.name === "CodeLoader"

      if (isCode) {
        // Use UnifiedCodeParser for code files (parse once for chunks, symbols, relations)
        const parsed = await this.codeParser.parse(filePath)
        await this.codeStore.indexFile(filePath, parsed.chunks, parsed.symbols, parsed.relations)
        result.codeChunks = parsed.chunks.length
        result.totalChunks = parsed.chunks.length
      } else {
        // Use loader for document files
        const chunks = await loader.load(filePath)
        const docChunks = chunks.filter((c) => !isCodeChunk(c))
        const codeChunks = chunks.filter(isCodeChunk)

        if (docChunks.length > 0) await this.docStore.indexFile(filePath, docChunks)
        if (codeChunks.length > 0) {
          await this.codeStore.indexFile(filePath, codeChunks)
        }

        result.docChunks = docChunks.length
        result.codeChunks = codeChunks.length
        result.totalChunks = chunks.length
      }
    } catch (err) {
      result.errors.push(`Failed to index ${filePath}: ${String(err)}`)
    }

    return result
  }

  private async loadManifest(manifestPath: string): Promise<FileManifest> {
    try {
      const raw = await fs.readFile(manifestPath, "utf-8")
      return JSON.parse(raw) as FileManifest
    } catch {
      return { files: {}, lastSync: "" }
    }
  }

  private async saveManifest(manifestPath: string, manifest: FileManifest): Promise<void> {
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf-8")
  }

  private async collectFiles(dirPath: string): Promise<string[]> {
    const entries = await fs.readdir(dirPath, { withFileTypes: true })
    const files: string[] = []

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name)
      if (entry.isDirectory()) {
        const subFiles = await this.collectFiles(fullPath)
        files.push(...subFiles)
      } else if (entry.isFile()) {
        files.push(fullPath)
      }
    }

    return files
  }
}
