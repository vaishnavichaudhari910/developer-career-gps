const Roadmap   = require('../models/Roadmap');
const Progress  = require('../models/Progress');
const {
  generateRoadmap,
  generateWeeklyPlan,
  analyzeSkillGap
} = require('../services/geminiService');

// ────────────────────────────────────────────────────────
// @route   POST /api/roadmap/create
// @access  Private
// ────────────────────────────────────────────────────────
exports.createRoadmap = async (req, res, next) => {
  try {
    const { currentSkills, targetRole } = req.body;

    if (!currentSkills || !targetRole) {
      return res.status(400).json({
        success: false,
        message: 'Please provide currentSkills and targetRole'
      });
    }

    if (!Array.isArray(currentSkills) || currentSkills.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'currentSkills must be a non-empty array'
      });
    }

    console.log(`🗺️ Generating roadmap for: ${targetRole}`);

    // Step 1: Generate roadmap phases from AI
    const roadmapData = await generateRoadmap(currentSkills, targetRole);
    console.log(`✅ Roadmap phases generated: ${roadmapData.phases.length} phases`);

    // Step 2: Generate weekly plan from phases
    const weeklyData = await generateWeeklyPlan(roadmapData.phases, targetRole);
    console.log(`✅ Weekly plan generated: ${weeklyData.weeklyPlan.length} weeks`);

    // Deactivate previous active roadmaps for same role
    await Roadmap.updateMany(
      { userId: req.user.id, targetRole, isActive: true },
      { isActive: false }
    );

    // Save new roadmap
    const roadmap = await Roadmap.create({
      userId:        req.user.id,
      title:         `${targetRole} Roadmap`,
      targetRole,
      currentSkills,
      missingSkills: roadmapData.missingSkills,
      totalWeeks:    roadmapData.totalWeeks,
      phases:        roadmapData.phases,
      weeklyPlan:    weeklyData.weeklyPlan,
      isActive:      true
    });

    // Initialize progress if not exists
    await Progress.findOneAndUpdate(
      { userId: req.user.id },
      { $setOnInsert: { userId: req.user.id } },
      { upsert: true, new: true }
    );

    res.status(201).json({
      success: true,
      message: 'Roadmap created successfully',
      data: roadmap
    });

  } catch (err) {
    console.error('Roadmap creation error:', err.message);
    next(err);
  }
};

