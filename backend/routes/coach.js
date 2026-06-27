const router  = require('express').Router();
const protect = require('../middleware/auth');
const {
  chat,
  getConversations,
  getConversationById,
  deleteConversation
} = require('../controllers/coachController');

router.post  ('/chat',                protect, chat);
router.get   ('/conversations',       protect, getConversations);
router.get   ('/conversations/:id',   protect, getConversationById);
router.delete('/conversations/:id',   protect, deleteConversation);

module.exports = router;