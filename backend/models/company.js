const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    apiKey: { type: String, required: true, unique: true },

    // ── Chatbot config ──────────────────────────────
    botName: { type: String, default: "" },
    welcomeMessage: { type: String, default: "" },
    avatar: { type: String, default: "" },

    // ── Widget color theme ──────────────────────────
    primaryColor:     { type: String, default: "#6C63FF" },
    headerBg:         { type: String, default: "#6C63FF" },
    headerText:       { type: String, default: "#ffffff" },
    botBubbleColor:   { type: String, default: "#f0efff" },
    botTextColor:     { type: String, default: "#1a1a2e" },
    userBubbleColor:  { type: String, default: "#6C63FF" },
    userTextColor:    { type: String, default: "#ffffff" },

    // ── Plan ───────────────────────────────────────
    plan: {
      type: String,
      enum: ["FREE", "PRO", "ENTERPRISE"],
      default: "FREE",
    },

    isActive: { type: Boolean, default: true },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ── Tracking ───────────────────────────────────
    scriptCopiedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Company", companySchema);