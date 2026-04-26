const express = require('express');
const router = express.Router();
const ElectionTimeline = require('../models/ElectionTimeline');

router.get('/:state', async (req, res) => {
  try {
    const state = req.params.state;
    const timeline = await ElectionTimeline.findOne({
      state: { $regex: new RegExp(`^${state}$`, 'i') },
    });
    if (!timeline) return res.status(404).json({ error: `Timeline not found for ${state}` });
    res.json(timeline);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch timeline' });
  }
});

router.get('/', async (req, res) => {
  try {
    const timelines = await ElectionTimeline.find().sort({ electionDate: 1 });
    res.json(timelines);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch timelines' });
  }
});

module.exports = router;
