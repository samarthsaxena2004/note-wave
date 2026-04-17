// FILE: src/app/api/graph/extract/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import { extractGraphData } from "@/lib/graph";
import { getEmbeddings } from "@/lib/rag";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileId, userId } = body;

    if (!fileId || !userId) return NextResponse.json({ error: "fileId and userId required" }, { status: 400 });

    if (!process.env.PINECONE_API_KEY || !process.env.PINECONE_INDEX_NAME) {
      throw new Error("Pinecone config missing");
    }

    let queryVector;
    try {
      queryVector = await getEmbeddings("relationships, graph, concepts, entities, connections, dependencies");
    } catch (e) {
      console.warn("⚠️ Embeddings failed, falling back to dummy vector for graph");
      queryVector = new Array(384).fill(0.01);
    }

    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME!).namespace(userId);

    // Fetch context chunks for the specific file
    const queryResponse = await index.query({
      vector: queryVector,
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