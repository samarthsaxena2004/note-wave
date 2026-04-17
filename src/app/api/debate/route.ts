// FILE: src/app/api/debate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import { RESEARCH_AGENTS } from "@/lib/agents";
import { getEmbeddings } from "@/lib/rag";
import { generateJSONResponse } from "@/lib/llm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileId, userId } = body;

    if (!fileId || !userId) return NextResponse.json({ error: "fileId and userId required" }, { status: 400 });

    let queryVector;
    try {
      queryVector = await getEmbeddings("key arguments, claims, hypothesis, core thesis, conclusions, critical perspectives");
    } catch (e) {
      console.warn("⚠️ Embeddings failed, falling back to dummy vector for debate");
      queryVector = new Array(384).fill(0.01);
    }

    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME!).namespace(userId);

    const queryResponse = await index.query({
      vector: queryVector,
      topK: 10,
      filter: { filename: fileId },
      includeMetadata: true,
    });

    const context = queryResponse.matches.map(m => m.metadata?.text).join("\n\n");

    const systemPrompt = `
      You are orchestrating a research debate between three agents:
      1. ${RESEARCH_AGENTS.CRITIC.name} (Critic)
      2. ${RESEARCH_AGENTS.SYNTHESIZER.name} (Synthesizer)
      3. ${RESEARCH_AGENTS.FACT_CHECKER.name} (Fact-Checker)

      Based on the context, generate a 6-turn transcript where they debate the core thesis.
      Format: {"transcript": [{"agent": "Critic", "text": "..."}, ...]}
    `;

    const content = await generateJSONResponse(systemPrompt, context.slice(0, 10000), process.env.GROQ_API_KEY!);
    return NextResponse.json(JSON.parse(content || '{"transcript":[]}'));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}