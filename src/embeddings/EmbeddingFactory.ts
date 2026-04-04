import { IEmbedding } from "@/core/interfaces/IEmbedding";
import { OllamaEmbedding } from "./OllamaEmbedding";

export type EmbeddingProvider = "ollama";

export class EmbeddingFactory {
  static create(provider: EmbeddingProvider = "ollama"): IEmbedding {
    switch (provider) {
      case "ollama":
        return new OllamaEmbedding();
      default:
        throw new Error(`Unknown embedding provider: ${provider}`);
    }
  }
}
