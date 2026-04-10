import { AnyChunk, QueryType } from "./Document"

export interface RetrievedChunk {
  chunk: AnyChunk
  score: number
  storeType: "document" | "code"
}

export interface QueryResult {
  answer: string
  queryType: QueryType
  sources: RetrievedChunk[]
  contextUsed: string
  model: string
}

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
  sources?: RetrievedChunk[]
  timestamp: Date
}
