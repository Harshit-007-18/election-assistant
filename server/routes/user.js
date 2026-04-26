const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/', async (req, res) => {
  try {
    const { sessionId, ...data } = req.body;
    if (!sessionId) return res.status(400).json({ error: 'sessionId is required' });

    const user = await User.findOneAndUpdate(
      { sessionId },
      { ...data, sessionId },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json(user);
  } catch (error) {
    console.error('User route error:', error);
    res.status(500).json({ error: 'Failed to save user data' });
  }
});

router.get('/:sessionId', async (req, res) => {
  try {
    const user = await User.findOne({ sessionId: req.params.sessionId });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

module.exports = router;
