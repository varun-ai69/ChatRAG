const { QdrantClient } = require("@qdrant/js-client-rest");

const client = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

const COLLECTION_NAME = "documents_v1";
const BATCH_SIZE = 20;


async function initVectorDB() {
  try {
    const collections = await client.getCollections();

    const exists = collections.collections.find(
      (c) => c.name === COLLECTION_NAME
    );

    if (!exists) {
      await client.createCollection(COLLECTION_NAME, {
        vectors: {
          size: 768, 
          distance: "Cosine",
        },
        optimizers_config: {
          memmap_threshold: 20000,
        },
      });

      await client.createPayloadIndex(COLLECTION_NAME, {
        field_name: "companyId",
        field_schema: "keyword",
      });

      await client.createPayloadIndex(COLLECTION_NAME, {
        field_name: "documentId",
        field_schema: "keyword",
      });

      console.log("Collection + indexes created:", COLLECTION_NAME);
    } else {
      console.log("Collection already exists");
    }
  } catch (err) {
    console.error("Qdrant init failed:", err);
    throw err;
  }
}

// Check if document already indexed
 
async function isDocumentAlreadyIndexed(documentId, companyId) {
  try {
    const result = await client.scroll(COLLECTION_NAME, {
      filter: {
        must: [
          { key: "documentId", match: { value: documentId } },
          { key: "companyId", match: { value: companyId } },
        ],
      },
      limit: 1,
    });

    return result.points.length > 0;
  } catch (err) {
    console.error("Document check failed:", err);
    throw err;
  }
}


 // Insert vectors (batched + safe)
 
async function insertVectors(embeddedChunks) {
  try {
    for (let i = 0; i < embeddedChunks.length; i += BATCH_SIZE) {
      const batch = embeddedChunks.slice(i, i + BATCH_SIZE);

       let attempts = 0;
      while (attempts < 3) {
        try {
          await client.upsert(COLLECTION_NAME, {
            wait: true,
            points: batch.map((chunk) => ({
              id: chunk.id,
              vector: chunk.vector,
              payload: chunk.payload,
            })),
          });
          break; // success - loop se bahar
        } catch (err) {
          attempts++;
          if (attempts === 3) throw err;
          console.log(`Batch failed, retrying... (${attempts}/3)`);
          await new Promise(r => setTimeout(r, 1000 * attempts)); // 1s, 2s wait
        }
      }


      console.log(
        ` Upserted ${Math.min(
          i + BATCH_SIZE,
          embeddedChunks.length
        )}/${embeddedChunks.length}`
      );
    }

    console.log(`Inserted ${embeddedChunks.length} vectors`);
  } catch (err) {
    console.error("Vector insert failed:", err);
    throw err;
  }
}


//   Search vectors
 
async function searchVectors(queryEmbedding, companyId, topK = 5) {
  try {
    return await client.search(COLLECTION_NAME, {
      vector: queryEmbedding,
      limit: topK,
      score_threshold: 0.7, 
      filter: {
        must: [{ key: "companyId", match: { value: companyId } }],
      },
      with_payload: true,
    });
  } catch (err) {
    console.error(" Search failed:", err);
    throw err;
  }
}

//delete vectors
async function deleteVectorsByDocument(documentId, companyId) {
  try {
    await client.delete(COLLECTION_NAME, {
      filter: {
        must: [
          { key: "documentId", match: { value: documentId } },
          { key: "companyId", match: { value: companyId } },
        ],
      },
    });

    console.log("🗑 Deleted document vectors:", documentId);
  } catch (err) {
    console.error(" Delete failed:", err);
    throw err;
  }
}

module.exports = {
  initVectorDB,
  insertVectors,
  searchVectors,
  deleteVectorsByDocument,
  isDocumentAlreadyIndexed,
};