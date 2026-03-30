const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// POST /api/contact/submit
// Public route to accept contact form submissions
router.post('/submit', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Name, email, and message are required." });
    }

    const newMessage = new Message({ name, email, subject, message });
    await newMessage.save();

    res.status(201).json({ success: true, message: "Your message has been sent successfully." });
  } catch (error) {
    console.error("Error submitting contact form:", error);
    res.status(500).json({ error: "Failed to submit message. Please try again later." });
  }
});

module.exports = router;
