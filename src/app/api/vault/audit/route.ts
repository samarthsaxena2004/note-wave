// FILE: src/app/api/vault/audit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import { getEmbeddings } from "@/lib/rag";
import { generateJSONResponse } from "@/lib/llm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileId, userId } = body;

    if (!fileId || !userId) return NextResponse.json({ error: "fileId and userId required" }, { status: 400 });

    let queryVector;
    try {
      queryVector = await getEmbeddings("statistics, evidence, citations, claims, logic, flaws, methodology");
    } catch (e) {
      console.warn("⚠️ Embeddings failed, falling back to dummy vector for audit");
      queryVector = new Array(384).fill(0.01);
    }

    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME!).namespace(userId);

    const queryResponse = await index.query({
      vector: queryVector,
      topK: 15,
      filter: { filename: fileId },
      includeMetadata: true,
    });

    const context = queryResponse.matches.map(m => m.metadata?.text).join("\n\n");

    const systemPrompt = `
      You are a Document Integrity Auditor. Analyze the provided context for truthfulness and bias.
      Return ONLY a JSON object:
      {
        "truthScore": 0-100,
        "biasScore": 0-100,
        "unsupportedClaims": ["List of suspicious or unverified claims found in text"],
        "provenance": "PDF Metadata Signature"
      }
    `;

    const content = await generateJSONResponse(systemPrompt, context.slice(0, 8000), process.env.GROQ_API_KEY!);
    return NextResponse.json(JSON.parse(content || '{"flaws": []}'));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}