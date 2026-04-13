import { QueryType } from "@/core/types"

const CODE_KEYWORDS = [
  "function",
  "class",
  "method",
  "implement",
  "code",
  "variable",
  "type",
  "interface",
  "import",
  "export",
  "return",
  "parameter",
  "argument",
  "loop",
  "condition",
  "array",
  "object",
  "async",
  "await",
  "promise",
  "error",
  "exception",
  "api",
  "endpoint",
  "module",
  "package",
  "library",
  "algorithm",
  "logic",
  "syntax",
  "debug",
  "fix",
  "bug",
  "refactor",
  "file",
  "path",
  "const",
  "let",
]

const DOC_KEYWORDS = [
  "document",
  "guide",
  "tutorial",
  "explain",
  "what is",
  "how to",
  "overview",
  "architecture",
  "design",
  "concept",
  "introduction",
  "getting started",
  "configuration",
  "setup",
  "install",
  "usage",
  "feature",
  "requirement",
  "spec",
  "specification",
  "readme",
  "why",
  "when",
  "background",
  "history",
  "purpose",
]

export class QueryClassifier {
  classify(query: string): QueryType {
    const lower = query.toLowerCase()
    const codeScore = CODE_KEYWORDS.filter((kw) => lower.includes(kw)).length
    const docScore = DOC_KEYWORDS.filter((kw) => lower.includes(kw)).length

    if (codeScore === 0 && docScore === 0) return "hybrid"
    if (codeScore >= docScore && codeScore > 0) return "code"
    if (docScore > codeScore) return "document"
    return "hybrid"
  }
}
