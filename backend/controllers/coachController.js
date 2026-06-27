const Coach    = require('../models/Coach');
const User     = require('../models/User');
const { chatWithCoach } = require('../services/geminiService');

// ────────────────────────────────────────────────────────
// @route   POST /api/coach/chat
// @access  Private
// ────────────────────────────────────────────────────────
exports.chat = async (req, res, next) => {
  try {
    const { message, conversationId } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a message'
      });
    }

    // Get user context
    const user = await User.findById(req.user.id);

    // Find or create coach document
    let coachDoc = await Coach.findOne({ userId: req.user.id });
    if (!coachDoc) {
      coachDoc = await Coach.create({ userId: req.user.id, conversations: [] });
    }

    let conversation;

    if (conversationId) {
      // Continue existing conversation
      conversation = coachDoc.conversations.id(conversationId);
      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found'
        });
      }
    } else {
      // Start new conversation
      coachDoc.conversations.push({
        title:    message.substring(0, 50),
        messages: []
      });
      conversation = coachDoc.conversations[coachDoc.conversations.length - 1];
    }

    // Add user message
    conversation.messages.push({ role: 'user', content: message });

    // Get last 10 messages for context (avoid token overflow)
    const recentMessages = conversation.messages.slice(-10);

    console.log('🤖 GPS Coach thinking...');

    // Get AI response
    const aiResponse = await chatWithCoach(recentMessages, {
      name:           user.name,
      skills:         user.skills,
      role:           user.role,
      experience:     user.experience,
      githubUsername: user.githubUsername
    });

    // Add AI response to conversation
    conversation.messages.push({ role: 'assistant', content: aiResponse });

    await coachDoc.save();

    res.json({
      success: true,
      data: {
        conversationId: conversation._id,
        message:        aiResponse,
        history:        conversation.messages
      }
    });

  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────
// @route   GET /api/coach/conversations
// @access  Private
// ────────────────────────────────────────────────────────
exports.getConversations = async (req, res, next) => {
  try {
    const coachDoc = await Coach.findOne({ userId: req.user.id });

    if (!coachDoc) {
      return res.json({ success: true, count: 0, data: [] });
    }

    // Return conversations without full messages (just title + count)
    const conversations = coachDoc.conversations.map(conv => ({
      id:           conv._id,
      title:        conv.title,
      messageCount: conv.messages.length,
      createdAt:    conv.createdAt,
      lastMessage:  conv.messages[conv.messages.length - 1]?.content?.substring(0, 80) || ''
    }));

    res.json({
      success: true,
      count:   conversations.length,
      data:    conversations.reverse() // newest first
    });

  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────
// @route   GET /api/coach/conversations/:id
// @access  Private
// ────────────────────────────────────────────────────────
exports.getConversationById = async (req, res, next) => {
  try {
    const coachDoc = await Coach.findOne({ userId: req.user.id });

    if (!coachDoc) {
      return res.status(404).json({ success: false, message: 'No conversations found' });
    }

    const conversation = coachDoc.conversations.id(req.params.id);

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    res.json({ success: true, data: conversation });

  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────
// @route   DELETE /api/coach/conversations/:id
// @access  Private
// ────────────────────────────────────────────────────────
exports.deleteConversation = async (req, res, next) => {
  try {
    const coachDoc = await Coach.findOne({ userId: req.user.id });

    if (!coachDoc) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    coachDoc.conversations = coachDoc.conversations.filter(
      c => c._id.toString() !== req.params.id
    );

    await coachDoc.save();

    res.json({ success: true, message: 'Conversation deleted' });

  } catch (err) {
    next(err);
  }
};