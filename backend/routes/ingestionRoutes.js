const router = require("express").Router();
const { ingestDocuments } = require("../controllers/ingestionController");
const authMiddleware = require("../middlewares/authMiddleware")
const {uploadMultiple} = require("../middlewares/uploadMiddleware")




router.post("/ingestion",authMiddleware,uploadMultiple,ingestDocuments)




module.exports = router;