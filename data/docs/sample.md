# Local RAG System — Documentation

## Overview

This project implements a fully local Retrieval-Augmented Generation (RAG) system for querying
documents and source code using natural language. It is built with TypeScript, Next.js, LangChain,
Ollama, and ChromaDB.

## Architecture

The system follows a layered architecture:

```
Frontend (Next.js + Tailwind)
    ↓
API Layer (/api/chat, /api/index)
    ↓
RAG Service (QueryClassifier → Retriever → ContextBuilder → LLM)
    ↓
Vector Stores (Document Index + Code Index — dual index design)
    ↓
Ollama (local LLM + embeddings)
```

## Core Modules

### Loader

Loaders read raw files from disk and delegate to parsers. Supported formats:
- **Markdown** (`.md`, `.mdx`) — via `MarkdownLoader`
- **PDF** (`.pdf`) — via `PDFLoader`
- **Code** (`.ts`, `.tsx`, `.js`, `.jsx`, `.py`) — via `CodeLoader`

### Parser

Two parser strategies are implemented:

- **SemanticDocumentParser**: splits documents by Markdown headings, then by character limit
  with sentence-boundary awareness. Preserves section metadata.
- **CodeStructuralParser**: uses regex-based AST-like extraction to identify functions, classes,
  and interfaces. Preserves `symbolName`, `symbolType`, `startLine`, `endLine`, and `filePath`.

### Embedding

The `OllamaEmbedding` class calls the local Ollama `/api/embeddings` endpoint.
Default model: `nomic-embed-text`. Swappable via `EmbeddingFactory`.

### Vector Store (Dual Index)

Two separate ChromaDB collections are maintained:
- `rag_documents` — document chunks
- `rag_code` — code symbol chunks

This separation allows independent tuning of retrieval for each domain.

### Retriever

Three retriever strategies:
- `DocumentRetriever` — queries the document index only
- `CodeRetriever` — queries the code index only
- `HybridRetriever` — queries both, merges by score

An extension point `RerankRetriever` wraps any retriever and applies token-overlap
re-scoring. Replace with a cross-encoder for production quality reranking.

### RAG Service

The `RAGService` is the single entry point for queries:
1. `QueryClassifier` labels the query as `document`, `code`, or `hybrid`
2. The appropriate retriever fetches top-K chunks
3. `ContextBuilder` assembles the context string (max 6000 chars)
4. `SYSTEM_PROMPT` + `buildUserPrompt()` construct the final prompt
5. Ollama `/api/chat` is called with the prompt and optional chat history

## Configuration

Copy `.env.example` to `.env.local` and set:

| Variable | Default | Description |
|---|---|---|
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama server URL |
| `OLLAMA_MODEL` | `llama3.2` | Chat model name |
| `OLLAMA_EMBEDDING_MODEL` | `nomic-embed-text` | Embedding model |
| `CHROMA_URL` | `http://localhost:8000` | ChromaDB server URL |
| `DATA_DOCS_PATH` | `./data/docs` | Path to index documents |
| `DATA_CODE_PATH` | `./data/code` | Path to index code |

## Getting Started

See the README for setup instructions.
