const mongoose = require('mongoose');

const phaseSchema = new mongoose.Schema({
  phase:       { type: Number,   required: true },
  title:       { type: String,   required: true },
  skills:      { type: [String], default: []    },
  weeks:       { type: Number,   default: 1     },
  description: { type: String,   default: ''    },
  resources:   { type: [String], default: []    },
  completed:   { type: Boolean,  default: false },
  completedAt: { type: Date,     default: null  }
});

const weeklyPlanSchema = new mongoose.Schema({
  week:       { type: Number,   required: true },
  title:      { type: String,   default: ''    },
  tasks:      { type: [String], default: []    },
  phase:      { type: Number,   default: 1     },
  completed:  { type: Boolean,  default: false }
});

const roadmapSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title:         { type: String,   default: ''    },
  targetRole:    { type: String,   required: true },
  currentSkills: { type: [String], default: []    },
  missingSkills: { type: [String], default: []    },
  totalWeeks:    { type: Number,   default: 0     },
  phases:        [phaseSchema],
  weeklyPlan:    [weeklyPlanSchema],
  isActive:      { type: Boolean,  default: true  },
  completedAt:   { type: Date,     default: null  }
}, { timestamps: true });

module.exports = mongoose.model('Roadmap', roadmapSchema);