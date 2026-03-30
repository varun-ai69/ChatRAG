// ============================================================
//  ADMIN PORTAL — ALL ROUTES (COMPLETE)
//  Models: User, Company, Document, Chat
// ============================================================

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const crypto = require("crypto");
const fs = require("fs").promises;

const User = require("../models/user");
const Company = require("../models/company");
const Document = require("../models/document");
const Chat = require("../models/chat");

const { deleteVectorsByDocument } = require("../services/vectorDb");
const { parseDocument } = require("../services/parsar");
const { generateChunks } = require("../services/chunkGenerator");
const { embedChunks } = require("../services/embeddingService");
const { initVectorDB, insertVectors } = require("../services/vectorDb");

const authMiddleware = require("../middlewares/authMiddleware");
const multer = require("multer");

router.use(authMiddleware);

// multer for document upload from admin portal
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`),
});
const upload = multer({ storage });

async function generateFileHash(filePath) {
  const buffer = await fs.readFile(filePath);
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

// ============================================================
//  1. PROFILE ROUTES  →  /api/admin/profile
// ============================================================

// GET /api/admin/profile
router.get("/profile", async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password").lean();
    const company = await Company.findById(req.user.companyId).lean();
    return res.json({ user, company });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// PUT /api/admin/profile — update name/email
router.put("/profile", async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { name, email },
      { returnDocument: "after" }
    ).select("-password").lean();
    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update profile" });
  }
});

// PUT /api/admin/profile/password
router.put("/profile/password", async (req, res) => {
  try {
    const bcrypt = require("bcrypt");
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ error: "Both passwords required" });
    if (newPassword.length < 8)
      return res.status(400).json({ error: "New password must be at least 8 characters" });

    const user = await User.findById(req.user.userId).select("+password");
    if (!user) return res.status(404).json({ error: "User not found" });

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(400).json({ error: "Current password incorrect" });

    user.password = newPassword;
    await user.save();
    return res.json({ message: "Password updated successfully" });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update password" });
  }
});

// ============================================================
//  2. HOME ROUTE  →  /api/admin/home
//  Single route for all home page data
// ============================================================

router.get("/home", async (req, res) => {
  try {
    const companyId = new mongoose.Types.ObjectId(req.user.companyId);

    const [
      totalDocuments,
      activeDocuments,
      failedDocuments,
      totalChunks,
      totalSessions,
      totalMessages,
      fallbackCount,
      resolvedChats,
      flaggedChats,
      recentChats,
      recentDocuments,
    ] = await Promise.all([
      Document.countDocuments({ companyId, isDeleted: false }),
      Document.countDocuments({ companyId, status: "ACTIVE", isDeleted: false }),
      Document.countDocuments({ companyId, status: "FAILED", isDeleted: false }),
      Document.aggregate([
        { $match: { companyId, isDeleted: false } },
        { $group: { _id: null, total: { $sum: "$chunkCount" } } },
      ]).then((r) => r[0]?.total || 0),
      Chat.countDocuments({ companyId }),
      Chat.aggregate([
        { $match: { companyId } },
        { $group: { _id: null, total: { $sum: "$messageCount" } } },
      ]).then((r) => r[0]?.total || 0),
      Chat.aggregate([
        { $match: { companyId } },
        { $unwind: "$messages" },
        { $match: { "messages.isFallback": true } },
        { $count: "total" },
      ]).then((r) => r[0]?.total || 0),
      Chat.countDocuments({ companyId, status: "resolved" }),
      Chat.countDocuments({ companyId, status: "flagged" }),
      // recent 5 chats
      Chat.find({ companyId })
        .sort({ lastActiveAt: -1 })
        .limit(5)
        .select("sessionId lastMessage lastActiveAt messageCount status meta")
        .lean(),
      // recent 5 documents
      Document.find({ companyId, isDeleted: false })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("originalFileName status chunkCount fileSize createdAt fileType")
        .lean(),
    ]);

    // getting started checklist
    const company = await Company.findById(req.user.companyId).lean();
    const checklist = {
      accountCreated: true,
      documentUploaded: activeDocuments > 0,
      chatbotConfigured: !!(company.botName && company.welcomeMessage),
      scriptCopied: company.scriptCopiedAt ? true : false,
    };

    return res.json({
      stats: {
        totalDocuments,
        activeDocuments,
        failedDocuments,
        totalChunks,
        totalSessions,
        totalMessages,
        fallbackCount,
        fallbackRate:
          totalMessages > 0
            ? ((fallbackCount / totalMessages) * 100).toFixed(1) + "%"
            : "0%",
        resolvedChats,
        flaggedChats,
      },
      recentChats,
      recentDocuments,
      checklist,
      knowledgeBase: {
        status: activeDocuments > 0 ? "healthy" : "empty",
        activeDocuments,
        totalDocuments,
        totalChunks,
        failedDocuments,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch home data" });
  }
});

// ============================================================
//  3. SETTINGS ROUTES  →  /api/admin/settings
// ============================================================

// GET /api/admin/settings
router.get("/settings", async (req, res) => {
  try {
    const company = await Company.findById(req.user.companyId).lean();
    const user = await User.findById(req.user.userId).select("-password").lean();
    return res.json({ company, user });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch settings" });
  }
});

// PUT /api/admin/settings/company — update company name
router.put("/settings/company", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Company name required" });
    const company = await Company.findByIdAndUpdate(
      req.user.companyId,
      { name },
      { returnDocument: "after" }
    ).lean();
    return res.json({ company });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update company" });
  }
});

// POST /api/admin/settings/regenerate-key
router.post("/settings/regenerate-key", async (req, res) => {
  try {
    const newKey = "pk_live_" + crypto.randomBytes(24).toString("hex");
    const company = await Company.findByIdAndUpdate(
      req.user.companyId,
      { apiKey: newKey },
      { returnDocument: "after" }
    ).lean();
    return res.json({ apiKey: company.apiKey });
  } catch (err) {
    return res.status(500).json({ error: "Failed to regenerate API key" });
  }
});

// GET /api/admin/settings/api-key — get current api key
router.get("/settings/api-key", async (req, res) => {
  try {
    const company = await Company.findById(req.user.companyId).select("apiKey plan").lean();
    return res.json({ apiKey: company.apiKey, plan: company.plan });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch API key" });
  }
});

// DELETE /api/admin/settings/account — delete account (dangerous)
router.delete("/settings/account", async (req, res) => {
  try {
    const { password } = req.body;
    const bcrypt = require("bcrypt");
    const user = await User.findById(req.user.userId).select("+password");
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Password incorrect" });

    // soft delete all documents
    await Document.updateMany(
      { companyId: req.user.companyId },
      { isDeleted: true, status: "DELETED" }
    );
    await Company.findByIdAndUpdate(req.user.companyId, { isActive: false });
    await User.findByIdAndUpdate(req.user.userId, { isActive: false });

    return res.json({ message: "Account deactivated" });
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete account" });
  }
});

// ============================================================
//  4. DOCUMENT ROUTES  →  /api/admin/documents
// ============================================================

// GET /api/admin/documents — list all with pagination + filter
router.get("/documents", async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const filter = { companyId: req.user.companyId, isDeleted: false };
    if (status) filter.status = status;
    if (search) filter.originalFileName = { $regex: search, $options: "i" };

    const [documents, total] = await Promise.all([
      Document.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .select("-filePath -storedFileName")
        .lean(),
      Document.countDocuments(filter),
    ]);

    return res.json({
      documents,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch documents" });
  }
});

// GET /api/admin/documents/:id — single document
router.get("/documents/:id", async (req, res) => {
  try {
    const doc = await Document.findOne({
      _id: req.params.id,
      companyId: req.user.companyId,
      isDeleted: false,
    }).lean();
    if (!doc) return res.status(404).json({ error: "Document not found" });
    return res.json({ document: doc });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch document" });
  }
});

// PUT /api/admin/documents/:id/rename — rename document title
router.put("/documents/:id/rename", async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: "Title required" });

    const doc = await Document.findOneAndUpdate(
      { _id: req.params.id, companyId: req.user.companyId, isDeleted: false },
      { title },
      { returnDocument: "after" }
    ).lean();

    if (!doc) return res.status(404).json({ error: "Document not found" });
    return res.json({ document: doc });
  } catch (err) {
    return res.status(500).json({ error: "Failed to rename document" });
  }
});

// DELETE /api/admin/documents/:id — soft delete + remove vectors
router.delete("/documents/:id", async (req, res) => {
  try {
    const doc = await Document.findOne({
      _id: req.params.id,
      companyId: req.user.companyId,
    });
    if (!doc) return res.status(404).json({ error: "Document not found" });

    await deleteVectorsByDocument(doc._id.toString(), req.user.companyId.toString());

    doc.isDeleted = true;
    doc.status = "DELETED";
    await doc.save();

    try { await fs.unlink(doc.filePath); } catch (_) {}

    return res.json({ message: "Document deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete document" });
  }
});

// POST /api/admin/documents/:id/reindex — retry failed document
router.post("/documents/:id/reindex", async (req, res) => {
  try {
    const doc = await Document.findOne({
      _id: req.params.id,
      companyId: req.user.companyId,
      isDeleted: false,
    });
    if (!doc) return res.status(404).json({ error: "Document not found" });

    doc.status = "PROCESSING";
    await doc.save();

    // delete old vectors first
    try { await deleteVectorsByDocument(doc._id.toString(), req.user.companyId.toString()); } catch (_) {}

    await initVectorDB();
    const parsedChunks = await parseDocument(doc.filePath, doc.fileType);
    const chunks = await generateChunks(parsedChunks, {
      companyId: req.user.companyId.toString(),
      documentId: doc._id.toString(),
      fileType: doc.fileType,
      docTitle: doc.title || doc.originalFileName,
    });
    const embeddedChunks = await embedChunks(chunks);
    await insertVectors(embeddedChunks);

    doc.status = "ACTIVE";
    doc.chunkCount = chunks.length;
    doc.lastIndexedAt = new Date();
    await doc.save();

    return res.json({ message: "Document re-indexed successfully", chunkCount: chunks.length });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to re-index document" });
  }
});


// ============================================================
//  5. CHAT ROUTES  →  /api/admin/chats
// ============================================================

// GET /api/admin/chats — all sessions paginated
router.get("/chats", async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const filter = { companyId: req.user.companyId };
    if (status) filter.status = status;
    if (search) filter.lastMessage = { $regex: search, $options: "i" };

    const [chats, total] = await Promise.all([
      Chat.find(filter)
        .sort({ lastActiveAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .select("sessionId messageCount userMessageCount assistantMessageCount lastMessage lastActiveAt status meta createdAt")
        .lean(),
      Chat.countDocuments(filter),
    ]);

    return res.json({ chats, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch chats" });
  }
});

// GET /api/admin/chats/recent — last 5 sessions for home page
router.get("/chats/recent", async (req, res) => {
  try {
    const chats = await Chat.find({ companyId: req.user.companyId })
      .sort({ lastActiveAt: -1 })
      .limit(5)
      .select("sessionId lastMessage lastActiveAt messageCount status meta")
      .lean();
    return res.json({ chats });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch recent chats" });
  }
});

// GET /api/admin/chats/fallbacks — sessions that have fallback messages
router.get("/chats/fallbacks", async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const companyId = new mongoose.Types.ObjectId(req.user.companyId);

    const sessions = await Chat.aggregate([
      { $match: { companyId } },
      { $unwind: "$messages" },
      { $match: { "messages.isFallback": true } },
      {
        $group: {
          _id: "$sessionId",
          fallbackCount: { $sum: 1 },
          lastFallbackAt: { $max: "$messages.timestamp" },
          lastMessage: { $last: "$messages.text" },
          totalMessages: { $first: "$messageCount" },
          status: { $first: "$status" },
          createdAt: { $first: "$createdAt" },
        },
      },
      { $sort: { fallbackCount: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: Number(limit) },
    ]);

    const total = await Chat.aggregate([
      { $match: { companyId } },
      { $unwind: "$messages" },
      { $match: { "messages.isFallback": true } },
      { $group: { _id: "$sessionId" } },
      { $count: "total" },
    ]).then((r) => r[0]?.total || 0);

    return res.json({ sessions, total, page: Number(page) });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch fallback chats" });
  }
});

// GET /api/admin/chats/:sessionId — full conversation
router.get("/chats/:sessionId", async (req, res) => {
  try {
    const chat = await Chat.findOne({
      sessionId: req.params.sessionId,
      companyId: req.user.companyId,
    }).lean();
    if (!chat) return res.status(404).json({ error: "Chat not found" });
    return res.json({ chat });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch chat" });
  }
});

// PUT /api/admin/chats/:sessionId/status
router.put("/chats/:sessionId/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["active", "resolved", "flagged"].includes(status))
      return res.status(400).json({ error: "Invalid status" });

    const chat = await Chat.findOneAndUpdate(
      { sessionId: req.params.sessionId, companyId: req.user.companyId },
      { status },
      { returnDocument: "after" }
    ).lean();

    return res.json({ chat });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update status" });
  }
});

// GET /api/admin/chats/:sessionId/export — export chat as JSON
router.get("/chats/:sessionId/export", async (req, res) => {
  try {
    const chat = await Chat.findOne({
      sessionId: req.params.sessionId,
      companyId: req.user.companyId,
    }).lean();
    if (!chat) return res.status(404).json({ error: "Chat not found" });

    // build CSV
    const rows = ["role,text,timestamp,isFallback"];
    chat.messages.forEach((m) => {
      const text = String(m.text).replace(/,/g, " ").replace(/\n/g, " ");
      rows.push(`${m.role},"${text}",${m.timestamp},${m.isFallback || false}`);
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=chat-${req.params.sessionId}.csv`);
    return res.send(rows.join("\n"));
  } catch (err) {
    return res.status(500).json({ error: "Failed to export chat" });
  }
});

