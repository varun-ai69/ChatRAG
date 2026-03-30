const { pipeline } = require("@xenova/transformers");
let embedder = null;

async function getModel() {
  if (!embedder) {
    embedder = await pipeline(
      "feature-extraction",
      "Xenova/bge-base-en-v1.5"
    );
    console.log("✅ BGE model loaded");
  }
  return embedder;
}
/**
 * Embed query (IMPORTANT DIFFERENT FORMAT) beacuse model do better embedding in case of proper input
 */
async function embedQuery(query) {
  const model = await getModel();
  const output = await model("query: " + query, {
    pooling: "mean",
    normalize: true,
  });
  return Array.from(output.data);
}
/**
 * Embed chunks (passage format)
 */
async function embedChunks(chunks) {
  const model = await getModel();
  const results = [];
  for (const chunk of chunks) {
    const output = await model("passage: " + chunk.payload.text, {
      pooling: "mean",
      normalize: true,
    });
    results.push({
      id: chunk.id,
      vector: Array.from(output.data),
      payload: chunk.payload,
    });
  }
  return results;
}
module.exports = {
  embedQuery,
  embedChunks,
}; 