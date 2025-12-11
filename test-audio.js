require('dotenv').config({ path: '.env.local' });

async function testElevenLabs() {
  console.log("🎧 Testing ElevenLabs Connection...");

  const apiKey = process.env.ELEVENLABS_API_KEY;
  
  // 1. Check for Key existence
  if (!apiKey) {
    console.error("❌ ERROR: No ELEVENLABS_API_KEY found in .env.local");
    console.log("👉 Tip: Make sure the file is named .env.local and saved.");
    return;
  }
  
  // 2. Check for whitespace issues
  if (apiKey.trim() !== apiKey) {
    console.error("❌ ERROR: Your API Key has hidden spaces at the start or end.");
    console.log("👉 Fix: Open .env.local and delete spaces around the key.");
    return;
  }

  console.log(`🔑 Key found: ${apiKey.slice(0, 5)}...`);

  // 3. Test the API (Check User Profile/Credits)
  try {
    const response = await fetch("https://api.elevenlabs.io/v1/user", {
      method: "GET",
      headers: { "xi-api-key": apiKey },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Request Failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ Connection Successful!");
    console.log(`📊 Subscription Status:`);
    console.log(`   - Character Usage: ${data.subscription.character_count} / ${data.subscription.character_limit}`);
    console.log(`   - Status: ${data.subscription.status}`);
    
    if (data.subscription.character_count >= data.subscription.character_limit) {
      console.warn("⚠️ WARNING: You have used all your free characters for this month!");
    }

  } catch (error) {
    console.error("❌ Connection Failed:", error.message);
  }
}

testElevenLabs();