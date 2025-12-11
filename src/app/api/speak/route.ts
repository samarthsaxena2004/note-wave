import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text, speaker } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    // Voice IDs
    // Host = Adam (Male, Deep, Narration-like)
    // Expert = Rachel (Female, Clear, Professional)
    const VOICE_ID = speaker === "Host" 
      ? "pNInz6obpgDQGcFmaJgB" 
      : "21m00Tcm4TlvDq8ikWAM"; 

    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

    if (!ELEVENLABS_API_KEY) {
      throw new Error("Missing ElevenLabs API Key");
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: text,
          // UPDATED: 'eleven_monolingual_v1' is deprecated. 
          // We use 'eleven_multilingual_v2' which is the current standard for free tier.
          model_id: "eleven_multilingual_v2", 
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75, // Increased slightly for better clarity
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs API Error:", errorText);
      throw new Error(`ElevenLabs API Error: ${errorText}`);
    }

    // Return the audio stream directly to the frontend
    const audioBuffer = await response.arrayBuffer();
    
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
      },
    });

  } catch (error: any) {
    console.error("❌ Speech Generation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}