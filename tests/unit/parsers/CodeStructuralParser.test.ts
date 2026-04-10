import { CodeStructuralParser } from "@/parsers/CodeStructuralParser";
import { LanguageRegistry } from "@/parsers/languages/LanguageRegistry";
import { ILanguageStrategy, SymbolInfo } from "@/parsers/languages/ILanguageStrategy";

class MockTypeScriptStrategy implements ILanguageStrategy {
  readonly language = "typescript";
  readonly extensions = [".ts", ".tsx", ".js", ".jsx"] as const;

  extract(source: string, ext?: string): SymbolInfo[] {
    const symbols: SymbolInfo[] = [];
    
    // Mock extraction for common patterns
    if (source.includes("function greet")) {
      symbols.push({
        name: "greet",
        type: "function",
        startLine: 1,
        endLine: 2,
        content: source,
        signature: "export function greet(name: string): string",
      });
    }
    if (source.includes("class MyService")) {
      symbols.push({
        name: "MyService",
        type: "class",
        startLine: 1,
        endLine: 3,
        content: source,
        signature: "export class MyService",
      });
    }
    if (source.includes("interface IConfig")) {
      symbols.push({
        name: "IConfig",
        type: "interface",
        startLine: 1,
        endLine: 3,
        content: source,
        signature: "export interface IConfig",
      });
    }
    if (source.includes("class DataService")) {
      symbols.push({
        name: "DataService",
        type: "class",
        startLine: 1,
        endLine: 3,
        content: source,
        signature: "export class DataService",
      });
    }
    
    return symbols;
  }
}

class MockPythonStrategy implements ILanguageStrategy {
  readonly language = "python";
  readonly extensions = [".py"] as const;

  extract(source: string): SymbolInfo[] {
    const symbols: SymbolInfo[] = [];
    
    if (source.includes("class Calculator")) {
      symbols.push({
        name: "Calculator",
        type: "class",
        startLine: 1,
        endLine: 3,
        content: source,
        signature: "class Calculator",
      });
    }
    if (source.includes("def process")) {
      symbols.push({
        name: "process",
        type: "function",
        startLine: 1,
        endLine: 2,
        content: source,
        signature: "def process(data)",
      });
    }
    
    return symbols;
  }
}

describe("CodeStructuralParser", () => {
  let parser: CodeStructuralParser;

  beforeEach(() => {
    const mockRegistry = LanguageRegistry.create([
      new MockTypeScriptStrategy(),
      new MockPythonStrategy(),
    ]);
    parser = new CodeStructuralParser(mockRegistry);
  });

  it("extracts a TypeScript function", async () => {
    const code = `export function greet(name: string): string {\n  return \`Hello, \${name}!\`;\n}`;
    const chunks = await parser.parse(code, "greet.ts");

    expect(chunks.length).toBeGreaterThan(0);
    const fn = chunks.find((c) => c.metadata.symbolName === "greet");
    expect(fn).toBeDefined();
    expect(fn!.metadata.symbolType).toBe("function");
    expect(fn!.metadata.language).toBe("typescript");
  });

  it("extracts a TypeScript class", async () => {
    const code = `export class MyService {\n  doSomething() {\n    return 42;\n  }\n}`;
    const chunks = await parser.parse(code, "service.ts");

    const cls = chunks.find((c) => c.metadata.symbolName === "MyService");
    expect(cls).toBeDefined();
    expect(cls!.metadata.symbolType).toBe("class");
  });

  it("extracts a TypeScript interface", async () => {
    const code = `export interface IConfig {\n  host: string;\n  port: number;\n}`;
    const chunks = await parser.parse(code, "config.ts");

    const iface = chunks.find((c) => c.metadata.symbolName === "IConfig");
    expect(iface).toBeDefined();
    expect(iface!.metadata.symbolType).toBe("interface");
  });

  it("extracts a Python class", async () => {
    const code = `class Calculator:\n    def add(self, a, b):\n        return a + b\n`;
    const chunks = await parser.parse(code, "calc.py");

    const cls = chunks.find((c) => c.metadata.symbolName === "Calculator");
    expect(cls).toBeDefined();
    expect(cls!.metadata.symbolType).toBe("class");
    expect(cls!.metadata.language).toBe("python");
  });

  it("extracts a Python function", async () => {
    const code = `def process(data):\n    return data.strip()\n`;
    const chunks = await parser.parse(code, "utils.py");

    const fn = chunks.find((c) => c.metadata.symbolName === "process");
    expect(fn).toBeDefined();
    expect(fn!.metadata.symbolType).toBe("function");
  });

  it("includes correct filePath in metadata", async () => {
    const code = `function hello() { return 'hi'; }`;
    const chunks = await parser.parse(code, "/project/src/hello.ts");

    expect(chunks[0].metadata.filePath).toBe("/project/src/hello.ts");
  });

  it("falls back gracefully for unrecognized content", async () => {
    const code = `const x = 1;\nconst y = 2;\n`;
    const chunks = await parser.parse(code, "plain.ts");
    expect(chunks.length).toBeGreaterThan(0);
  });
});
