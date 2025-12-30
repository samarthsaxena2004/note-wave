// FILE: src/app/api/graph/extract/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import { extractGraphData } from "@/lib/graph";

export async function POST(req: NextRequest) {
  try {
    const { fileId } = await req.json();

    if (!process.env.PINECONE_API_KEY || !process.env.PINECONE_INDEX_NAME) {
      throw new Error("Pinecone config missing");
    }

    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME);

    // Fetch context chunks for the specific file
    const queryResponse = await index.query({
      vector: new Array(384).fill(0.01),
      topK: 12,
      filter: { filename: fileId },
      includeMetadata: true,
    });

    const context = queryResponse.matches
      .map((match) => match.metadata?.text || "")
      .join("\n\n");

    const graphData = await extractGraphData(context);

    return NextResponse.json(graphData);
  } catch (error: any) {
    console.error("API Graph Route Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}