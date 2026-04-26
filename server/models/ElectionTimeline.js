const mongoose = require('mongoose');

const electionTimelineSchema = new mongoose.Schema({
  state: { type: String, required: true, unique: true },
  registrationDeadline: { type: Date },
  electionDate: { type: Date },
  resultDate: { type: Date },
  notes: { type: String, default: '' },
});

module.exports = mongoose.model('ElectionTimeline', electionTimelineSchema);
