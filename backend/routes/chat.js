const express = require('express');
const router = express.Router();
const { chat } = require('../controllers/chatController');

/**
 * POST /api/chat
 * Body: { message: string, history: [{role, content}] }
 */
router.post('/', async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'message is required' });
    }
    if (message.trim().length > 2000) {
      return res.status(400).json({ error: 'message too long (max 2000 chars)' });
    }

    const reply = await chat(message.trim(), history);
    res.json({ reply });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
