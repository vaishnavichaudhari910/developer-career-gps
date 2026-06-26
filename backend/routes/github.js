const router  = require('express').Router();
const protect = require('../middleware/auth');
const {
  analyzeGitHubProfile,
  getMyGitHubAnalysis,
  getGitHubScore,
  getMyRepos,
  deleteGitHubAnalysis
} = require('../controllers/githubController');

router.post  ('/analyze', protect, analyzeGitHubProfile);
router.get   ('/my',      protect, getMyGitHubAnalysis);
router.get   ('/score',   protect, getGitHubScore);
router.get   ('/repos',   protect, getMyRepos);
router.delete('/my',      protect, deleteGitHubAnalysis);

module.exports = router;