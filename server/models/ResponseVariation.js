const mongoose = require('mongoose');

const responseVariationSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  messages: [{ type: String }],
});

module.exports = mongoose.model('ResponseVariation', responseVariationSchema);
