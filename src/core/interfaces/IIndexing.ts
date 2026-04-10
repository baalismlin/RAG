export interface IndexingResult {
  totalFiles: number
  totalChunks: number
  docChunks: number
  codeChunks: number
  errors: string[]
}

export interface SyncResult extends IndexingResult {
  added: number
  updated: number
  removed: number
  unchanged: number
}
