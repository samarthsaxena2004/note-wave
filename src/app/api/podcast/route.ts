import { NextRequest, NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import { generatePodcastScript } from "@/lib/podcast-script";
import { getEmbeddings } from "@/lib/rag";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileId } = body;

    if (!fileId) return NextResponse.json({ error: "fileId required" }, { status: 400 });

    console.log(`🎙️ API: Fetching context for podcast: ${fileId}`);

    // 1. Check Environment Variables
    if (!process.env.PINECONE_API_KEY || !process.env.PINECONE_INDEX_NAME) {
      throw new Error("Pinecone configuration missing in .env.local");
    }

    // 2. Fetch Context from Pinecone
    let queryVector;
    try {
      queryVector = await getEmbeddings("main topics, overview, comprehensive summary, highlights, introduction, conclusion");
    } catch (e) {
      console.warn("⚠️ Embeddings failed, falling back to dummy vector for podcast context");
      queryVector = new Array(384).fill(0.01);
    }

    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME!);

    // Fetch top chunks for the file to build the script
    const queryResponse = await index.query({
      vector: queryVector, 
      topK: 15, 
      filter: { filename: fileId }, 
      includeMetadata: true,
    });

    const contextText = queryResponse.matches
      .map((match) => match.metadata?.text || "")
      .join("\n\n");

    if (!contextText || contextText.trim().length < 10) {
      return NextResponse.json({ 
        error: "No document content found. Ensure the file was ingested correctly." 
      }, { status: 404 });
    }

    // 3. Generate Script
    const script = await generatePodcastScript(contextText);
    
    return NextResponse.json({ script });

  } catch (error: any) {
    console.error("❌ PODCAST ROUTE CRASH:", error);
    // ALWAYS return JSON so the frontend doesn't receive a generic HTML error page
    return NextResponse.json({ 
      error: "Internal Server Error", 
      details: error.message 
    }, { status: 500 });
  }
}