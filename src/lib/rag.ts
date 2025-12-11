import { HfInference } from "@huggingface/inference";

// Helper to wait/sleep
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getEmbeddings(text: string) {
  // 1. Check for Key
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    throw new Error("Missing HUGGINGFACE_API_KEY in .env.local");
  }

  // 2. Initialize Client (Lazy initialization ensures it picks up the key)
  const hf = new HfInference(apiKey);

  // 3. Retry Loop (Try 3 times before giving up)
  const maxRetries = 3;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Clean text to avoid issues
      const cleanText = text.replace(/\n/g, " ").trim();
      
      if (!cleanText) return [];

      const response = await hf.featureExtraction({
        model: "sentence-transformers/all-MiniLM-L6-v2",
        inputs: cleanText,
      });
      
      return response as number[];

    } catch (error: any) {
      console.warn(`⚠️ Embedding attempt ${attempt} failed:`, error.message);
      
      // If it's a Rate Limit (429) or Service Unavailable (503), wait and retry
      if (attempt < maxRetries) {
        const waitTime = attempt * 2000; // Wait 2s, then 4s...
        console.log(`⏳ Waiting ${waitTime}ms before retry...`);
        await sleep(waitTime);
      } else {
        // If final attempt fails, throw error
        console.error("❌ All retry attempts failed.");
        throw error;
      }
    }
  }
  return [];
}

/**
 * RECURSIVE TEXT SPLITTER
 */
export function chunkText(text: string, chunkSize = 1000, overlap = 200): string[] {
  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    let endIndex = startIndex + chunkSize;

    if (endIndex >= text.length) {
      chunks.push(text.slice(startIndex));
      break;
    }

    let breakPoint = text.lastIndexOf('\n\n', endIndex);
    if (breakPoint === -1 || breakPoint <= startIndex) {
        breakPoint = text.lastIndexOf('. ', endIndex);
    }
    if (breakPoint === -1 || breakPoint <= startIndex) {
        breakPoint = text.lastIndexOf(' ', endIndex);
    }
    if (breakPoint === -1 || breakPoint <= startIndex) {
      breakPoint = endIndex;
    }

    chunks.push(text.slice(startIndex, breakPoint));

    let nextStartIndex = breakPoint - overlap;
    if (nextStartIndex <= startIndex) {
        nextStartIndex = startIndex + 1; 
    }
    startIndex = nextStartIndex;
  }

  return chunks;
}