import { NextRequest, NextResponse } from "next/server";
import { chunkText, getEmbeddings } from "@/lib/rag";
import { Pinecone } from "@pinecone-database/pinecone";
import { extractText } from "unpdf";

export async function POST(req: NextRequest) {
  try {
    console.log("📥 Ingest: Received upload request");

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;

    if (!file || !userId) {
      return NextResponse.json({ error: "File or User ID missing" }, { status: 400 });
    }

    // Check size limit (block files > 4.5MB)
    if (file.size > 4.5 * 1024 * 1024) {
       return NextResponse.json({ error: "File too large. Please upload < 4MB." }, { status: 413 });
    }

    console.log(`📄 Processing file: ${file.name} for user ${userId}`);

    // 1. Convert file
    const arrayBuffer = await file.arrayBuffer();
    const fileData = new Uint8Array(arrayBuffer);
    
    // 2. Extract Text
    const pdfData = await extractText(fileData) as any;
    const rawText = pdfData.text || ""; 
    const text = typeof rawText === 'string' ? rawText : JSON.stringify(rawText);

    if (text.trim().length === 0) {
        throw new Error("Could not extract text.");
    }

    // 3. Chunk
    const chunks = chunkText(text, 1000, 200);

    // 4. Prepare Pinecone
    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME!).namespace(userId);

    // 5. Generate Embeddings & Upload
    const vectors = [];
    const BATCH_SIZE = 5;

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map(async (chunk, batchIndex) => {
        const embedding = await getEmbeddings(chunk);
        return {
          id: `${file.name}-${i + batchIndex}-${Date.now()}`, 
          values: embedding,
          metadata: { text: chunk, filename: file.name, userId },
        };
      });

      const batchVectors = await Promise.all(batchPromises);
      vectors.push(...batchVectors);
      await new Promise(resolve => setTimeout(resolve, 200)); 
    }

    const PINECONE_BATCH = 50;
    for (let i = 0; i < vectors.length; i += PINECONE_BATCH) {
        const batch = vectors.slice(i, i + PINECONE_BATCH);
        await index.upsert(batch);
    }

    console.log("✅ Ingest complete!");
    return NextResponse.json({ 
      success: true, 
      uploaded: vectors.length,
      filename: file.name 
    });

  } catch (error: any) {
    console.error("❌ Ingest Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}