import { NextRequest, NextResponse } from "next/server";
import { getEmbeddings } from "@/lib/rag";
import { Pinecone } from "@pinecone-database/pinecone";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, fileId } = body;

    // Get the last message
    const lastMessage = messages[messages.length - 1];
    const userQuestion = lastMessage.content;

    console.log("💬 Chat: Received question:", userQuestion);
    console.log("📂 Filtering by file:", fileId);

    // 1. Embed the user's question
    const embedding = await getEmbeddings(userQuestion);

    // 2. Query Pinecone for context
    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME!);

    const queryResponse = await index.query({
      vector: embedding,
      topK: 10,
      includeMetadata: true,
      // UPDATED: Filter results to only match the active file
      filter: { filename: fileId }, 
    });

    // 3. Construct the Context Block
    const contextText = queryResponse.matches
      .map((match) => match.metadata?.text || "")
      .join("\n\n---\n\n");

    console.log("🔍 Context found:", queryResponse.matches.length, "chunks");

    // 4. The "Super Prompt" (Refined with Link Handling)
    const systemPrompt = `
    You are NoteWave AI, a curious, intelligent, and human-like study companion. 
    You are NOT a robot. You are a "research partner."
    
    You have access to the following excerpts from a document uploaded by the user:
    ---
    ${contextText}
    ---

    YOUR BEHAVIORAL RULES:
    1. **Tone**: Be conversational, warm, and engaging. Never use robotic phrases like "According to the provided context" or "The document states." Instead, say "It looks like..." or "I found something interesting about..."
    2. **Curiosity**: Don't just answer—engage. After answering, ASK A FOLLOW-UP QUESTION related to the topic to keep the user learning.
    3. **Edge Case - Greetings**: If the user says "Hi", "Hello", or introduces themselves, DO NOT summarize the document yet. Just welcome them warmly and ask what they want to learn from the document today.
    4. **Edge Case - Unknown Info**: If the answer isn't in the chunks, be honest. Say: "I'm not seeing that specific detail in the notes I have right now. However, I do see info about [Related Topic]. Would you like to hear about that?"

    YOUR FORMATTING RULES (Strictly Follow These):
    - **Bold**: Use for **Proper Nouns** (names, places), **Key Terms** (definitions), and **Numbers/Dates** that are important.
    - *Italics*: Use for *emphasis* on adjectives, *book titles*, or to express *uncertainty/speculation*.
    - **Lists**: ALWAYS use bullet points or numbered lists for 3+ items.
    - **Links**: If the text contains a URL (like http://... or www...), ALWAYS format it as a markdown link: [Link Text](URL). Example: [Google](https://google.com).
    - **Headers**: Use ### for small section headers if the answer is long.
    - **No Caps**: Do not use ALL CAPS unless absolutely necessary for a warning.

    EXAMPLE OUTPUT (For a question about "The Moon"):
    "The **Moon** is fascinating because it's actually moving away from Earth! 🌑
    
    It drifts about **3.8 cm** further away every year. A few other cool facts found in the text:
    * It affects our **Ocean Tides** through gravitational pull.
    * It has a very thin atmosphere called an **Exosphere**.
    
    You can read more about it on [NASA's Website](https://nasa.gov).
    
    *I wonder*, does the text mention how this drift affects the length of our days on Earth? Should we check that?"
    `;

    // 5. Call Groq
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        ...messages 
      ],
      model: "llama-3.3-70b-versatile",
      stream: true,
    });

    // 6. Return Stream
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