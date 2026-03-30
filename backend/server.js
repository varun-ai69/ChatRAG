const express = require("express");
const app = express();
const dotenv = require("dotenv");
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const cors = require("cors");

// Open CORS — works for both dashboard and embedded widget from any origin
const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-api-key"],
};
app.use(cors(corsOptions));

// ✅ Pre-flight: any OPTIONS request is answered immediately with CORS headers
// Must be BEFORE all route middleware so auth never runs on preflight
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.static("public"));
app.use(express.json());

const authRoutes = require("./routes/authRoutes");
const ingestionRoutes = require("./routes/ingestionRoutes");
const chatRoutes = require("./routes/chatRoutes");
const adminRoutes = require("./routes/adminRoutes");
const contactRoutes = require("./routes/contactRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/upload", ingestionRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/contact", contactRoutes);

app.get("/", (req, res) => {
  res.send("API running");
});

// 404 handler for any unmatched route
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use((err, req, res, next) => {
  console.error("Global Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});