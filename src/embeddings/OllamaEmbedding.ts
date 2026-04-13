import { IEmbedding } from "@/core/interfaces/IEmbedding"
import { config } from "@/lib/config"

export class OllamaEmbedding implements IEmbedding {
  private readonly model: string
  private readonly baseUrl: string

  constructor(model = config.ollama.embeddingModel, baseUrl = config.ollama.baseUrl) {
    this.model = model
    this.baseUrl = baseUrl
  }

  async embedQuery(text: string): Promise<number[]> {
    const [embedding] = await this.embedDocuments([text])
    return embedding
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    const response = await fetch(`${this.baseUrl}/api/embed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: this.model, input: texts }),
    })

    if (!response.ok) {
      const body = await response.text().catch(() => "")
      throw new Error(
        `Ollama embedding failed (${response.status} ${response.statusText}) ` +
          `for model "${this.model}" at ${this.baseUrl}. ` +
          `Make sure the model is pulled: docker exec -it rag-ollama ollama pull ${this.model}` +
          (body ? `\nDetails: ${body}` : "")
      )
    }

    const data = (await response.json()) as { embeddings: number[][] }
    return data.embeddings
  }
}
