// controllers/chatController.js
const { v4: uuidv4 } = require("uuid");
const Chat = require("../models/chat");
const { retrieveRelevantChunks } = require("../services/retriver");
const { callLLM } = require("../services/llmCaller");

// ─────────────────────────────────────────
// 1. Init Session
// ─────────────────────────────────────────
exports.initSession = async (req, res) => {
  try {
    const companyId = req.companyId;
    const company = req.company;
    const { pageUrl } = req.body;

    const sessionId = uuidv4();

    await Chat.create({
      companyId,
      sessionId,
      meta: {
        ip: req.ip || "",
        userAgent: req.headers["user-agent"] || "",
        pageUrl: pageUrl || "",
      },
    });

    const botName = company.botName || `${company.name} Assistant`;
    const welcomeMessage =
      company.welcomeMessage ||
      `Hi! I am ${botName} from ${company.name}. How can I help you today?`;

    return res.status(201).json({
      sessionId,
      bot: {
        name: botName,
        welcomeMessage,
        avatar: company.avatar || "",
        primaryColor: company.primaryColor || "#6C63FF",
        headerBg: company.headerBg || company.primaryColor || "#6C63FF",
        headerText: company.headerText || "#ffffff",
        botBubbleColor: company.botBubbleColor || "#f0efff",
        botTextColor: company.botTextColor || "#1a1a2e",
        userBubbleColor: company.userBubbleColor || company.primaryColor || "#6C63FF",
        userTextColor: company.userTextColor || "#ffffff",
      },
    });
  } catch (err) {
    console.error("Session init error:", err);
    return res.status(500).json({ error: "Session init failed" });
  }
};

// ─────────────────────────────────────────
// 2. Handle Chat
// ─────────────────────────────────────────
exports.handleChat = async (req, res) => {
  try {
    const { query, sessionId } = req.body;
    const companyId = req.companyId;
    const company = req.company;

    // 1. Validate input
    if (!query || !sessionId) {
      return res.status(400).json({
        error: "query and sessionId are required",
      });
    }

    const trimmedQuery = query.trim();

    if (trimmedQuery.length === 0) {
      return res.status(400).json({ error: "Empty query not allowed" });
    }

    if (trimmedQuery.length > 1000) {
      return res.status(400).json({ error: "Query too long" });
    }

    // 2. Validate session
    const existingSession = await Chat.findOne({ sessionId, companyId }).lean();
    if (!existingSession) {
      return res.status(404).json({
        error: "Invalid session. Please refresh and try again.",
      });
    }

    // 3. Save user message + get recent history in ONE call
    const sessionDoc = await Chat.findOneAndUpdate(
      { sessionId, companyId },
      {
        $push: {
          messages: {
            $each: [
              {
                role: "user",
                text: trimmedQuery,
                timestamp: new Date(),
              },
            ],
            $slice: -200, // prevent document growth
          },
        },
        $inc: {
          messageCount: 1,
          userMessageCount: 1,
        },
        $set: {
          lastMessage: trimmedQuery.slice(0, 100),
          lastMessageAt: new Date(),
          lastActiveAt: new Date(),
        },
      },
      {
        new: true,
        projection: { messages: { $slice: -6 } },
      }
    ).lean();

    // remove current message from history
    const history =
      sessionDoc?.messages?.slice(0, -1).map((m) => ({
        role: m.role,
        text: m.text,
      })) || [];

    // 4. Retrieve relevant chunks
    const { chunks, context, isEmpty } = await retrieveRelevantChunks(
      trimmedQuery,
      companyId.toString()
    );

    // 5. LLM call or fallback
    let answer, isFallback, responseTimeMs;

    if (isEmpty) {
      answer =
        "I don't have that information. Please contact our support team.";
      isFallback = true;
      responseTimeMs = 0;
    } else {
      ({ answer, isFallback, responseTimeMs } = await callLLM({
        companyName: company.name,
        botName: company.botName || `${company.name} Assistant`,
        context,
        history,
        query: trimmedQuery,
      }));
    }

    // 6. Save assistant message
    await Chat.updateOne(
      { sessionId, companyId },
      {
        $push: {
          messages: {
            $each: [
              {
                role: "assistant",
                text: answer,
                timestamp: new Date(),
                isFallback,
                sources: chunks.map((c) => ({
                  page: c.page,
                  section: c.section,
                  documentId: c.documentId,
                  score: c.score,
                })),
              },
            ],
            $slice: -200,
          },
        },
        $inc: {
          messageCount: 1,
          assistantMessageCount: 1,
        },
        $set: {
          lastMessage: answer.slice(0, 100),
          lastMessageAt: new Date(),
          lastActiveAt: new Date(),
        },
      }
    );

    // 7. Response
    return res.status(200).json({
      answer,
      sessionId,
      isFallback,
      responseTimeMs,
      sources: isFallback
        ? []
        : chunks.map((c) => ({
          page: c.page,
          section: c.section,
        })),
    });
  } catch (err) {
    console.error("Chat error:", err);
    return res.status(500).json({
      error: "Chat failed. Please try again.",
    });
  }
};