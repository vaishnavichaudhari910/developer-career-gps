const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  savedJobs: [{
    jobId:       { type: String,   default: '' },
    title:       { type: String,   required: true },
    company:     { type: String,   default: '' },
    location:    { type: String,   default: '' },
    description: { type: String,   default: '' },
    url:         { type: String,   default: '' },
    salary:      { type: String,   default: 'Not disclosed' },
    jobType:     { type: String,   default: 'Full-time' },
    tags:        { type: [String], default: [] },
    matchScore:  { type: Number,   default: 0  },
    source:      { type: String,   default: 'Arbeitnow' },
    savedAt:     { type: Date,     default: Date.now }
  }],
  applications: [{
    jobTitle:    { type: String, required: true },
    company:     { type: String, default: '' },
    status: {
      type: String,
      enum: ['Applied', 'Interview', 'Offer', 'Rejected', 'Saved'],
      default: 'Applied'
    },
    appliedAt:   { type: Date,   default: Date.now },
    notes:       { type: String, default: '' },
    url:         { type: String, default: '' }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);