import Groq from "groq-sdk";

export async function generateJSONResponse(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string
): Promise<string> {
  const useLocalLlm = process.env.USE_LOCAL_LLM === "true";

  if (useLocalLlm) {
    console.log("🤖 Routing request to local Ollama instance...");
    const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";
    const res = await fetch(`${ollamaUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2",
        format: "json",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        stream: false,
      }),
    });

    if (!res.ok) throw new Error("Ollama connection failed");
    const data = await res.json();
    return data.message?.content || "{}";
  } else {
    if (!apiKey) throw new Error("Missing GROQ_API_KEY");
    const groq = new Groq({ apiKey });
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });
    return completion.choices[0].message.content || "{}";
  }
}
