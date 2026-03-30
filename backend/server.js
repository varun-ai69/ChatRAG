const express = require("express");
const app = express();
const dotenv = require("dotenv");
const connectDB = require('./config/db');

dotenv.config();
connectDB();


app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Max-Age", "86400");
  if (req.method === "OPTIONS") return res.sendStatus(204);
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

app.use((err, req, res, next) => {
  console.error("Global Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});