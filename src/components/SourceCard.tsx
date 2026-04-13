"use client"

import { RetrievedChunk } from "@/core/types"

interface SourceCardProps {
  source: RetrievedChunk
  index: number
}

export function SourceCard({ source, index }: SourceCardProps) {
  const meta = source.chunk.metadata as unknown as Record<string, unknown>
  const isCode = source.storeType === "code"
  const label = isCode
    ? `${meta.symbolType ?? "symbol"}: ${meta.symbolName ?? "unknown"}`
    : ((meta.section as string | undefined) ?? (meta.source as string | undefined) ?? "Document")
  const filePath = isCode
    ? `${meta.filePath ?? meta.source}:${meta.startLine ?? 0}-${meta.endLine ?? 0}`
    : String(meta.source ?? "")
  const shortPath = filePath.length > 50 ? "…" + filePath.slice(-50) : filePath
  const score = Math.round(source.score * 100)

  return (
    <div className="flex flex-col gap-1 rounded-lg border border-gray-200 bg-white p-3 text-xs shadow-sm">
      <div className="flex items-center gap-2">
        <span
          className={`rounded px-1.5 py-0.5 font-semibold uppercase tracking-wide ${
            isCode ? "bg-violet-100 text-violet-700" : "bg-sky-100 text-sky-700"
          }`}
        >
          {isCode ? "Code" : "Doc"}
        </span>
        <span className="truncate font-medium text-gray-800">{label}</span>
        <span className="ml-auto shrink-0 text-gray-400">{score}%</span>
      </div>
      <span className="truncate text-gray-400" title={filePath}>
        {shortPath}
      </span>
      <details className="mt-1">
        <summary className="cursor-pointer text-gray-500 hover:text-gray-700">Preview</summary>
        <pre className="mt-1 max-h-32 overflow-auto whitespace-pre-wrap rounded bg-gray-50 p-2 text-gray-600">
          {source.chunk.content.slice(0, 400)}
          {source.chunk.content.length > 400 ? "…" : ""}
        </pre>
      </details>
    </div>
  )
}
