import { IEmbedding } from "@/core/interfaces/IEmbedding";

const DEFAULT_MODEL = process.env.OLLAMA_EMBEDDING_MODEL ?? "nomic-embed-text";
const DEFAULT_BASE_URL = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";

export class OllamaEmbedding implements IEmbedding {
  private readonly model: string;
  private readonly baseUrl: string;

  constructor(model = DEFAULT_MODEL, baseUrl = DEFAULT_BASE_URL) {
    this.model = model;
    this.baseUrl = baseUrl;
  }

  async embedQuery(text: string): Promise<number[]> {
    const [embedding] = await this.embedDocuments([text]);
    return embedding;
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    const results: number[][] = [];

    for (const text of texts) {
      const response = await fetch(`${this.baseUrl}/api/embeddings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: this.model, prompt: text }),
      });

      if (!response.ok) {
        throw new Error(`Ollama embedding failed: ${response.statusText}`);
      }

      const data = (await response.json()) as { embedding: number[] };
      results.push(data.embedding);
    }

    return results;
  }
}
