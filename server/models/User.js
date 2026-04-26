const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true, index: true },
  age: { type: Number, default: null },
  citizenship: { type: String, default: null },
  state: { type: String, default: null },
  isEligible: { type: Boolean, default: null },
  currentFlow: { type: String, default: null },
  currentStep: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
