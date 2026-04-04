import { AnyChunk } from "../types/Document";
import { RetrievedChunk } from "../types/QueryResult";

export interface IVectorStore {
  addChunks(chunks: AnyChunk[]): Promise<void>;
  similaritySearch(query: string, topK: number): Promise<RetrievedChunk[]>;
  deleteCollection(): Promise<void>;
  count(): Promise<number>;
}
