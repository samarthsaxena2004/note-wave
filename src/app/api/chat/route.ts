import { NextRequest, NextResponse } from "next/server";
import { getEmbeddings } from "@/lib/rag";
import { Pinecone } from "@pinecone-database/pinecone";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, fileId } = body;

    const lastMessage = messages[messages.length - 1];
    const userQuestion = lastMessage.content;

    const embedding = await getEmbeddings(userQuestion);
    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME!);

    const queryResponse = await index.query({
      vector: embedding,
      topK: 10,
      includeMetadata: true,
      filter: { filename: fileId }, 
    });

    const contextText = queryResponse.matches
      .map((match) => match.metadata?.text || "")
      .join("\n\n---\n\n");

    const systemPrompt = `
    You are NoteWave AI, a high-intelligence research partner.
    
    STRICT FORMATTING RULES:
    1. READABILITY: Use hierarchical structure. Start with a 3-word summary of the answer in ### Bold Header.
    2. BOLDING: **Bold** every single technical term, date, or name mentioned.
    3. LISTS: If your answer has multiple points, ALWAYS use bulleted lists.
    4. TABLES: If comparing 2 or more things, ALWAYS create a Markdown Table.
    5. NO WALLS OF TEXT: Keep paragraphs under 3 lines. Use line breaks.

    COMMAND REGISTRY:
    - /podcast: Recommend if user wants an audio conversation.
    - /summary: Recommend for overview.
    - /quiz: Recommend for exam prep.
    - /flashcards: Recommend for memorization.

    CONTEXT:
    ---
    ${contextText}
    ---
    `;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      model: "llama-3.3-70b-versatile",
      stream: true,
    });

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) controller.enqueue(new TextEncoder().encode(content));
        }
        controller.close();
      },
    });

    return new NextResponse(stream, { headers: { "Content-Type": "text/plain" } });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}