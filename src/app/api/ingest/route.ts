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

    console.log(`📄 Processing file: ${file.name} (${file.size} bytes)`);

    // 1. Convert file to Uint8Array
    const arrayBuffer = await file.arrayBuffer();
    const fileData = new Uint8Array(arrayBuffer);
    
    // 2. Extract Text (Bulletproof)
    const pdfData = await extractText(fileData) as any;
    
    // FIX: Force 'text' to be a string. 
    // If it's undefined, it becomes "". If it's an object/array, it becomes stringified.
    const rawText = pdfData.text || ""; 
    const text = typeof rawText === 'string' ? rawText : JSON.stringify(rawText);
    
    const totalPages = pdfData.totalPages || 0;

    // Safety check
    if (text.trim().length === 0) {
        throw new Error("Could not extract text. The PDF might be an image scan or encrypted.");
    }

    console.log(`📝 Extracted text from ${totalPages} pages`);
    // Print first 50 chars to debug what we actually got
    console.log(`📝 Text preview: ${text.slice(0, 50)}...`); 

    // 3. Chunk the text
    const chunks = chunkText(text, 1000, 200);
    console.log(`🧩 Created ${chunks.length} chunks`);

    // 4. Prepare Pinecone
    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME!);

    // 5. Generate Embeddings & Upload
    console.log("🤖 Generating embeddings...");
    
    // Batch processing
    const vectorPromises = chunks.map(async (chunk, i) => {
      const embedding = await getEmbeddings(chunk);
      return {
        id: `${file.name}-${i}-${Date.now()}`, // Unique ID
        values: embedding,
        metadata: {
          text: chunk,
          filename: file.name
        },
      };
    });

    const vectors = await Promise.all(vectorPromises);

    console.log("🚀 Uploading to Pinecone...");
    await index.upsert(vectors);

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