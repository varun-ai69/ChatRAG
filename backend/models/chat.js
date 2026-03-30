const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    isFallback: {
      type: Boolean,
      default: false,
    },
    sources: [
      {
        page: Number,
        section: String,
        documentId: String,
        score: Number,  
      },
    ],
  },
  { _id: false }
);

const chatSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    sessionId: {
      type: String,
      required: true,
    },

    messages: [messageSchema],

    messageCount: { type: Number, default: 0 },
    userMessageCount: { type: Number, default: 0 },
    assistantMessageCount: { type: Number, default: 0 },

    lastMessage: { type: String, default: "" },
    lastMessageAt: { type: Date, default: Date.now },
    lastActiveAt: { type: Date, default: Date.now },

    meta: {
      ip: String,
      userAgent: String,
      country: String,
      device: String,
    },

    status: {
      type: String,
      enum: ["active", "resolved", "flagged"],
      default: "active",
    },
  },
  { timestamps: true }
);

chatSchema.index({ companyId: 1, sessionId: 1 }, { unique: true });
chatSchema.index({ companyId: 1, lastActiveAt: -1 });
chatSchema.index({ companyId: 1, createdAt: -1 });

module.exports = mongoose.model("Chat", chatSchema);