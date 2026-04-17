import { NextRequest, NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import { generateJSONResponse } from "@/lib/llm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileId } = body;

    if (!fileId) return NextResponse.json({ error: "fileId required" }, { status: 400 });

    if (!process.env.GROQ_API_KEY || !process.env.PINECONE_API_KEY) {
      throw new Error("Missing API Keys");
    }

    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME!);

    // Fetch relevant document chunks
    const queryResponse = await index.query({
      vector: new Array(384).fill(0.01),
      topK: 12,
      filter: { filename: fileId },
      includeMetadata: true,
    });

    const contextText = queryResponse.matches
      .map((match) => match.metadata?.text || "")
      .join("\n\n");

    const systemPrompt = `
      Extract 8-10 flashcards from the text. 
      Format MUST be a JSON object: {"flashcards": [{"question": "...", "answer": "..."}]}
      Keep questions concise and answers informative.
    `;

    const content = await generateJSONResponse(systemPrompt, contextText.slice(0, 8000), process.env.GROQ_API_KEY!);
    const data = JSON.parse(content || '{"flashcards": []}');
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Flashcard API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}