const mongoose = require('mongoose');

const githubSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  name:         { type: String,   default: '' },
  bio:          { type: String,   default: '' },
  avatar:       { type: String,   default: '' },
  location:     { type: String,   default: '' },
  followers:    { type: Number,   default: 0  },
  following:    { type: Number,   default: 0  },
  publicRepos:  { type: Number,   default: 0  },
  totalStars:   { type: Number,   default: 0  },
  totalForks:   { type: Number,   default: 0  },
  languages:    { type: [String], default: [] },
  topRepos: [{
    name:        String,
    description: String,
    stars:       Number,
    forks:       Number,
    language:    String,
    url:         String,
    updatedAt:   String
  }],
  githubScore:     { type: Number, default: 0 },
  missingSkills:   { type: [String], default: [] },
  strengths:       { type: [String], default: [] },
  improvements:    { type: [String], default: [] },
  profileSummary:  { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('GitHub', githubSchema);