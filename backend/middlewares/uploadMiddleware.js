const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ================================
// CONFIG
// ================================
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
];

// ================================
// STORAGE CONFIG
// ================================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      const companyId = req.user.companyId.toString(); // 🔥 important

      const uploadPath = path.join("uploads", companyId);

      // create folder if not exists
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      cb(null, uploadPath);
    } catch (err) {
      cb(err, null);
    }
  },

  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    const ext = path.extname(file.originalname);

    cb(null, `${uniqueName}${ext}`);
  }
});

// ================================
// FILE FILTER
// ================================
function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(
      new Error("Invalid file type. Only PDF, DOC, DOCX, TXT, XLS allowed."),
      false
    );
  }
  cb(null, true);
}

// ================================
// MULTER INSTANCE
// ================================
const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter
});

// ================================
// EXPORT MIDDLEWARE
// ================================
module.exports = {
  uploadSingle: upload.single("file"),
  uploadMultiple: upload.array("files", 10)
};