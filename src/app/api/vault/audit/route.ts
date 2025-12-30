// FILE: src/app/api/vault/audit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { fileId } = await req.json();
    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME!);

    const queryResponse = await index.query({
      vector: new Array(384).fill(0.01),
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

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: context.slice(0, 10000) }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    return NextResponse.json(JSON.parse(completion.choices[0].message.content || '{}'));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}