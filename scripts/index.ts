import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

import { EmbeddingFactory } from "../src/embeddings/EmbeddingFactory";
import { VectorStoreFactory } from "../src/vectorstore/VectorStoreFactory";
import { IndexingService } from "../src/indexer/IndexingService";

async function main() {
  const args = process.argv.slice(2);
  const reset = args.includes("--reset");
  const positional = args.filter((a) => !a.startsWith("--"));
  const docsPath = positional[0] ?? process.env.DATA_DOCS_PATH ?? "./data/docs";
  const codePath = positional[1] ?? process.env.DATA_CODE_PATH ?? "./data/code";

  console.log("🔧 Initializing embedding and vector stores...");
  const embedding = EmbeddingFactory.create("ollama");
  const docStore = VectorStoreFactory.createDocumentStore(embedding);
  const codeStore = VectorStoreFactory.createCodeStore(embedding);

  if (reset) {
    console.log("🗑️  Resetting collections...");
    await docStore.deleteCollection();
    await codeStore.deleteCollection();
    console.log("   Collections cleared.");
  }

  const indexer = new IndexingService(docStore, codeStore);

  console.log(`📄 Indexing documents from: ${docsPath}`);
  const docResult = await indexer.indexDirectory(path.resolve(docsPath));

  console.log(`💻 Indexing code from: ${codePath}`);
  const codeResult = await indexer.indexDirectory(path.resolve(codePath));

  const totalFiles = docResult.totalFiles + codeResult.totalFiles;
  const totalChunks = docResult.totalChunks + codeResult.totalChunks;
  const errors = [...docResult.errors, ...codeResult.errors];

  console.log("\n✅ Indexing complete!");
  console.log(`   Files processed : ${totalFiles}`);
  console.log(`   Doc chunks       : ${docResult.docChunks}`);
  console.log(`   Code chunks      : ${codeResult.codeChunks}`);
  console.log(`   Total chunks     : ${totalChunks}`);

  if (errors.length > 0) {
    console.warn("\n⚠️  Errors:");
    errors.forEach((e) => console.warn("  -", e));
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
