const express = require("express");
const router = express.Router();

const { initSession, handleChat } = require("../controllers/chatController");
const { chatAuthMiddleware } = require("../middlewares/chatAuth");

// OPTIONS preflight is handled globally in server.js — no local handler needed
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