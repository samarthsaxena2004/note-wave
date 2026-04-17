// FILE: src/app/api/quiz/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import { getEmbeddings } from "@/lib/rag";
import { generateJSONResponse } from "@/lib/llm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileId, count = 5 } = body;

    if (!fileId) return NextResponse.json({ error: "fileId required" }, { status: 400 });

    let queryVector;
    try {
      queryVector = await getEmbeddings("facts, dates, definitions, core concepts, metrics, important details, study material");
    } catch (e) {
      console.warn("⚠️ Embeddings failed, falling back to dummy vector for quiz");
      queryVector = new Array(384).fill(0.01);
    }

    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME!);

    const queryResponse = await index.query({
      vector: queryVector,
      topK: 20, 
      filter: { filename: fileId },
      includeMetadata: true,
    });

    const context = queryResponse.matches.map((m) => m.metadata?.text || "").join("\n\n");

    const systemPrompt = `
      You are an expert educator specializing in Adaptive Learning. 
      Based on the context, generate exactly ${count} multiple-choice questions.
      
      CRITICAL: You must tag each question with a 'concept' (the specific topic being tested) and a 'difficulty' level (1-10).
      
      Format the output as a JSON object: 
      {
        "questions": [
          {
            "id": 1,
            "question": "Question text?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "answer": "Exact text of the correct option",
            "explanation": "Brief reasoning.",
            "concept": "Name of concept",
            "difficulty": 1-10
          }
        ]
      }
    `;

    const content = await generateJSONResponse(systemPrompt, context.slice(0, 12000), process.env.GROQ_API_KEY!);
    return NextResponse.json(JSON.parse(content || '{"questions": []}'));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}