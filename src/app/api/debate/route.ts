// FILE: src/app/api/debate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import Groq from "groq-sdk";
import { RESEARCH_AGENTS } from "@/lib/agents";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { fileId } = await req.json();
    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME!);

    const queryResponse = await index.query({
      vector: new Array(384).fill(0.01),
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

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: context.slice(0, 10000) }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    return NextResponse.json(JSON.parse(completion.choices[0].message.content || '{"transcript":[]}'));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}