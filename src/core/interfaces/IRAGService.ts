import { QueryResult, ChatMessage } from "../types/QueryResult";

export interface IRAGService {
  query(question: string, history?: ChatMessage[]): Promise<QueryResult>;
}
