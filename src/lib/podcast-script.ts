import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function generatePodcastScript(text: string) {
  console.log("📜 Generating podcast script...");
  
  const systemPrompt = `
  You are an expert podcast producer.
  Your goal is to convert the provided text into a 2-minute engaging conversation script between two hosts: "Host" (enthusiastic, curious) and "Expert" (knowledgeable, calm).
  
  Rules:
  1. **Format**: Return ONLY a valid JSON array of objects. No markdown, no code blocks.
     Format: [{"speaker": "Host", "text": "..."}, {"speaker": "Expert", "text": "..."}]
  2. **Content**: Summarize the key points of the text but make it sound like a casual chat. Use phrases like "Whoa, really?", "Exactly!", "So basically...".
  3. **Length**: Keep it around 10-12 exchanges total (short enough for a demo).
  4. **Tone**: Fun, fast-paced, and educational.
  `;

  const completion = await groq.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Here is the source text to adapt:\n\n${text.slice(0, 6000)}` } // Limit text to fit context
    ],
    model: "llama-3.3-70b-versatile",
    response_format: { type: "json_object" }, // Force JSON mode
  });

  const content = completion.choices[0].message.content || "{}";
  // Parse the JSON to ensure it's valid
  const script = JSON.parse(content);
  
  // Groq might wrap it in a root object like { "script": [...] } or just return the array.
  // We normalize it here.
  return Array.isArray(script) ? script : (script.dialogue || script.script || []);
}