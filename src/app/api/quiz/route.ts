import { NextRequest, NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { fileId, count = 5 } = await req.json();

    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME!);

    const queryResponse = await index.query({
      vector: new Array(384).fill(0.01),
      topK: 20, // Fetch more context for larger quizzes
      filter: { filename: fileId },
      includeMetadata: true,
    });

    const context = queryResponse.matches.map((m) => m.metadata?.text || "").join("\n\n");

    const systemPrompt = `
      You are an expert educator. Based on the provided context, generate exactly ${count} multiple-choice questions.
      Format the output as a JSON object: 
      {
        "questions": [
          {
            "id": 1,
            "question": "Question text?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "answer": "Exact text of the correct option",
            "explanation": "Brief reasoning why this is correct."
          }
        ]
      }
    `;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: context.slice(0, 12000) }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    return NextResponse.json(JSON.parse(completion.choices[0].message.content || '{"questions": []}'));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}