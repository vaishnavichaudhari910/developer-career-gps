const router  = require('express').Router();
const protect = require('../middleware/auth');
const {
  getRecommendations,
  getMyRecommendations,
  markStarted,
  markCompleted
} = require('../controllers/projectController');

router.post  ('/recommend',              protect, getRecommendations);
router.get   ('/my',                     protect, getMyRecommendations);
router.patch ('/:projectId/start',       protect, markStarted);
router.patch ('/:projectId/complete',    protect, markCompleted);

module.exports = router;