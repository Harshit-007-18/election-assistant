const express = require('express');
const router = express.Router();
const { detectIntent } = require('../utils/intentDetector');
const { processMessage } = require('../utils/flowEngine');

router.post('/', async (req, res) => {
  try {
    const { sessionId, message } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({ error: 'sessionId and message are required' });
    }

    const intent = detectIntent(message);
    const response = await processMessage(sessionId, message, intent);

    res.json({
      ...response,
      intent,
      sessionId,
    });
  } catch (error) {
    console.error('Message route error:', error);
    res.json({
      messages: ["Oops! Something went wrong on my end. Let's try again."],
      quickReplies: ['✅ Check eligibility', '📋 Register to vote', '📅 Election timeline', '🗳️ Voting day steps'],
      intent: 'error',
    });
  }
});

module.exports = router;
