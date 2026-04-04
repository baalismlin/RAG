import { EmbeddingFactory } from "@/embeddings/EmbeddingFactory";
import { VectorStoreFactory } from "@/vectorstore/VectorStoreFactory";
import { DocumentRetriever } from "@/retrievers/DocumentRetriever";
import { CodeRetriever } from "@/retrievers/CodeRetriever";
import { HybridRetriever } from "@/retrievers/HybridRetriever";
import { RAGService } from "@/rag/RAGService";
import { IndexingService } from "@/indexer/IndexingService";

let ragServiceInstance: RAGService | null = null;
let indexingServiceInstance: IndexingService | null = null;

export function getRAGService(): RAGService {
  if (!ragServiceInstance) {
    const embedding = EmbeddingFactory.create("ollama");
    const docStore = VectorStoreFactory.createDocumentStore(embedding);
    const codeStore = VectorStoreFactory.createCodeStore(embedding);
    const docRetriever = new DocumentRetriever(docStore);
    const codeRetriever = new CodeRetriever(codeStore);
    const hybridRetriever = new HybridRetriever(docRetriever, codeRetriever);
    ragServiceInstance = new RAGService({ docRetriever, codeRetriever, hybridRetriever });
  }
  return ragServiceInstance;
}

export function getIndexingService(): IndexingService {
  if (!indexingServiceInstance) {
    const embedding = EmbeddingFactory.create("ollama");
    const docStore = VectorStoreFactory.createDocumentStore(embedding);
    const codeStore = VectorStoreFactory.createCodeStore(embedding);
    indexingServiceInstance = new IndexingService(docStore, codeStore);
  }
  return indexingServiceInstance;
}
