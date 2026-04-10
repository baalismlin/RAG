/**
 * Base storage interface with common operations for all storage backends.
 * All storage implementations (vector, symbol, graph) should implement these common patterns.
 */
export interface IStorage {
  /**
   * Delete all data associated with a specific source file.
   * Used during incremental sync to remove stale data when a file changes or is deleted.
   * @param source - The source file path to delete data for
   */
  deleteBySource(source: string): Promise<void>

  /**
   * Delete all data from the storage.
   * This is a destructive operation that removes all data.
   */
  deleteAll(): Promise<void>

  /**
   * Get the total number of items in the storage.
   * @returns Count of stored items
   */
  count(): Promise<number>
}
