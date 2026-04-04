import { IRAGService } from "@/core/interfaces/IRAGService";
import { IRetriever } from "@/core/interfaces/IRetriever";
import { QueryResult, ChatMessage, RetrievedChunk } from "@/core/types/QueryResult";
import { QueryType } from "@/core/types/Document";
import { QueryClassifier } from "./QueryClassifier";
import { ContextBuilder } from "./ContextBuilder";
import { SYSTEM_PROMPT, buildUserPrompt } from "./PromptTemplates";

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "llama3.2";

export interface RAGServiceDeps {
  docRetriever: IRetriever;
  codeRetriever: IRetriever;
  hybridRetriever: IRetriever;
}

export class RAGService implements IRAGService {
  private readonly classifier: QueryClassifier;
  private readonly contextBuilder: ContextBuilder;
  private readonly deps: RAGServiceDeps;

  constructor(deps: RAGServiceDeps) {
    this.deps = deps;
    this.classifier = new QueryClassifier();
    this.contextBuilder = new ContextBuilder();
  }

  async query(question: string, history: ChatMessage[] = []): Promise<QueryResult> {
    const queryType = this.classifier.classify(question);
    const sources = await this.retrieve(question, queryType);
    const context = this.contextBuilder.build(sources);
    const answer = await this.callLLM(question, context, queryType, history);

    return { answer, queryType, sources, contextUsed: context, model: OLLAMA_MODEL };
  }

  private async retrieve(question: string, queryType: QueryType): Promise<RetrievedChunk[]> {
    switch (queryType) {
      case "document":
        return this.deps.docRetriever.retrieve(question);
      case "code":
        return this.deps.codeRetriever.retrieve(question);
      case "hybrid":
        return this.deps.hybridRetriever.retrieve(question);
    }
  }

  private async callLLM(
    question: string,
    context: string,
    queryType: QueryType,
    history: ChatMessage[]
  ): Promise<string> {
    const messages: Array<{ role: string; content: string }> = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.map((h) => ({ role: h.role, content: h.content })),
      { role: "user", content: buildUserPrompt(question, context, queryType) },
    ];

    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: OLLAMA_MODEL, messages, stream: false }),
    });

    if (!response.ok) {
      throw new Error(`Ollama LLM call failed: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as { message?: { content?: string } };
    return data.message?.content ?? "No response from LLM.";
  }
}