// ────────────────────────────────────────────────────────
// @route   POST /api/roadmap/skill-gap
// @access  Private
// ────────────────────────────────────────────────────────
exports.getSkillGap = async (req, res, next) => {
  try {
    const { currentSkills, targetRole } = req.body;

    if (!currentSkills || !targetRole) {
      return res.status(400).json({
        success: false,
        message: 'Please provide currentSkills and targetRole'
      });
    }

    console.log(`🧠 Analyzing skill gap for: ${targetRole}`);

    const gapAnalysis = await analyzeSkillGap(currentSkills, targetRole);

    res.json({
      success: true,
      message: 'Skill gap analyzed successfully',
      data: gapAnalysis
    });

  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────
// @route   GET /api/roadmap/my
// @access  Private
// ────────────────────────────────────────────────────────
exports.getMyRoadmaps = async (req, res, next) => {
  try {
    const roadmaps = await Roadmap.find({ userId: req.user.id })
      .select('-weeklyPlan')   // exclude weekly plan for list view
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: roadmaps.length,
      data: roadmaps
    });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────
// @route   GET /api/roadmap/:id
// @access  Private
// ────────────────────────────────────────────────────────
exports.getRoadmapById = async (req, res, next) => {
  try {
    const roadmap = await Roadmap.findById(req.params.id);

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap not found'
      });
    }

    if (roadmap.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    res.json({ success: true, data: roadmap });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────
// @route   GET /api/roadmap/:id/weekly-plan
// @access  Private
// ────────────────────────────────────────────────────────
exports.getWeeklyPlan = async (req, res, next) => {
  try {
    const roadmap = await Roadmap.findById(req.params.id)
      .select('weeklyPlan targetRole totalWeeks title');

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap not found'
      });
    }

    res.json({
      success: true,
      data: {
        title:      roadmap.title,
        targetRole: roadmap.targetRole,
        totalWeeks: roadmap.totalWeeks,
        weeklyPlan: roadmap.weeklyPlan
      }
    });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────
// @route   PATCH /api/roadmap/:id/phase/:phaseNumber/complete
// @access  Private
// ────────────────────────────────────────────────────────
exports.completePhase = async (req, res, next) => {
  try {
    const roadmap = await Roadmap.findById(req.params.id);

    if (!roadmap) {
      return res.status(404).json({ success: false, message: 'Roadmap not found' });
    }

    if (roadmap.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const phaseNumber = parseInt(req.params.phaseNumber);
    const phase = roadmap.phases.find(p => p.phase === phaseNumber);

    if (!phase) {
      return res.status(404).json({ success: false, message: 'Phase not found' });
    }

    phase.completed  = true;
    phase.completedAt = new Date();

    // Check if all phases done → mark roadmap complete
    const allDone = roadmap.phases.every(p => p.completed);
    if (allDone) {
      roadmap.isActive    = false;
      roadmap.completedAt = new Date();
    }

    await roadmap.save();

    // Award points to progress
    await Progress.findOneAndUpdate(
      { userId: req.user.id },
      {
        $inc:  { totalPoints: 50 },
        $push: {
          completedTopics: `Phase ${phaseNumber}: ${phase.title}`
        }
      }
    );

    // Check badge eligibility
    await checkAndAwardBadges(req.user.id);

    res.json({
      success: true,
      message: `Phase ${phaseNumber} completed! +50 points`,
      data: roadmap
    });

  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────
// @route   PATCH /api/roadmap/:id/week/:weekNumber/complete
// @access  Private
// ────────────────────────────────────────────────────────
exports.completeWeek = async (req, res, next) => {
  try {
    const roadmap = await Roadmap.findById(req.params.id);

    if (!roadmap) {
      return res.status(404).json({ success: false, message: 'Roadmap not found' });
    }

    const weekNumber = parseInt(req.params.weekNumber);
    const week = roadmap.weeklyPlan.find(w => w.week === weekNumber);

    if (!week) {
      return res.status(404).json({ success: false, message: 'Week not found' });
    }

    week.completed = true;
    await roadmap.save();

    // Award points
    await Progress.findOneAndUpdate(
      { userId: req.user.id },
      { $inc: { totalPoints: 20 } }
    );

    res.json({
      success: true,
      message: `Week ${weekNumber} completed! +20 points`,
      data: week
    });

  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────
// @route   DELETE /api/roadmap/:id
// @access  Private
// ────────────────────────────────────────────────────────
exports.deleteRoadmap = async (req, res, next) => {
  try {
    const roadmap = await Roadmap.findById(req.params.id);

    if (!roadmap) {
      return res.status(404).json({ success: false, message: 'Roadmap not found' });
    }

    if (roadmap.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await roadmap.deleteOne();

    res.json({ success: true, message: 'Roadmap deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// ── Helper: Check and Award Badges ───────────────────────
const checkAndAwardBadges = async (userId) => {
  const progress = await Progress.findOne({ userId });
  if (!progress) return;

  const newBadges = [];
  const existingBadgeNames = progress.badges.map(b => b.name);

  if (progress.totalPoints >= 50 && !existingBadgeNames.includes('First Phase')) {
    newBadges.push({ name: 'First Phase', icon: '🎯' });
  }
  if (progress.totalPoints >= 200 && !existingBadgeNames.includes('Dedicated Learner')) {
    newBadges.push({ name: 'Dedicated Learner', icon: '📚' });
  }
  if (progress.totalPoints >= 500 && !existingBadgeNames.includes('Roadmap Champion')) {
    newBadges.push({ name: 'Roadmap Champion', icon: '🏆' });
  }
  if (progress.completedTopics.length >= 3 && !existingBadgeNames.includes('Skill Builder')) {
    newBadges.push({ name: 'Skill Builder', icon: '⚡' });
  }

  if (newBadges.length > 0) {
    await Progress.findOneAndUpdate(
      { userId },
      { $push: { badges: { $each: newBadges } } }
    );
  }
};