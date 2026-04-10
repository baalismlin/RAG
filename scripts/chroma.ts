import { ChromaClient } from "chromadb"
import { OllamaEmbedding } from "../src/embeddings/OllamaEmbedding"

async function main() {
  const client = new ChromaClient({ path: "http://localhost:8000" })
  const embedder = new OllamaEmbedding()

  const collections = await client.listCollections()
  console.log("Collections:", collections)

  for (const collection of collections) {
    const collectionInstance = await client.getOrCreateCollection({ name: collection })
    const queryText = collection === "rag_code" ? "user" : "RAG Service"
    console.log(`\n[${collection}] querying: "${queryText}"`)

    const [queryEmbedding] = await embedder.embedDocuments([queryText])
    const result = await collectionInstance.query({
      queryEmbeddings: [queryEmbedding],
      nResults: 3,
    })
    console.log("Result:", JSON.stringify(result, null, 2))
  }
}

main().catch((err) => {
  console.error("Fatal error:", err)
  process.exit(1)
})
