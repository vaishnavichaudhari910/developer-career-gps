const router  = require('express').Router();
const protect = require('../middleware/auth');
const {
  getDashboardStats,
  logLearningHours,
  getMyBadges,
  addCompletedProject
} = require('../controllers/progressController');

router.get ('/stats',       protect, getDashboardStats);
router.post('/log-hours',   protect, logLearningHours);
router.get ('/badges',      protect, getMyBadges);
router.post('/add-project', protect, addCompletedProject);

module.exports = router;