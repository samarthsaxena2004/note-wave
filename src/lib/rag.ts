import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export async function getEmbeddings(text: string) {
  try {
    const response = await hf.featureExtraction({
      model: "sentence-transformers/all-MiniLM-L6-v2",
      inputs: text,
    });
    return response as number[];
  } catch (error) {
    console.error("Error generating embeddings:", error);
    throw error;
  }
}

export function chunkText(text: string, chunkSize = 1000, overlap = 200): string[] {
  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    let endIndex = startIndex + chunkSize;

    // If at the end, take the rest
    if (endIndex >= text.length) {
      chunks.push(text.slice(startIndex));
      break;
    }

    // Try to find a break point
    let breakPoint = text.lastIndexOf('\n\n', endIndex);
    
    // Ensure the break point is actually meaningful (advances the cursor)
    // We strictly require the break point to be AHEAD of the start index
    if (breakPoint === -1 || breakPoint <= startIndex) {
        breakPoint = text.lastIndexOf('. ', endIndex);
    }
    if (breakPoint === -1 || breakPoint <= startIndex) {
        breakPoint = text.lastIndexOf(' ', endIndex);
    }

    // If still no valid break point found, or the break point is too far back
    // (creating a negative progress loop), force split at the limit
    if (breakPoint === -1 || breakPoint <= startIndex) {
      breakPoint = endIndex;
    }

    chunks.push(text.slice(startIndex, breakPoint));

    // Calculate new start index
    let nextStartIndex = breakPoint - overlap;

    // GUARD RAIL: Never allow the loop to get stuck or go backwards.
    // Ensure we move forward by at least 1 character no matter what.
    if (nextStartIndex <= startIndex) {
        nextStartIndex = startIndex + 1; 
    }
    
    // Update main variable
    startIndex = nextStartIndex;
  }

  return chunks;
}