const mongoose = require('mongoose');

const guideSchema = new mongoose.Schema({
  type: { type: String, required: true, enum: ['registration', 'voting_day'] },
  steps: [{ type: String }],
  lastUpdated: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Guide', guideSchema);
