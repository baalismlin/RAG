import { SymbolRelation, RelationType, TraversalNode } from "../types/CodeKnowledge";

export interface IGraphStore {
  upsertRelations(relations: SymbolRelation[]): Promise<void>;
  getOutgoing(fromSymbolId: string, type?: RelationType): Promise<SymbolRelation[]>;
  getIncoming(toSymbolId: string, type?: RelationType): Promise<SymbolRelation[]>;
  traverse(startSymbolId: string, direction: "outgoing" | "incoming", maxDepth: number): Promise<TraversalNode[]>;
  deleteByFile(filePath: string): Promise<void>;
  deleteAll(): Promise<void>;
}
