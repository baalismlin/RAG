import { RetrievedChunk } from "../types/QueryResult";

export interface IRetriever {
  retrieve(query: string, topK?: number): Promise<RetrievedChunk[]>;
}

export interface IRerankRetriever extends IRetriever {
  retrieveAndRerank(query: string, topK?: number, rerankTopK?: number): Promise<RetrievedChunk[]>;
}
