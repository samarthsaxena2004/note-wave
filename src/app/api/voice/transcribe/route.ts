// FILE: src/app/api/voice/transcribe/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@deepgram/sdk";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as Blob;
    
    const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);
    const buffer = Buffer.from(await file.arrayBuffer());

    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      buffer,
      { model: "nova-2", smart_format: true }
    );

    if (error) throw error;

    return NextResponse.json({ 
      transcript: result.results.channels[0].alternatives[0].transcript 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}