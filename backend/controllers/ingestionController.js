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
        await initVectorDB(); //intialized the vectorDB collection
        const results = [];

        for (const file of files) {
            let document;
            try {
                //first check the document already exists in dtabase or not 
                const fileHash = await generateFileHash(file.path);
                //fileHash already exist karta hai then skip the ingestion pipeline 
                const existingDoc = await Document.findOne({
                    companyId,
                    fileHash
                });

                if (existingDoc) {
                    results.push({
                        file: file.originalname,
                        status: "SKIPPED_DUPLICATE_FILE",
                        documentId: existingDoc._id
                    });

                    continue;
                }
                //save docs into the database
                document = await Document.create({
                    companyId,
                    uploadedBy: userId,
                    title: file.originalname, // fallback
                    originalFileName: file.originalname,
                    storedFileName: file.filename,
                    filePath: file.path,
                    fileType: file.mimetype,
                    fileSize: file.size,
                    status: "PROCESSING",
                    fileHash: fileHash
                });
                // pipeline starts here 


                //1 parsing - it will extract raw text from the document
                const parsedChunks = await parseDocument(file.path, file.mimetype);

                //2 chunkGenerator - it will generate the chunks of the raw text 
                const chunks = await generateChunks(parsedChunks, {
                    companyId,
                    documentId: document._id.toString(),
                    fileType: file.mimetype,
                    docTitle: file.originalname,
                });

                //3 now we create vectors for every chunks 
                const embeddedChunks = await embedChunks(chunks);



                //4 now storing the vectors into the vectorDB 
                await insertVectors(embeddedChunks);


                //updating the Document data into the database
                document.status = "ACTIVE";
                document.chunkCount = chunks.length;
                document.lastIndexedAt = new Date();
                await document.save();

                results.push({
                    file: file.originalname,
                    status: "SUCCESS",
                    documentId: document._id,
                    totalChunks: chunks.length,
                });

            } catch (err) {
                console.error("Error saving file:", file.originalname, err);

                if (document) {
                    document.status = "FAILED";
                    await document.save();
                }

                results.push({
                    file: file.originalname,
                    status: "FAILED"
                });
            }
        }

        res.json({
            message: "Ingestion completed",
            results
        });

    } catch (err) {
        console.error("INGESTION ERROR:", err);
        res.status(500).json({ error: "Failed ingestion" });
    }
};