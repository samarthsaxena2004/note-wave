import { NextRequest, NextResponse } from "next/server";
import { getEmbeddings } from "@/lib/rag";
import { Pinecone } from "@pinecone-database/pinecone";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages } = body;

    // Get the last message (the user's question)
    const lastMessage = messages[messages.length - 1];
    const userQuestion = lastMessage.content;

    console.log("💬 Chat: Received question:", userQuestion);

    // 1. Embed the user's question
    const embedding = await getEmbeddings(userQuestion);

    // 2. Query Pinecone for context
    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME!);

    const queryResponse = await index.query({
      vector: embedding,
      topK: 3, // Get the top 3 most relevant chunks
      includeMetadata: true,
    });

    // 3. Construct the Context Block
    const contextText = queryResponse.matches
      .map((match) => match.metadata?.text || "")
      .join("\n\n---\n\n");

    console.log("🔍 Context found:", queryResponse.matches.length, "chunks");

    // 4. Create the System Prompt
    const systemPrompt = `
    You are an AI assistant for a RAG application called NoteWave.
    You are given a Context block below containing snippets from a PDF document.
    Answer the user's question based ONLY on that context.
    If the answer is not in the context, say "I'm sorry, I couldn't find that information in the document."
    Do not hallucinate facts.
    
    START CONTEXT
    ${contextText}
    END CONTEXT
    `;

    // 5. Call Groq (Llama 3) with Streaming
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        ...messages // Pass previous chat history so it remembers the conversation
      ],
      model: "llama-3.3-70b-versatile", // UPDATED: New stable model ID
      stream: true,
    });

    // 6. Return a ReadableStream (Standard Web API)
    // This allows the frontend to display text as it arrives
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            controller.enqueue(new TextEncoder().encode(content));
          }
        }
        controller.close();
      },
    });

    return new NextResponse(stream, {
      headers: { "Content-Type": "text/plain" },
    });

  } catch (error: any) {
    console.error("❌ Chat Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}