import { getEmbeddings } from "./src/lib/rag";

async function test() {
  try {
    const res = await getEmbeddings("Hello world");
    console.log("Type:", typeof res);
    console.log("IsArray:", Array.isArray(res));
    console.log("Length:", res.length);
    if (res.length > 0) {
      console.log("First element:", res[0]);
    }
  } catch (e) {
    console.error("Error:", e);
  }
}

test();
