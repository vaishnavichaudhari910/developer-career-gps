const router  = require('express').Router();
const protect = require('../middleware/auth');
const {
  generateQuestions,
  getMyInterviews,
  getInterviewById,
  evaluateInterviewAnswer,
  deleteInterview
} = require('../controllers/interviewController');

router.post  ('/generate',          protect, generateQuestions);
router.get   ('/my',                protect, getMyInterviews);
router.get   ('/:id',               protect, getInterviewById);
router.post  ('/:id/evaluate',      protect, evaluateInterviewAnswer);
router.delete('/:id',               protect, deleteInterview);

module.exports = router;