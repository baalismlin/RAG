/**
 * RAG service types
 */

import { IRetriever } from "../interfaces/IRetriever"

export interface RAGServiceDeps {
  docRetriever: IRetriever
  codeRetriever: IRetriever
  hybridRetriever: IRetriever
}
