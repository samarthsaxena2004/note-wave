require('dotenv').config({ path: '.env.local' });
const { Pinecone } = require('@pinecone-database/pinecone');
const { HfInference } = require('@huggingface/inference');

async function testConnections() {
  console.log("Testing connections...");

  // 1. Test Hugging Face
  try {
    const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
    const embedding = await hf.featureExtraction({
      model: 'sentence-transformers/all-MiniLM-L6-v2',
      inputs: 'Hello world',
    });
    console.log("✅ Hugging Face: Success! Embedding generated.");
  } catch (e) {
    console.error("❌ Hugging Face Failed:", e.message);
  }

  // 2. Test Pinecone
  try {
    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const index = pc.index(process.env.PINECONE_INDEX_NAME);
    const stats = await index.describeIndexStats();
    console.log("✅ Pinecone: Success! Index found.");
  } catch (e) {
    console.error("❌ Pinecone Failed:", e.message);
  }
}

testConnections();