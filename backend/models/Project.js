const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recommendations: [{
    title:        { type: String, required: true },
    description:  { type: String, default: '' },
    techStack:    { type: [String], default: [] },
    difficulty:   { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
    estimatedDays:{ type: Number, default: 7 },
    features:     { type: [String], default: [] },
    whyBuild:     { type: String, default: '' },
    resumeImpact: { type: String, default: '' },
    started:      { type: Boolean, default: false },
    completed:    { type: Boolean, default: false }
  }],
  generatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);