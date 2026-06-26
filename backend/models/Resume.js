const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalName: {
    type: String,
    default: ''
  },
  resumeText: {
    type: String,
    default: ''
  },
  atsScore: {
    type: Number,
    default: 0
  },
  strengths: {
    type: [String],
    default: []
  },
  weaknesses: {
    type: [String],
    default: []
  },
  suggestions: {
    type: [String],
    default: []
  },
  missingKeywords: {
    type: [String],
    default: []
  },
  detectedSkills: {
    type: [String],
    default: []
  },
  experienceLevel: {
    type: String,
    default: ''
  },
  summary: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);