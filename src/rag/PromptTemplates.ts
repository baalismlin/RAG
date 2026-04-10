import { QueryType } from "@/core/types/Document"

export const SYSTEM_PROMPT = `You are a precise technical assistant. You answer questions strictly based on the provided context.
Rules:
- Only use information from the provided context.
- If the context does not contain enough information, say "I don't have enough context to answer this question."
- Do not speculate or hallucinate.
- Cite the source file when referencing specific content.
- For code questions, explain the logic clearly and reference function/class names.`

export function buildUserPrompt(question: string, context: string, queryType: QueryType): string {
  const typeHint =
    queryType === "code"
      ? "This is a code-related question. Focus on code logic, structure, and implementation details."
      : queryType === "document"
        ? "This is a documentation question. Focus on conceptual explanations and usage."
        : "This question may involve both documentation and code. Provide a comprehensive answer."

  return `${typeHint}

Context:
${context}

Question: ${question}

Answer:`
}
