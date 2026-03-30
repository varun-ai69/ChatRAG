const express = require("express");
const app = express();
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");

dotenv.config();

// ── CORS ─────────────────────────────────────────────────────────────────────
// origin:"*" + no credentials = works from ANY website (dashboard + widget)
const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-api-key"],
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));
// cors() automatically ends OPTIONS preflight requests — no app.options() needed

// ── Body / Static ─────────────────────────────────────────────────────────────
app.use(express.static("public"));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
const authRoutes      = require("./routes/authRoutes");
const ingestionRoutes = require("./routes/ingestionRoutes");
const chatRoutes      = require("./routes/chatRoutes");
const adminRoutes     = require("./routes/adminRoutes");
const contactRoutes   = require("./routes/contactRoutes");

app.use("/api/auth",    authRoutes);
app.use("/api/upload",  ingestionRoutes);
app.use("/api/chat",    chatRoutes);
app.use("/api/admin",   adminRoutes);
app.use("/api/contact", contactRoutes);

app.get("/", (req, res) => res.send("API running"));

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Global Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// ── Boot — init VectorDB ONCE on startup, then start HTTP server ───────────────
const { initVectorDB } = require("./services/vectorDb");
const PORT = process.env.PORT || 3000;

connectDB()
  .then(async () => {
    try {
      await initVectorDB();
      console.log("✅ VectorDB initialised");
    } catch (e) {
      console.error("⚠️  VectorDB init failed (server will still start):", e.message);
    }
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ DB connection failed:", err);
    process.exit(1);
  });