const Progress = require('../models/Progress');
const Roadmap  = require('../models/Roadmap');
const Resume   = require('../models/Resume');
const GitHub   = require('../models/GitHub');

// ────────────────────────────────────────────────────────
// @route   GET /api/progress/stats
// @access  Private
// ────────────────────────────────────────────────────────
exports.getDashboardStats = async (req, res, next) => {
  try {
    // Fetch all data in parallel
    const [progress, roadmaps, resumes, github] = await Promise.all([
      Progress.findOne({ userId: req.user.id }),
      Roadmap.find({ userId: req.user.id }),
      Resume.find({ userId: req.user.id }).select('atsScore createdAt'),
      GitHub.findOne({ userId: req.user.id }).select('githubScore username')
    ]);

    // Calculate roadmap progress
    const activeRoadmap   = roadmaps.find(r => r.isActive);
    const completedPhases = activeRoadmap
      ? activeRoadmap.phases.filter(p => p.completed).length
      : 0;
    const totalPhases = activeRoadmap ? activeRoadmap.phases.length : 0;
    const roadmapProgress = totalPhases > 0
      ? Math.round((completedPhases / totalPhases) * 100)
      : 0;

    // Latest ATS score
    const latestResume = resumes.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    )[0];

    res.json({
      success: true,
      data: {
        totalPoints:       progress?.totalPoints      || 0,
        totalBadges:       progress?.badges?.length   || 0,
        badges:            progress?.badges           || [],
        currentStreak:     progress?.currentStreak    || 0,
        longestStreak:     progress?.longestStreak    || 0,
        totalHoursLearned: progress?.totalHoursLearned || 0,
        completedTopics:   progress?.completedTopics?.length || 0,
        roadmapsGenerated: roadmaps.length,
        activeRoadmap:     activeRoadmap ? {
          id:           activeRoadmap._id,
          title:        activeRoadmap.title,
          targetRole:   activeRoadmap.targetRole,
          progress:     roadmapProgress,
          completedPhases,
          totalPhases,
          totalWeeks:   activeRoadmap.totalWeeks
        } : null,
        latestAtsScore:  latestResume?.atsScore  || null,
        resumesUploaded: resumes.length,
        githubScore:     github?.githubScore     || null,
        githubUsername:  github?.username        || null,
      }
    });

  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────
// @route   POST /api/progress/log-hours
// @access  Private
// ────────────────────────────────────────────────────────
exports.logLearningHours = async (req, res, next) => {
  try {
    const { hours } = req.body;

    if (!hours || hours <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid hours (greater than 0)'
      });
    }

    const today     = new Date();
    today.setHours(0, 0, 0, 0);

    const progress  = await Progress.findOne({ userId: req.user.id });
    const lastActive = progress?.lastActiveDate
      ? new Date(progress.lastActiveDate)
      : null;

    let streakUpdate = {};

    if (lastActive) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastActive >= yesterday && lastActive < today) {
        // Consecutive day → increment streak
        const newStreak = (progress.currentStreak || 0) + 1;
        streakUpdate = {
          currentStreak: newStreak,
          longestStreak: Math.max(newStreak, progress.longestStreak || 0)
        };
      } else if (lastActive < yesterday) {
        // Streak broken
        streakUpdate = { currentStreak: 1 };
      }
    } else {
      streakUpdate = { currentStreak: 1 };
    }

    const updated = await Progress.findOneAndUpdate(
      { userId: req.user.id },
      {
        $inc: {
          totalHoursLearned:  hours,
          weeklyHoursLogged:  hours,
          totalPoints:        Math.floor(hours * 10)
        },
        lastActiveDate: new Date(),
        ...streakUpdate
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: `${hours} hours logged! +${Math.floor(hours * 10)} points`,
      data: {
        totalHoursLearned: updated.totalHoursLearned,
        currentStreak:     updated.currentStreak,
        totalPoints:       updated.totalPoints
      }
    });

  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────
// @route   GET /api/progress/badges
// @access  Private
// ────────────────────────────────────────────────────────
exports.getMyBadges = async (req, res, next) => {
  try {
    const progress = await Progress.findOne({ userId: req.user.id })
      .select('badges totalPoints currentStreak');

    res.json({
      success: true,
      data: {
        badges:        progress?.badges       || [],
        totalPoints:   progress?.totalPoints  || 0,
        currentStreak: progress?.currentStreak || 0
      }
    });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────
// @route   POST /api/progress/add-project
// @access  Private
// ────────────────────────────────────────────────────────
exports.addCompletedProject = async (req, res, next) => {
  try {
    const { projectName } = req.body;

    if (!projectName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide projectName'
      });
    }

    const updated = await Progress.findOneAndUpdate(
      { userId: req.user.id },
      {
        $push: { completedProjects: projectName },
        $inc:  { totalPoints: 100 }
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: `Project "${projectName}" added! +100 points`,
      data: {
        completedProjects: updated.completedProjects,
        totalPoints:       updated.totalPoints
      }
    });

  } catch (err) {
    next(err);
  }
};