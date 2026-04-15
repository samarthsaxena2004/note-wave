// FILE: src/app/api/graph/extract/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import { extractGraphData } from "@/lib/graph";
import { getEmbeddings } from "@/lib/rag";

export async function POST(req: NextRequest) {
  try {
    const { fileId } = await req.json();

    if (!process.env.PINECONE_API_KEY || !process.env.PINECONE_INDEX_NAME) {
      throw new Error("Pinecone config missing");
    }

    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME);

    let queryVector: number[];
    try {
      queryVector = await getEmbeddings("entities, relationships, concepts, nodes, edges");
    } catch (err) {
      console.error("⚠️ Embeddings failed, falling back to dummy vector:", err);
      queryVector = new Array(384).fill(0.01); 
    }

    // Fetch context chunks for the specific file
    const queryResponse = await index.query({
      vector: queryVector.length > 0 ? queryVector : new Array(384).fill(0.01),
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