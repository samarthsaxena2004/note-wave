import { NextRequest, NextResponse } from "next/server";
import { chunkText, getEmbeddings } from "@/lib/rag";
import { Pinecone } from "@pinecone-database/pinecone";
import { extractText } from "unpdf";

export async function POST(req: NextRequest) {
  try {
    console.log("📥 Ingest: Received upload request");

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Check size limit (block files > 4.5MB)
    if (file.size > 4.5 * 1024 * 1024) {
       return NextResponse.json({ error: "File too large. Please upload a PDF smaller than 4MB." }, { status: 413 });
    }

    console.log(`📄 Processing file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);

    // 1. Convert file to Uint8Array
    const arrayBuffer = await file.arrayBuffer();
    const fileData = new Uint8Array(arrayBuffer);
    
    // 2. Extract Text
    const pdfData = await extractText(fileData) as any;
    const rawText = pdfData.text || ""; 
    const text = typeof rawText === 'string' ? rawText : JSON.stringify(rawText);
    const totalPages = pdfData.totalPages || 0;

    if (text.trim().length === 0) {
        throw new Error("Could not extract text. The PDF might be an image scan or encrypted.");
    }

    console.log(`📝 Extracted text from ${totalPages} pages`);

    // 3. Chunk the text
    const chunks = chunkText(text, 1000, 200);
    console.log(`🧩 Created ${chunks.length} chunks`);

    // 4. Prepare Pinecone
    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME!);

    // 5. Generate Embeddings & Upload (BATCHED to avoid Rate Limits)
    console.log("🤖 Generating embeddings in batches...");
    
    const vectors = [];
    const BATCH_SIZE = 5; // Process 5 chunks at a time

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);
      
      console.log(`Processing batch ${i / BATCH_SIZE + 1} of ${Math.ceil(chunks.length / BATCH_SIZE)}...`);

      const batchPromises = batch.map(async (chunk, batchIndex) => {
        const embedding = await getEmbeddings(chunk);
        return {
          id: `${file.name}-${i + batchIndex}-${Date.now()}`, 
          values: embedding,
          metadata: {
            text: chunk,
            filename: file.name
          },
        };
      });

      // Wait for this small batch to finish before starting the next one
      const batchVectors = await Promise.all(batchPromises);
      vectors.push(...batchVectors);
      
      // Optional: Add a tiny pause to be extra polite to the API
      await new Promise(resolve => setTimeout(resolve, 200)); 
    }

    console.log(`🚀 Uploading ${vectors.length} vectors to Pinecone...`);
    
    // Pinecone also prefers batched uploads (max 100 at a time usually)
    // We can upload all at once if < 100, or batch upload if needed.
    // For safety, let's batch upload to Pinecone too if it's huge.
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