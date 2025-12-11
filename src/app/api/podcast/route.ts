import { NextRequest, NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import { generatePodcastScript } from "@/lib/podcast-script";

export async function POST(req: NextRequest) {
  try {
    const { fileId } = await req.json(); // We will pass the filename

    console.log(`🎙️ Generating podcast for: ${fileId}`);

    // 1. Fetch Context from Pinecone
    // We fetch a bunch of random/relevant chunks to get the "gist" of the doc
    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME!);

    // Dummy query to fetch generic content (vector of 0.1s matches most things loosely)
    const queryResponse = await index.query({
      vector: new Array(384).fill(0.01), 
      topK: 20, 
      filter: { filename: fileId }, 
      includeMetadata: true,
    });

    const contextText = queryResponse.matches
      .map((match) => match.metadata?.text || "")
      .join("\n\n");

    if (!contextText) {
      throw new Error("No content found for this file.");
    }

    // 2. Generate Script
    const script = await generatePodcastScript(contextText);
    console.log("✅ Script generated:", script.length, "lines");

    return NextResponse.json({ script });

  } catch (error: any) {
    console.error("❌ Podcast Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}