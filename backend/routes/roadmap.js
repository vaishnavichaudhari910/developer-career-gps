const router  = require('express').Router();
const protect = require('../middleware/auth');
const {
  createRoadmap,
  getSkillGap,
  getMyRoadmaps,
  getRoadmapById,
  getWeeklyPlan,
  completePhase,
  completeWeek,
  deleteRoadmap
} = require('../controllers/roadmapController');

router.post  ('/create',                          protect, createRoadmap);
router.post  ('/skill-gap',                       protect, getSkillGap);
router.get   ('/my',                              protect, getMyRoadmaps);
router.get   ('/:id',                             protect, getRoadmapById);
router.get   ('/:id/weekly-plan',                 protect, getWeeklyPlan);
router.patch ('/:id/phase/:phaseNumber/complete', protect, completePhase);
router.patch ('/:id/week/:weekNumber/complete',   protect, completeWeek);
router.delete('/:id',                             protect, deleteRoadmap);

module.exports = router;