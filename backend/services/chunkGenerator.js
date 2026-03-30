const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");
const crypto = require("crypto");
const { v5: uuidv5 } = require("uuid");
const NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 800,
    chunkOverlap: 150,
    separators: ["\n\n", "\n", ". ", " ", ""],
});

/**
 * Generate deterministic content hash
 */
function generateContentHash(documentId, text) {
    return crypto
        .createHash("sha256")
        .update(`${documentId}_${text}`)
        .digest("hex")
        .slice(0, 16);
}

// /**
//  * Main Chunk Generator
//  * @param {Array} parsedBlocks - output from parser
//  * @param {Object} options
//  */
async function generateChunks(parsedBlocks, options) {
    const {
        companyId,
        documentId,
        fileType = "pdf",
        docTitle = "Untitled Document",
    } = options;


    if (!companyId || !documentId) {
        throw new Error("companyId and documentId are required");
    }

    const finalChunks = [];
    let globalChunkIndex = 0;

    for (const block of parsedBlocks) {
        const { text, metadata } = block;

        if (!text || text.trim().length === 0) continue;


        const splitChunks = await splitter.splitText(text);

        for (const chunkText of splitChunks) {
            const trimmed = chunkText.trim();


            if (trimmed.length < 100) continue;

            const contentHash = generateContentHash(documentId, trimmed);


            const vectorId = uuidv5(`${companyId}_${documentId}_${contentHash}`, NAMESPACE);

            finalChunks.push({
                id: vectorId,

                payload: {
                    companyId,
                    documentId,

                    chunkId: `${documentId}_chunk_${globalChunkIndex}`,
                    chunkIndex: globalChunkIndex,

                    contentHash,

                    text: trimmed,
                    page: metadata?.page ?? null,
                    pageCount: metadata?.pageCount ?? null,
                    section: metadata?.section || "Unknown",
                    sectionIndex: metadata?.sectionIndex ?? null,
                    source: metadata?.source || "",
                    contentType: metadata?.contentType || "text",
                    length: trimmed.length,

                    tokenCount: Math.ceil(trimmed.length / 4),

                    fileType,
                    docTitle,

                    createdAt: new Date().toISOString(),
                },
            });

            globalChunkIndex++;
        }
    }

    // console.log(finalChunks);
    return finalChunks;
}

module.exports = { generateChunks };