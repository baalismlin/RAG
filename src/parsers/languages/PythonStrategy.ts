import Parser from "tree-sitter";
import { ILanguageStrategy, SymbolInfo } from "./ILanguageStrategy";

const PyGrammar = require("tree-sitter-python");

const PY_QUERY = `
(class_definition name: (identifier) @name) @class
(function_definition name: (identifier) @name) @function
`;

function getParentClass(node: Parser.SyntaxNode): string | undefined {
  const block = node.parent;
  if (block?.type !== "block") return undefined;
  const classNode = block.parent;
  if (classNode?.type !== "class_definition") return undefined;
  return classNode.childForFieldName("name")?.text;
}

function getPythonDocstring(node: Parser.SyntaxNode): string | undefined {
  const body = node.childForFieldName("body");
  if (!body) return undefined;
  const firstStmt = body.namedChildren[0];
  if (firstStmt?.type === "expression_statement") {
    const expr = firstStmt.namedChildren[0];
    if (expr?.type === "string") return expr.text;
  }
  return undefined;
}

function getDocComment(node: Parser.SyntaxNode): string | undefined {
  const prev = node.previousNamedSibling;
  if (prev?.type === "comment") return prev.text;
  return undefined;
}

export class PythonStrategy implements ILanguageStrategy {
  readonly language = "python";
  readonly extensions = [".py"] as const;

  private readonly parser: Parser;
  private readonly query: Parser.Query | null;
  private readonly initialized: boolean;

  constructor() {
    this.parser = new Parser();
    this.query = null;
    this.initialized = false;
    
    try {
      this.parser.setLanguage(PyGrammar);
      this.query = new Parser.Query(PyGrammar, PY_QUERY);
      this.initialized = true;
    } catch (err) {
      console.warn(`[PythonStrategy] Failed to initialize tree-sitter: ${String(err)}`);
    }
  }

  extract(source: string): SymbolInfo[] {
    if (!this.initialized || !this.query) {
      return [];
    }

    try {
      const tree = this.parser.parse(source);
      const matches = this.query.matches(tree.rootNode);
      const symbols: SymbolInfo[] = [];

    for (const match of matches) {
      const nodeCapture = match.captures.find((c) => c.name === "class" || c.name === "function");
      if (!nodeCapture) continue;

      const node = nodeCapture.node;
      const nameNode = match.captures.find((c) => c.name === "name")?.node ?? null;
      if (!nameNode) continue;

      const parentName = getParentClass(node);
      const type: SymbolInfo["type"] = nodeCapture.name === "class" ? "class" : parentName ? "method" : "function";

      symbols.push({
        name: nameNode.text,
        type,
        startLine: node.startPosition.row + 1,
        endLine: node.endPosition.row + 1,
        content: node.text,
        signature: node.text.split("\n")[0].trim(),
        docComment: getPythonDocstring(node) ?? getDocComment(node),
        parentName,
      });
    }

    return symbols;
    } catch (err) {
      console.warn(`[PythonStrategy] Failed to extract symbols: ${String(err)}`);
      return [];
    }
  }
}
