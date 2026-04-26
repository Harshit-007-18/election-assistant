const express = require('express');
const router = express.Router();
const Guide = require('../models/Guide');

router.get('/:type', async (req, res) => {
  try {
    const guide = await Guide.findOne({ type: req.params.type });
    if (!guide) return res.status(404).json({ error: `Guide not found for type: ${req.params.type}` });
    res.json(guide);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch guide' });
  }
});

module.exports = router;
