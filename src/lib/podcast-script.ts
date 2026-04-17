import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function generatePodcastScript(text: string) {
  console.log("📜 Generating podcast script logic initiated...");
  
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is missing from environment variables.");
  }

  const systemPrompt = `
  You are an expert podcast producer.
  Convert the provided text into an engaging 2-minute conversation between "Host" and "Expert".
  
  STRICT RULES:
  1. Return ONLY a JSON object with a key "script" containing an array of objects.
  2. Format: {"script": [{"speaker": "Host", "text": "..."}, {"speaker": "Expert", "text": "..."}]}
  3. No markdown, no conversational filler outside the JSON.
  4. Use a fun, educational tone.
  `;

  try {
    let rawContent = "{}";
    const useLocalLlm = process.env.USE_LOCAL_LLM === "true";

    if (useLocalLlm) {
      console.log("🤖 Routing podcast script to local Ollama instance...");
      const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";
      const ollamaRes = await fetch(`${ollamaUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama3.2",
          format: "json", // Important to force JSON format in Ollama if tested natively
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Adapt this source text into a script:\n\n${text.slice(0, 8000)}` }
          ],
          stream: false,
        }),
      });

      if (!ollamaRes.ok) throw new Error("Ollama connection failed");
      const ollamaData = await ollamaRes.json();
      rawContent = ollamaData.message?.content || "{}";
    } else {
      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Adapt this source text into a script:\n\n${text.slice(0, 8000)}` }
        ],
        // Using a highly stable Llama 3.3 model ID
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      rawContent = completion.choices[0].message.content || "{}";
    }
    
    // Defensive parsing: Strip potential markdown code blocks if the LLM ignores the format rule
    const jsonString = rawContent.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(jsonString);
    
    const finalScript = parsed.script || parsed.dialogue || (Array.isArray(parsed) ? parsed : []);
    
    if (finalScript.length === 0) {
      throw new Error("LLM returned an empty script array.");
    }

    return finalScript;
  } catch (error: any) {
    console.error("Error in generatePodcastScript:", error);
    throw new Error(`Script Generation Failed: ${error.message}`);
  }
}