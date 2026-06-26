const router  = require('express').Router();
const protect = require('../middleware/auth');
const upload  = require('../middleware/upload');
const {
  uploadResume,
  getMyResumes,
  getResumeById,
  deleteResume,
  getATSScore,
} = require('../controllers/resumeController');

// All routes are protected
router.post  ('/upload',       protect, upload.single('resume'), uploadResume);
router.get   ('/my',           protect, getMyResumes);
router.get   ('/:id',          protect, getResumeById);
router.delete('/:id',          protect, deleteResume);
router.get   ('/:id/ats-score',protect, getATSScore);

module.exports = router;