const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  completedTopics:   { type: [String], default: [] },
  completedProjects: { type: [String], default: [] },
  currentStreak:     { type: Number,   default: 0  },
  longestStreak:     { type: Number,   default: 0  },
  lastActiveDate:    { type: Date,     default: null },
  totalPoints:       { type: Number,   default: 0  },
  badges: [{
    name:       String,
    earnedAt:   { type: Date, default: Date.now },
    icon:       String
  }],
  weeklyGoal:         { type: Number, default: 10 }, // hours per week
  weeklyHoursLogged:  { type: Number, default: 0  },
  totalHoursLearned:  { type: Number, default: 0  },
}, { timestamps: true });

module.exports = mongoose.model('Progress', progressSchema);