// ============================================================
//  6. CHATBOT EDITOR ROUTES  →  /api/admin/chatbot
// ============================================================

// GET /api/admin/chatbot — current chatbot config
router.get("/chatbot", async (req, res) => {
  try {
    const company = await Company.findById(req.user.companyId)
      .select("botName welcomeMessage primaryColor botBubbleColor botTextColor avatar apiKey plan name")
      .lean();
    return res.json({ chatbot: company });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch chatbot config" });
  }
});

// PUT /api/admin/chatbot — update any chatbot field
router.put("/chatbot", async (req, res) => {
  try {
    const allowed = [
      "botName",
      "welcomeMessage",
      "primaryColor",
      "botBubbleColor",
      "botTextColor",
      "avatar",
      "headerBg",
      "headerText",
      "userBubbleColor",
      "userTextColor",
    ];
    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    const company = await Company.findByIdAndUpdate(
      req.user.companyId,
      updates,
      { returnDocument: "after" }
    ).lean();

    return res.json({ chatbot: company });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update chatbot" });
  }
});

// PUT /api/admin/chatbot/name — rename bot only
router.put("/chatbot/name", async (req, res) => {
  try {
    const { botName } = req.body;
    if (!botName) return res.status(400).json({ error: "Bot name required" });
    const company = await Company.findByIdAndUpdate(
      req.user.companyId,
      { botName },
      { returnDocument: "after" }
    ).lean();
    return res.json({ botName: company.botName });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update bot name" });
  }
});

