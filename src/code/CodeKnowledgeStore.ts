import { IVectorStore } from "@/core/interfaces/IVectorStore";
import { ISymbolStore, SymbolLookupOptions } from "@/core/interfaces/ISymbolStore";
import { IGraphStore } from "@/core/interfaces/IGraphStore";
import { CodeSymbol, SymbolRelation, RelationType, TraversalNode } from "@/core/types/CodeKnowledge";
import { AnyChunk } from "@/core/types/Document";
import { RetrievedChunk } from "@/core/types/QueryResult";

export class CodeKnowledgeStore {
  constructor(
    private readonly vectorStore: IVectorStore,
    private readonly symbolStore: ISymbolStore,
    private readonly graphStore: IGraphStore,
  ) {}

  async indexCodeFile(
    chunks: AnyChunk[],
    symbols: CodeSymbol[],
    relations: SymbolRelation[],
  ): Promise<void> {
    await Promise.all([
      this.vectorStore.addChunks(chunks),
      this.symbolStore.upsertSymbols(symbols),
      this.graphStore.upsertRelations(relations),
    ]);
  }

  async semanticSearch(query: string, topK = 5): Promise<RetrievedChunk[]> {
    return this.vectorStore.similaritySearch(query, topK);
  }

  async exactLookup(options: SymbolLookupOptions): Promise<CodeSymbol[]> {
    return this.symbolStore.lookup(options);
  }

  async getRelations(symbolId: string, direction: "outgoing" | "incoming" = "outgoing", type?: RelationType): Promise<SymbolRelation[]> {
    return direction === "outgoing"
      ? this.graphStore.getOutgoing(symbolId, type)
      : this.graphStore.getIncoming(symbolId, type);
  }

  async traverse(symbolId: string, direction: "outgoing" | "incoming" = "outgoing", maxDepth = 2): Promise<TraversalNode[]> {
    return this.graphStore.traverse(symbolId, direction, maxDepth);
  }

  async deleteByFile(filePath: string): Promise<void> {
    await Promise.all([
      this.vectorStore.deleteChunksBySource(filePath),
      this.symbolStore.deleteByFile(filePath),
      this.graphStore.deleteByFile(filePath),
    ]);
  }

  async deleteAll(): Promise<void> {
    await Promise.all([
      this.vectorStore.deleteCollection(),
      this.symbolStore.deleteAll(),
      this.graphStore.deleteAll(),
    ]);
  }
}
