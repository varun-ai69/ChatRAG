/**
 * Ingestion Controller (RAG System – Data Preparation Layer system-1)
 *
 * This controller is responsible for the first stage of the RAG pipeline.
 * It handles the ingestion of raw input data and prepares it for retrieval-based
 * generation by converting unstructured content into structured, searchable form.
 *
 * The controller performs the following tasks:
 * - Accepts raw text extracted from documents or files
 * - Cleans and normalizes the content
 * - Splits the text into meaningful semantic chunks
 * - Prepares each chunk for embedding and storage in the vector database
 * - It also stores the document data into the DB
 *
 * This module represents the "training" or ingestion side of the RAG system.
 * It does NOT handle user queries or answer generation.
 * Its only responsibility is to convert raw knowledge into retrievable data.
 */

const Document = require("../models/document");
const { parseDocument } = require("../services/parsar");
const { generateChunks } = require("../services/chunkGenerator")
const { embedChunks } = require("../services/embeddingService")
const {
    initVectorDB,
    insertVectors,
} = require("../services/vectorDb");
const fs = require("fs").promises;
const crypto = require("crypto");
//it will generate a fileHash for ever file
async function generateFileHash(filePath) {
    const buffer = await fs.readFile(filePath);
    return crypto.createHash("sha256").update(buffer).digest("hex");
}

exports.ingestDocuments = async (req, res) => {
    try {
        const files = req.files;
        const companyId = req.user.companyId;
        const userId = req.user.userId;

        if (!files || files.length === 0) {
            return res.status(400).json({ error: "No files uploaded" });
        }

        // ✅ SAVE TO MONGO FIRST (before responding) so UI sees PROCESSING docs immediately
        const pendingDocs = [];

        for (const file of files) {
            try {
                const fileHash = await generateFileHash(file.path);
                const existingDoc = await Document.findOne({ companyId, fileHash });
                if (existingDoc) {
                    console.log("ℹ️ Skipping duplicate:", file.originalname);
                    continue;
                }

                const document = await Document.create({
                    companyId,
                    uploadedBy: userId,
                    title: file.originalname,
                    originalFileName: file.originalname,
                    storedFileName: file.filename,
                    filePath: file.path,
                    fileType: file.mimetype,
                    fileSize: file.size,
                    status: "PROCESSING",
                    fileHash,
                });

                pendingDocs.push({ file, document });
            } catch (err) {
                console.error("❌ Pre-save error for:", file.originalname, err);
            }
        }

        // ✅ RESPOND IMMEDIATELY — docs are now in DB as PROCESSING
        res.json({ message: "Upload received, processing started" });

        // 🔥 BACKGROUND: heavy embedding + vector insert
        setImmediate(async () => {
            try {
                await initVectorDB();

                for (const { file, document } of pendingDocs) {
                    try {
                        const parsedChunks = await parseDocument(file.path, file.mimetype);
                        const chunks = await generateChunks(parsedChunks, {
                            companyId,
                            documentId: document._id.toString(),
                            fileType: file.mimetype,
                            docTitle: file.originalname,
                        });

                        const embeddedChunks = await embedChunks(chunks);
                        console.log("🔥 EMBEDDING DONE:", file.originalname);

                        await insertVectors(embeddedChunks);
                        console.log("🔥 VECTOR INSERT DONE:", file.originalname);

                        document.status = "ACTIVE";
                        document.chunkCount = chunks.length;
                        document.lastIndexedAt = new Date();
                        await document.save();

                    } catch (err) {
                        console.error("❌ Background error for:", file?.originalname, err);
                        document.status = "FAILED";
                        await document.save();
                    }
                }

            } catch (err) {
                console.error("❌ GLOBAL BACKGROUND ERROR:", err);
            }
        });

    } catch (err) {
        console.error("INGESTION ERROR:", err);
        res.status(500).json({ error: "Failed ingestion" });
    }
};