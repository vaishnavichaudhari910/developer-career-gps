const Project = require('../models/Project');
const User    = require('../models/User');
const { generateProjectRecommendations } = require('../services/geminiService');

// ────────────────────────────────────────────────────────
// @route   POST /api/projects/recommend
// @access  Private
// ────────────────────────────────────────────────────────
exports.getRecommendations = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    const skills     = req.body.skills     || user.skills     || [];
    const targetRole = req.body.targetRole || user.role       || 'developer';
    const experience = req.body.experience || user.experience || 'fresher';

    if (skills.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please update your skills profile first or provide skills in request body'
      });
    }

    console.log('💡 Generating project recommendations...');

    const result = await generateProjectRecommendations(skills, targetRole, experience);

    // Save recommendations
    const projectDoc = await Project.findOneAndUpdate(
      { userId: req.user.id },
      {
        userId:          req.user.id,
        recommendations: result.recommendations,
        generatedAt:     new Date()
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: 'Project recommendations generated successfully',
      data:    projectDoc.recommendations
    });

  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────
// @route   GET /api/projects/my
// @access  Private
// ────────────────────────────────────────────────────────
exports.getMyRecommendations = async (req, res, next) => {
  try {
    const projectDoc = await Project.findOne({ userId: req.user.id });

    if (!projectDoc) {
      return res.status(404).json({
        success: false,
        message: 'No recommendations found. Generate recommendations first.'
      });
    }

    res.json({
      success: true,
      count:   projectDoc.recommendations.length,
      data:    projectDoc.recommendations,
      generatedAt: projectDoc.generatedAt
    });

  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────
// @route   PATCH /api/projects/:projectId/start
// @access  Private
// ────────────────────────────────────────────────────────
exports.markStarted = async (req, res, next) => {
  try {
    const projectDoc = await Project.findOne({ userId: req.user.id });

    if (!projectDoc) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    const project = projectDoc.recommendations.id(req.params.projectId);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    project.started = true;
    await projectDoc.save();

    res.json({
      success: true,
      message: `"${project.title}" marked as started!`,
      data:    project
    });

  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────
// @route   PATCH /api/projects/:projectId/complete
// @access  Private
// ────────────────────────────────────────────────────────
exports.markCompleted = async (req, res, next) => {
  try {
    const projectDoc = await Project.findOne({ userId: req.user.id });

    if (!projectDoc) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    const project = projectDoc.recommendations.id(req.params.projectId);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    project.started   = true;
    project.completed = true;
    await projectDoc.save();

    res.json({
      success: true,
      message: `"${project.title}" marked as completed! Add it to GitHub.`,
      data:    project
    });

  } catch (err) {
    next(err);
  }
};