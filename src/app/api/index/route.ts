import { NextRequest, NextResponse } from "next/server";
import { getIndexingService } from "@/lib/ragServiceFactory";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { path?: string };
    const targetPath = body.path ?? process.env.DATA_DOCS_PATH ?? "./data";

    const indexer = getIndexingService();
    const result = await indexer.syncDirectory(targetPath);

    return NextResponse.json(result);
  } catch (err) {
    console.error("[/api/index] error:", err);
    return NextResponse.json(
      { error: "Indexing failed", detail: String(err) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: "POST to this endpoint with { path: './data' } to trigger indexing." });
}
