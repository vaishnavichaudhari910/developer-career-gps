const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role:      { type: String, enum: ['user', 'assistant'], required: true },
  content:   { type: String, required: true },
  timestamp: { type: Date,   default: Date.now }
});

const coachSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  conversations: [{
    title:       { type: String,    default: 'New Conversation' },
    messages:    [messageSchema],
    createdAt:   { type: Date,      default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Coach', coachSchema);