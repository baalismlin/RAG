import Parser from "tree-sitter"
import { ILanguageStrategy, SymbolInfo } from "@/core/types/Parsers"

const TSGrammar = require("tree-sitter-typescript")
const JSGrammar = require("tree-sitter-javascript")

const TS_QUERY = `
(class_declaration name: (type_identifier) @name) @class
(interface_declaration name: (type_identifier) @name) @interface
(function_declaration name: (identifier) @name) @function
(method_definition name: (property_identifier) @name) @method
(type_alias_declaration name: (type_identifier) @name) @type_alias
(variable_declarator name: (identifier) @name value: [(arrow_function)(function_expression)]) @arrow_fn
`

const JS_QUERY = `
(class_declaration name: (identifier) @name) @class
(function_declaration name: (identifier) @name) @function
(method_definition name: (property_identifier) @name) @method
(variable_declarator name: (identifier) @name value: [(arrow_function)(function_expression)]) @arrow_fn
`

const SYMBOL_CAPTURE_NAMES = new Set([
  "class",
  "interface",
  "function",
  "method",
  "type_alias",
  "arrow_fn",
])

type CaptureName = "class" | "interface" | "function" | "method" | "type_alias" | "arrow_fn"

function toSymbolType(captureName: CaptureName): SymbolInfo["type"] {
  const map: Record<CaptureName, SymbolInfo["type"]> = {
    class: "class",
    interface: "interface",
    function: "function",
    method: "method",
    type_alias: "other",
    arrow_fn: "function",
  }
  return map[captureName]
}

function getModifiers(node: Parser.SyntaxNode): string[] {
  const mods: string[] = []
  if (node.parent?.type === "export_statement") mods.push("export")
  if (node.parent?.type === "export_statement" && node.parent.text.startsWith("export default"))
    mods.push("default")
  const firstChild = node.children[0]
  if (firstChild?.type === "abstract") mods.push("abstract")
  if (firstChild?.type === "async") mods.push("async")
  return mods
}

function getDocComment(node: Parser.SyntaxNode): string | undefined {
  const target = node.parent?.type === "export_statement" ? node.parent : node
  const prev = target.previousNamedSibling
  if (prev?.type === "comment") return prev.text
  return undefined
}

function getParentClass(node: Parser.SyntaxNode): string | undefined {
  const classBody = node.parent
  if (classBody?.type !== "class_body") return undefined
  const classDecl = classBody.parent
  if (!classDecl) return undefined
  return classDecl.childForFieldName("name")?.text
}

function getSignature(node: Parser.SyntaxNode): string {
  return node.text.split("\n")[0].trim()
}

function buildSymbol(
  captureName: CaptureName,
  node: Parser.SyntaxNode,
  nameNode: Parser.SyntaxNode | null
): SymbolInfo | null {
  if (!nameNode) return null
  const contentNode = captureName === "arrow_fn" ? (node.parent ?? node) : node
  return {
    name: nameNode.text,
    type: toSymbolType(captureName),
    startLine: contentNode.startPosition.row + 1,
    endLine: contentNode.endPosition.row + 1,
    content: contentNode.text,
    signature: getSignature(contentNode),
    docComment: getDocComment(node),
    modifiers: getModifiers(node),
    parentName: captureName === "method" ? getParentClass(node) : undefined,
  }
}

export class TypeScriptStrategy implements ILanguageStrategy {
  readonly language = "typescript"
  readonly extensions = [".ts", ".tsx", ".js", ".jsx"] as const

  private readonly tsParser: Parser
  private readonly jsParser: Parser
  private readonly tsQuery: Parser.Query | null
  private readonly jsQuery: Parser.Query | null
  private readonly initialized: boolean

  constructor() {
    this.tsParser = new Parser()
    this.jsParser = new Parser()
    this.tsQuery = null
    this.jsQuery = null
    this.initialized = false

    try {
      this.tsParser.setLanguage(TSGrammar.typescript)
      this.jsParser.setLanguage(JSGrammar)
      this.tsQuery = new Parser.Query(TSGrammar.typescript, TS_QUERY)
      this.jsQuery = new Parser.Query(JSGrammar, JS_QUERY)
      this.initialized = true
    } catch (err) {
      console.warn(`[TypeScriptStrategy] Failed to initialize tree-sitter: ${String(err)}`)
    }
  }

  extract(source: string, ext = ".ts"): SymbolInfo[] {
    if (!this.initialized) {
      return []
    }

    try {
      const isJs = ext === ".js" || ext === ".jsx"
      const parser = isJs ? this.jsParser : this.tsParser
      const query = isJs ? this.jsQuery : this.tsQuery

      if (!query) {
        return []
      }

      const tree = parser.parse(source)
      const matches = query.matches(tree.rootNode)
      const symbols: SymbolInfo[] = []

      for (const match of matches) {
        const nodeCapture = match.captures.find((c) => SYMBOL_CAPTURE_NAMES.has(c.name))
        if (!nodeCapture) continue

        const captureName = nodeCapture.name as CaptureName
        const node = nodeCapture.node

        let nameNode: Parser.SyntaxNode | null
        if (captureName === "arrow_fn") {
          nameNode = node.childForFieldName("name")
        } else {
          nameNode = match.captures.find((c) => c.name === "name")?.node ?? null
        }

        const sym = buildSymbol(captureName, node, nameNode)
        if (sym) symbols.push(sym)
      }

      return symbols
    } catch (err) {
      console.warn(`[TypeScriptStrategy] Failed to extract symbols: ${String(err)}`)
      return []
    }
  }
}
