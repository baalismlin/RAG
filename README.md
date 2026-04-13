# Local RAG System

A fully local Retrieval-Augmented Generation (RAG) system for querying documents and source code with natural language. Built with TypeScript, Next.js, LangChain, Ollama, and ChromaDB.

## Features

- **Document Q&A** — Markdown and PDF support with semantic chunking
- **Code Q&A** — Structural parsing by function/class/interface with metadata preservation
- **Dual vector index** — Separate ChromaDB collections for documents and code
- **Query classification** — Auto-routes to document, code, or hybrid retrieval
- **Extensible reranking** — `RerankRetriever` extension point
- **100% local** — No cloud services required

## Architecture

```
Frontend (Next.js + Tailwind CSS)
        ↓
  /api/chat  •  /api/index
        ↓
     RAGService
   ┌────────────────────────┐
   │  QueryClassifier       │
   │  DocumentRetriever     │──→ ChromaDB (rag_documents)
   │  CodeRetriever         │──→ ChromaDB (rag_code)
   │  HybridRetriever       │
   │  ContextBuilder        │
   │  PromptTemplates       │
   └────────────────────────┘
        ↓
    Ollama (LLM + Embeddings)
```

## Prerequisites

| Requirement | Version | Notes       |
| ----------- | ------- | ----------- |
| Node.js     | ≥ 20    |             |
| Ollama      | latest  | `ollama.ai` |
| ChromaDB    | ≥ 0.4   | Run locally |
| PostgreSQL  | ≥ 15    | For code symbol/graph storage |

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Ollama

```bash
# Install models
ollama pull llama3.2
ollama pull nomic-embed-text
```

### 3. Start ChromaDB

```bash
# Using Docker (recommended)
docker run -p 8000:8000 chromadb/chroma

# Or pip
pip install chromadb
chroma run --host 0.0.0.0 --port 8000
```

### 4. Start PostgreSQL

```bash
# Using Docker Compose (recommended)
docker-compose up -d postgres

# Or run PostgreSQL manually with the settings from .env.example
```

### 5. Run database migrations

```bash
npm run db:migrate
```

### 6. Configure environment

```bash
cp .env.example .env.local
# Edit .env.local as needed
```

### 7. Index your data

```bash
# Index sample data
npm run index

# Index a custom directory
npm run index -- ./my-docs ./my-code
```

### 8. Start the dev server

```bash
npm run dev
# Open http://localhost:3000
```

## Project Structure

```
src/
├── app/                     # Next.js App Router
│   ├── api/
│   │   ├── chat/route.ts    # POST /api/chat
│   │   └── index/route.ts   # POST /api/index
│   ├── layout.tsx
│   └── page.tsx
├── components/              # React UI components
│   ├── ChatInterface.tsx
│   ├── MessageBubble.tsx
│   └── SourceCard.tsx
├── core/                    # Interfaces & types (SOLID)
│   ├── interfaces/
│   └── types/
│       ├── Document.ts       # Document/code chunk models + guards
│       ├── CodeKnowledge.ts  # Symbol/relation graph models
│       ├── Parsers.ts        # ParsedResult + language strategy contracts
│       └── index.ts          # Centralized type exports
├── loaders/                 # File loaders
├── parsers/                 # Document + code parsers
│   ├── languages/            # TS/JS/Python symbol extraction strategies
│   ├── SemanticDocumentParser.ts
│   └── UnifiedCodeParser.ts
├── embeddings/              # Embedding providers
├── storage/                 # Storage layer
│   ├── vector/              # ChromaDB stores (dual index)
│   │   ├── ChromaDocumentStore.ts
│   │   ├── ChromaCodeStore.ts
│   │   └── VectorStoreFactory.ts
│   ├── relational/          # PostgreSQL stores (code symbols/graph)
│   │   ├── PostgresClient.ts
│   │   ├── SymbolStore.ts
│   │   ├── GraphStore.ts
│   │   └── schema.sql
│   ├── DocumentStore.ts     # High-level document store
│   └── CodeKnowledgeStore.ts # High-level code knowledge store
├── retrievers/              # Retrieval strategies
├── rag/                     # RAG pipeline core
│   ├── QueryClassifier.ts
│   ├── ContextBuilder.ts
│   ├── PromptTemplates.ts
│   └── RAGService.ts
├── indexer/                 # IndexingService
└── lib/                     # Singletons/factories
│   ├── config.ts            # Centralized configuration
│   └── ragServiceFactory.ts
scripts/
├── index.ts                 # CLI indexing tool
├── chroma.ts                # ChromaDB utilities
└── migrate.ts               # Database migration
tests/
├── unit/
│   ├── parsers/
│   └── rag/
└── integration/
data/
├── docs/                    # Sample documents
└── code/                    # Sample code
```

## Running Tests

```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

## API Reference

### `POST /api/chat`

```json
{
  "question": "How does the RAG service classify queries?",
  "history": []
}
```

Response:

```json
{
  "answer": "...",
  "queryType": "code",
  "sources": [...],
  "model": "llama3.2"
}
```

### `POST /api/index`

```json
{ "path": "./data" }
```

Response:

```json
{
  "totalFiles": 5,
  "totalChunks": 42,
  "docChunks": 18,
  "codeChunks": 24,
  "errors": []
}
```

## Extending the System

- **Add a new loader**: implement `ILoader` and register in `LoaderFactory`
- **Add a new embedding provider**: implement `IEmbedding` and add to `EmbeddingFactory`
- **Improve reranking**: replace `RerankRetriever.rerankScores()` with a cross-encoder model call
- **Add agent capabilities**: wrap `RAGService` with a LangChain agent loop
- **Improve chunking strategy**: modify `Chunker` to use section aware chunking and add overlapping windows
