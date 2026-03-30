/**
 * Ingestion Controller (RAG System – Data Preparation Layer)
 *
 * Flow:
 * 1. Hash check → skip duplicates
 * 2. Save document to Mongo as PROCESSING (sync, before responding)
 * 3. Respond immediately to client (no timeout)
 * 4. In background: parse → chunk → embed → insert vectors → mark ACTIVE
 */

const Document = require("../models/document");
const { parseDocument }  = require("../services/parsar");
const { generateChunks } = require("../services/chunkGenerator");
const { embedChunks }    = require("../services/embeddingService");
const { insertVectors }  = require("../services/vectorDb");
const fs     = require("fs").promises;
const crypto = require("crypto");

async function generateFileHash(filePath) {
    const buffer = await fs.readFile(filePath);
    return crypto.createHash("sha256").update(buffer).digest("hex");
}

exports.ingestDocuments = async (req, res) => {
    try {
        const files     = req.files;
        const companyId = req.user.companyId;
        const userId    = req.user.userId;

        if (!files || files.length === 0) {
            return res.status(400).json({ error: "No files uploaded" });
        }

        // ── Step 1: Save all docs to Mongo as PROCESSING (sync) ─────────────
        // Done BEFORE responding so the UI immediately sees them in the list.
        const pendingDocs = [];

        for (const file of files) {
            try {
                const fileHash    = await generateFileHash(file.path);
                const existingDoc = await Document.findOne({ companyId, fileHash });

                if (existingDoc) {
                    console.log("ℹ️  Skipping duplicate:", file.originalname);
                    continue;
                }

                const document = await Document.create({
                    companyId,
                    uploadedBy:       userId,
                    title:            file.originalname,
                    originalFileName: file.originalname,
                    storedFileName:   file.filename,
                    filePath:         file.path,
                    fileType:         file.mimetype,
                    fileSize:         file.size,
                    status:           "PROCESSING",
                    fileHash,
                });

                pendingDocs.push({ file, document });
                console.log("📄 Saved PROCESSING doc:", file.originalname);
            } catch (err) {
                console.error("❌ Pre-save error for:", file.originalname, err.message);
            }
        }

        // ── Step 2: Respond immediately ──────────────────────────────────────
        res.json({ message: "Upload received, processing started" });

        // ── Step 3: Background pipeline (no setImmediate — Promise chain) ────
        // initVectorDB is now called once at server startup, not here.
        Promise.resolve().then(async () => {
            for (const { file, document } of pendingDocs) {
                try {
                    console.log("🔄 Processing:", file.originalname);

                    const parsedChunks = await parseDocument(file.path, file.mimetype);
                    console.log("✅ Parsed:", file.originalname, "— pages/chunks:", parsedChunks.length);

                    const chunks = await generateChunks(parsedChunks, {
                        companyId,
                        documentId: document._id.toString(),
                        fileType:   file.mimetype,
                        docTitle:   file.originalname,
                    });
                    console.log("✅ Chunked:", chunks.length, "chunks");

                    const embeddedChunks = await embedChunks(chunks);
                    console.log("✅ Embedded:", embeddedChunks.length, "vectors");

                    await insertVectors(embeddedChunks);
                    console.log("✅ Vectors inserted for:", file.originalname);

                    document.status       = "ACTIVE";
                    document.chunkCount   = chunks.length;
                    document.lastIndexedAt = new Date();
                    await document.save();
                    console.log("✅ Document ACTIVE:", file.originalname);

                } catch (err) {
                    console.error("❌ Failed for:", file?.originalname);
                    console.error("❌ Error name:", err.name);
                    console.error("❌ Error message:", err.message);
                    console.error("❌ Stack:", err.stack);

                    document.status = "FAILED";
                    await document.save();
                }
            }
        });

    } catch (err) {
        console.error("INGESTION ERROR:", err);
        res.status(500).json({ error: "Failed ingestion" });
    }
};