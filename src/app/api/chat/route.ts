import { NextRequest, NextResponse } from "next/server"
import { getRAGService } from "@/lib/ragServiceFactory"
import { ChatMessage } from "@/core/types/QueryResult"

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { question: string; history?: ChatMessage[] }

    if (!body.question || typeof body.question !== "string" || body.question.trim() === "") {
      return NextResponse.json({ error: "question is required" }, { status: 400 })
    }

    const ragService = getRAGService()
    const result = await ragService.query(body.question.trim(), body.history ?? [])

    return NextResponse.json(result)
  } catch (err) {
    console.error("[/api/chat] error:", err)
    return NextResponse.json(
      { error: "Internal server error", detail: String(err) },
      { status: 500 }
    )
  }
}
