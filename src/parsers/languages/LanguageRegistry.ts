import { ILanguageStrategy } from "./ILanguageStrategy";
import { TypeScriptStrategy } from "./TypeScriptStrategy";
import { PythonStrategy } from "./PythonStrategy";

export class LanguageRegistry {
  private static instance: LanguageRegistry | undefined;
  private readonly byExtension = new Map<string, ILanguageStrategy>();

  private constructor(strategies: ILanguageStrategy[]) {
    for (const s of strategies) {
      for (const ext of s.extensions) {
        this.byExtension.set(ext.toLowerCase(), s);
      }
    }
  }

  static getDefault(): LanguageRegistry {
    if (!this.instance) {
      this.instance = new LanguageRegistry([
        new TypeScriptStrategy(),
        new PythonStrategy(),
      ]);
    }
    return this.instance;
  }

  static create(strategies: ILanguageStrategy[]): LanguageRegistry {
    return new LanguageRegistry(strategies);
  }

  register(strategy: ILanguageStrategy): void {
    for (const ext of strategy.extensions) {
      this.byExtension.set(ext.toLowerCase(), strategy);
    }
  }

  get(ext: string): ILanguageStrategy | undefined {
    return this.byExtension.get(ext.toLowerCase());
  }
}
