// services/retriever.js
const { embedQuery } = require("./embeddingService");
const { searchVectors } = require("./vectorDb");

async function retrieveRelevantChunks(query, companyId, options = {}) {
  const {
    topK = 5,
    maxContextLength = 3000,
  } = options;

  if (!query || !companyId) {
    throw new Error("Query and companyId are required");
  }

  try {
    // 1. embed query
    const queryEmbedding = await embedQuery(query);

    // 2. vector search — filtering already in vectorDb
    const results = await searchVectors(queryEmbedding, companyId, topK);

    // 3. empty check
    if (!results || results.length === 0) {
      return { chunks: [], context: "", isEmpty: true };
    }

    // 4. normalize chunks
    const chunks = results.map((r) => ({
      text: r.payload.text,
      score: r.score,
      documentId: r.payload.documentId,
      page: r.payload.page,
      section: r.payload.section,
    }));

    // 5. build context — chunk level cut, not string slice
    let context = "";
    for (let i = 0; i < chunks.length; i++) {
      const addition = `Source ${i + 1}:\n${chunks[i].text}\n(Page: ${
        chunks[i].page ?? "N/A"
      }, Section: ${chunks[i].section || "Unknown"})\n\n`;

      if (context.length + addition.length > maxContextLength) break;
      context += addition;
    }

    return {
      chunks,
      context: context.trim(),
      isEmpty: false,
    };

  } catch (error) {
    console.error("Retriever Error:", error);
    return { chunks: [], context: "", isEmpty: true, error: true };
  }
}

module.exports = { retrieveRelevantChunks };