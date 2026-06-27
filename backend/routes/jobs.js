const router  = require('express').Router();
const protect = require('../middleware/auth');
const {
  getMatchedJobs,
  searchJobs,
  saveJob,
  getSavedJobs,
  removeSavedJob,
  trackApplication,
  getApplications,
  updateApplicationStatus,
  deleteApplication
} = require('../controllers/jobController');

router.get   ('/matched',                      protect, getMatchedJobs);
router.get   ('/search',                       protect, searchJobs);
router.post  ('/save',                         protect, saveJob);
router.get   ('/saved',                        protect, getSavedJobs);
router.delete('/saved/:jobId',                 protect, removeSavedJob);
router.post  ('/apply',                        protect, trackApplication);
router.get   ('/applications',                 protect, getApplications);
router.patch ('/applications/:appId/status',   protect, updateApplicationStatus);
router.delete('/applications/:appId',          protect, deleteApplication);

module.exports = router;