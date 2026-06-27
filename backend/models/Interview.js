const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetRole:   { type: String, required: true },
  skills:       { type: [String], default: [] },
  hrQuestions: [{
    question: String,
    answer:   { type: String, default: '' },
    answered: { type: Boolean, default: false }
  }],
  technicalQuestions: [{
    question:   String,
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    topic:      String,
    answer:     { type: String, default: '' },
    answered:   { type: Boolean, default: false }
  }],
  projectQuestions: [{
    question: String,
    answer:   { type: String, default: '' },
    answered: { type: Boolean, default: false }
  }],
  score:      { type: Number, default: 0 },
  completed:  { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Interview', interviewSchema);