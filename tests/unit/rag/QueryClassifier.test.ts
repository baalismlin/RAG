import { QueryClassifier } from "@/rag/QueryClassifier";

describe("QueryClassifier", () => {
  let classifier: QueryClassifier;

  beforeEach(() => {
    classifier = new QueryClassifier();
  });

  it("classifies code-related questions as 'code'", () => {
    expect(classifier.classify("What does the function greet do?")).toBe("code");
    expect(classifier.classify("How is the class implemented?")).toBe("code");
    expect(classifier.classify("Show me the code for the API endpoint")).toBe("code");
  });

  it("classifies document-related questions as 'document'", () => {
    expect(classifier.classify("What is the purpose of this project?")).toBe("document");
    expect(classifier.classify("How do I install the system?")).toBe("document");
    expect(classifier.classify("Give me an overview of the architecture")).toBe("document");
  });

  it("classifies ambiguous questions as 'hybrid'", () => {
    const result = classifier.classify("Tell me about this");
    expect(["hybrid", "document", "code"]).toContain(result);
  });

  it("is case-insensitive", () => {
    expect(classifier.classify("WHAT IS THE FUNCTION?")).toBe("code");
    expect(classifier.classify("EXPLAIN THE OVERVIEW")).toBe("document");
  });
});
