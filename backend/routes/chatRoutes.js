const express = require("express");
const router = express.Router();

const { initSession, handleChat } = require("../controllers/chatController");
const { chatAuthMiddleware } = require("../middlewares/chatAuth");

// ✅ Short-circuit OPTIONS preflight before auth middleware
// router.options("*") crashes Express 5 — use pathless middleware instead
router.use((req, res, next) => {
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

router.use(chatAuthMiddleware);

/**
 * @route   POST /api/chat/session
 * @desc    Initialize a new chat session
 * @access  Public (via apiKey)
 */
router.post("/session", initSession);

/**
 * @route   POST /api/chat/message
 * @desc    Handle user message → RAG → LLM → response
 * @access  Public (via apiKey)
 */
router.post("/message", handleChat);

module.exports = router;