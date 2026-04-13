/**
 * Centralized configuration management for the RAG system.
 * All environment variables and their defaults are defined here.
 */

export const config = {
  // Ollama Configuration
  ollama: {
    baseUrl: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434",
    model: process.env.OLLAMA_MODEL ?? "llama3.2",
    embeddingModel: process.env.OLLAMA_EMBEDDING_MODEL ?? "nomic-embed-text",
  },

  // ChromaDB Configuration
  chroma: {
    url: process.env.CHROMA_URL ?? "http://localhost:8000",
    docCollection: process.env.CHROMA_DOC_COLLECTION ?? "rag_documents",
    codeCollection: process.env.CHROMA_CODE_COLLECTION ?? "rag_code",
  },

  // PostgreSQL Configuration
  postgres: {
    host: process.env.PG_HOST ?? "localhost",
    port: Number(process.env.PG_PORT ?? 5432),
    database: process.env.PG_DATABASE ?? "rag",
    user: process.env.PG_USER ?? "rag",
    password: process.env.PG_PASSWORD ?? "rag",
  },

  // Retrieval Configuration
  retrieval: {
    topKDocs: Number(process.env.TOP_K_DOCS ?? 4),
    topKCode: Number(process.env.TOP_K_CODE ?? 4),
  },

  // Data Paths
  data: {
    docsPath: process.env.DATA_DOCS_PATH ?? "./data/docs",
    codePath: process.env.DATA_CODE_PATH ?? "./data/code",
  },
} as const

export type Config = typeof config
