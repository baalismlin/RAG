import * as path from "path";
import { ILoader } from "@/core/interfaces/ILoader";
import { MarkdownLoader } from "./MarkdownLoader";
import { PDFLoader } from "./PDFLoader";
import { CodeLoader } from "./CodeLoader";

export class LoaderFactory {
  private static readonly loaders: ILoader[] = [
    new MarkdownLoader(),
    new PDFLoader(),
    new CodeLoader(),
  ];

  static getLoader(filePath: string): ILoader | null {
    return this.loaders.find((l) => l.canHandle(filePath)) ?? null;
  }

  static getSupportedExtensions(): string[] {
    return this.loaders.flatMap((l) => l.supportedExtensions);
  }
}