// PUT /api/admin/chatbot/welcome — update welcome message only
router.put("/chatbot/welcome", async (req, res) => {
  try {
    const { welcomeMessage } = req.body;
    const company = await Company.findByIdAndUpdate(
      req.user.companyId,
      { welcomeMessage },
      { returnDocument: "after" }
    ).lean();
    return res.json({ welcomeMessage: company.welcomeMessage });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update welcome message" });
  }
});

// PUT /api/admin/chatbot/colors — update color theme only
router.put("/chatbot/colors", async (req, res) => {
  try {
    const { primaryColor, botBubbleColor, botTextColor, headerBg, userBubbleColor, userTextColor } = req.body;
    const updates = {};
    if (primaryColor) updates.primaryColor = primaryColor;
    if (botBubbleColor) updates.botBubbleColor = botBubbleColor;
    if (botTextColor) updates.botTextColor = botTextColor;
    if (headerBg) updates.headerBg = headerBg;
    if (userBubbleColor) updates.userBubbleColor = userBubbleColor;
    if (userTextColor) updates.userTextColor = userTextColor;

    const company = await Company.findByIdAndUpdate(
      req.user.companyId,
      updates,
      { returnDocument: "after" }
    ).lean();

    return res.json({
      primaryColor: company.primaryColor,
      botBubbleColor: company.botBubbleColor,
      botTextColor: company.botTextColor,
      headerBg: company.headerBg,
      userBubbleColor: company.userBubbleColor,
      userTextColor: company.userTextColor,
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update colors" });
  }
});

// PUT /api/admin/chatbot/avatar — update avatar URL
router.put("/chatbot/avatar", async (req, res) => {
  try {
    const { avatar } = req.body;
    const company = await Company.findByIdAndUpdate(
      req.user.companyId,
      { avatar },
      { returnDocument: "after" }
    ).lean();
    return res.json({ avatar: company.avatar });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update avatar" });
  }
});

// GET /api/admin/chatbot/preview — live preview config for widget
router.get("/chatbot/preview", async (req, res) => {
  try {
    const company = await Company.findById(req.user.companyId)
      .select("botName welcomeMessage primaryColor botBubbleColor botTextColor avatar headerBg userBubbleColor userTextColor name")
      .lean();

    // return widget config object — frontend can use this to render live preview
    return res.json({
      preview: {
        name: company.botName || `${company.name} Assistant`,
        company: company.name,
        welcomeMessage: company.welcomeMessage || `Hi! I am ${company.botName}. How can I help you?`,
        avatar: company.avatar || null,
        primaryColor: company.primaryColor || "#6C63FF",
        botBubbleColor: company.botBubbleColor || "#f0efff",
        botTextColor: company.botTextColor || "#1a1a2e",
        headerBg: company.headerBg || company.primaryColor || "#6C63FF",
        userBubbleColor: company.userBubbleColor || company.primaryColor || "#6C63FF",
        userTextColor: company.userTextColor || "#ffffff",
      },
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch preview" });
  }
});

// POST /api/admin/chatbot/reset — reset to defaults
router.post("/chatbot/reset", async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(
      req.user.companyId,
      {
        primaryColor: "#6C63FF",
        botBubbleColor: "#f0efff",
        botTextColor: "#1a1a2e",
        headerBg: "#6C63FF",
        userBubbleColor: "#6C63FF",
        userTextColor: "#ffffff",
        avatar: "",
      },
      { returnDocument: "after" }
    ).lean();
    return res.json({ message: "Reset to defaults", chatbot: company });
  } catch (err) {
    return res.status(500).json({ error: "Failed to reset chatbot" });
  }
});

// ============================================================
//  7. SCRIPT / API ROUTES  →  /api/admin/script
// ============================================================

// GET /api/admin/script — get embed script tag
router.get("/script", async (req, res) => {
  try {
    const company = await Company.findById(req.user.companyId).lean();
    const BASE = process.env.BASE_URL || "http://localhost:3000";

    const scriptTag = `<script\n  src="${BASE}/widget.js"\n  data-api-key="${company.apiKey}"\n  data-api-url="${BASE}/api/chat"\n></script>`;

    const npmSnippet = `// npm install @chatrag/widget\nimport ChatWidget from '@chatrag/widget';\nChatWidget.init({ apiKey: '${company.apiKey}', apiUrl: '${BASE}/api/chat' });`;

    // mark script as copied
    await Company.findByIdAndUpdate(req.user.companyId, { scriptCopiedAt: new Date() });

    return res.json({
      scriptTag,
      npmSnippet,
      apiKey: company.apiKey,
      apiUrl: `${BASE}/api/chat`,
      widgetUrl: `${BASE}/widget.js`,
      instructions: {
        html: "Paste the script tag before </body> in your HTML",
        react: "Use the npm snippet in your React app's root component",
      },
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to generate script" });
  }
});

// POST /api/admin/script/mark-copied — track when script was copied
router.post("/script/mark-copied", async (req, res) => {
  try {
    await Company.findByIdAndUpdate(req.user.companyId, { scriptCopiedAt: new Date() });
    return res.json({ message: "Marked as copied" });
  } catch (err) {
    return res.status(500).json({ error: "Failed to mark" });
  }
});

// GET /api/admin/script/test — test if widget is live on a URL
router.get("/script/test", async (req, res) => {
  try {
    const company = await Company.findById(req.user.companyId).lean();
    // check if any chat session exists — means widget is working
    const sessionCount = await Chat.countDocuments({ companyId: req.user.companyId });
    return res.json({
      isLive: sessionCount > 0,
      sessionCount,
      apiKey: company.apiKey,
      lastUsed: sessionCount > 0
        ? (await Chat.findOne({ companyId: req.user.companyId }).sort({ createdAt: -1 }).select("createdAt").lean())?.createdAt
        : null,
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to test script" });
  }
});

// ============================================================
//  8. ANALYTICS ROUTES  →  /api/admin/analytics
// ============================================================

// GET /api/admin/analytics/overview
router.get("/analytics/overview", async (req, res) => {
  try {
    const companyId = new mongoose.Types.ObjectId(req.user.companyId);

    const [
      totalDocuments,
      activeDocuments,
      totalChunks,
      totalSessions,
      totalMessages,
      fallbackCount,
      resolvedChats,
      flaggedChats,
    ] = await Promise.all([
      Document.countDocuments({ companyId, isDeleted: false }),
      Document.countDocuments({ companyId, status: "ACTIVE", isDeleted: false }),
      Document.aggregate([
        { $match: { companyId, isDeleted: false } },
        { $group: { _id: null, total: { $sum: "$chunkCount" } } },
      ]).then((r) => r[0]?.total || 0),
      Chat.countDocuments({ companyId }),
      Chat.aggregate([
        { $match: { companyId } },
        { $group: { _id: null, total: { $sum: "$messageCount" } } },
      ]).then((r) => r[0]?.total || 0),
      Chat.aggregate([
        { $match: { companyId } },
        { $unwind: "$messages" },
        { $match: { "messages.isFallback": true } },
        { $count: "total" },
      ]).then((r) => r[0]?.total || 0),
      Chat.countDocuments({ companyId, status: "resolved" }),
      Chat.countDocuments({ companyId, status: "flagged" }),
    ]);

    return res.json({
      totalDocuments, activeDocuments, totalChunks,
      totalSessions, totalMessages, fallbackCount,
      fallbackRate: totalMessages > 0
        ? ((fallbackCount / totalMessages) * 100).toFixed(1) + "%"
        : "0%",
      resolvedChats, flaggedChats,
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch overview" });
  }
});

// GET /api/admin/analytics/messages-per-day
router.get("/analytics/messages-per-day", async (req, res) => {
  try {
    const companyId = new mongoose.Types.ObjectId(req.user.companyId);
    const days = parseInt(req.query.days) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const data = await Chat.aggregate([
      { $match: { companyId, createdAt: { $gte: since } } },
      { $unwind: "$messages" },
      { $match: { "messages.timestamp": { $gte: since } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$messages.timestamp" } },
            role: "$messages.role",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.date": 1 } },
    ]);

    return res.json({ data });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch messages per day" });
  }
});

// GET /api/admin/analytics/sessions-per-day
router.get("/analytics/sessions-per-day", async (req, res) => {
  try {
    const companyId = new mongoose.Types.ObjectId(req.user.companyId);
    const days = parseInt(req.query.days) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const data = await Chat.aggregate([
      { $match: { companyId, createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          sessions: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return res.json({ data });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch sessions per day" });
  }
});

// GET /api/admin/analytics/top-fallback-queries
router.get("/analytics/top-fallback-queries", async (req, res) => {
  try {
    const companyId = new mongoose.Types.ObjectId(req.user.companyId);

    const data = await Chat.aggregate([
      { $match: { companyId } },
      { $unwind: "$messages" },
      { $match: { "messages.role": "user", "messages.isFallback": { $ne: true } } },
      {
        $group: {
          _id: "$messages.text",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    return res.json({ data });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch fallback queries" });
  }
});

// GET /api/admin/analytics/document-stats
router.get("/analytics/document-stats", async (req, res) => {
  try {
    const companyId = new mongoose.Types.ObjectId(req.user.companyId);
    const docs = await Document.find({ companyId, isDeleted: false })
      .select("title originalFileName chunkCount status lastIndexedAt fileSize createdAt fileType")
      .sort({ chunkCount: -1 })
      .lean();
    return res.json({ data: docs });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch document stats" });
  }
});

// GET /api/admin/analytics/response-quality — fallback rate over time
router.get("/analytics/response-quality", async (req, res) => {
  try {
    const companyId = new mongoose.Types.ObjectId(req.user.companyId);
    const days = parseInt(req.query.days) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const data = await Chat.aggregate([
      { $match: { companyId, createdAt: { $gte: since } } },
      { $unwind: "$messages" },
      { $match: { "messages.role": "assistant", "messages.timestamp": { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$messages.timestamp" } },
          total: { $sum: 1 },
          fallbacks: { $sum: { $cond: ["$messages.isFallback", 1, 0] } },
        },
      },
      {
        $addFields: {
          fallbackRate: {
            $cond: [
              { $gt: ["$total", 0] },
              { $multiply: [{ $divide: ["$fallbacks", "$total"] }, 100] },
              0,
            ],
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return res.json({ data });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch response quality" });
  }
});

// GET /api/admin/analytics/peak-hours — what hours get most traffic
router.get("/analytics/peak-hours", async (req, res) => {
  try {
    const companyId = new mongoose.Types.ObjectId(req.user.companyId);

    const data = await Chat.aggregate([
      { $match: { companyId } },
      { $unwind: "$messages" },
      { $match: { "messages.role": "user" } },
      {
        $group: {
          _id: { $hour: "$messages.timestamp" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return res.json({ data });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch peak hours" });
  }
});

module.exports = router;