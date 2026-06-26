const GitHub      = require('../models/GitHub');
const User        = require('../models/User');
const { analyzeGitHub } = require('../services/githubService');

// ────────────────────────────────────────────────────────
// @route   POST /api/github/analyze
// @access  Private
// ────────────────────────────────────────────────────────
exports.analyzeGitHubProfile = async (req, res, next) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a GitHub username'
      });
    }

    console.log(`🔍 Analyzing GitHub profile: ${username}`);

    const analysisData = await analyzeGitHub(username);

    console.log(`✅ GitHub Score: ${analysisData.githubScore}/100`);

    // Save or update in DB (upsert)
    const github = await GitHub.findOneAndUpdate(
      { userId: req.user.id },
      { ...analysisData, userId: req.user.id },
      { new: true, upsert: true, runValidators: true }
    );

    // Update user's GitHub username
    await User.findByIdAndUpdate(req.user.id, {
      githubUsername: username,
      avatar: analysisData.avatar
    });

    res.status(200).json({
      success: true,
      message: 'GitHub profile analyzed successfully',
      data: github
    });

  } catch (err) {
    console.error('GitHub analyze error:', err.message);

    // Handle GitHub API errors
    if (err.response?.status === 404) {
      return res.status(404).json({
        success: false,
        message: 'GitHub username not found. Please check the username.'
      });
    }

    if (err.response?.status === 403) {
      return res.status(403).json({
        success: false,
        message: 'GitHub API rate limit exceeded. Please try again in an hour.'
      });
    }

    next(err);
  }
};

// ────────────────────────────────────────────────────────
// @route   GET /api/github/my
// @access  Private
// ────────────────────────────────────────────────────────
exports.getMyGitHubAnalysis = async (req, res, next) => {
  try {
    const github = await GitHub.findOne({ userId: req.user.id });

    if (!github) {
      return res.status(404).json({
        success: false,
        message: 'No GitHub analysis found. Please analyze your profile first.'
      });
    }

    res.json({ success: true, data: github });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────
// @route   GET /api/github/score
// @access  Private
// ────────────────────────────────────────────────────────
exports.getGitHubScore = async (req, res, next) => {
  try {
    const github = await GitHub.findOne({ userId: req.user.id })
      .select('username githubScore missingSkills strengths improvements profileSummary');

    if (!github) {
      return res.status(404).json({
        success: false,
        message: 'No GitHub analysis found.'
      });
    }

    res.json({
      success: true,
      data: {
        username:       github.username,
        githubScore:    github.githubScore,
        grade:          github.githubScore >= 80 ? 'Excellent'
                      : github.githubScore >= 60 ? 'Good'
                      : github.githubScore >= 40 ? 'Average'
                      : 'Needs Work',
        missingSkills:  github.missingSkills,
        strengths:      github.strengths,
        improvements:   github.improvements,
        profileSummary: github.profileSummary
      }
    });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────
// @route   GET /api/github/repos
// @access  Private
// ────────────────────────────────────────────────────────
exports.getMyRepos = async (req, res, next) => {
  try {
    const github = await GitHub.findOne({ userId: req.user.id })
      .select('username topRepos languages totalStars totalForks');

    if (!github) {
      return res.status(404).json({
        success: false,
        message: 'No GitHub analysis found.'
      });
    }

    res.json({
      success: true,
      data: {
        username:   github.username,
        totalStars: github.totalStars,
        totalForks: github.totalForks,
        languages:  github.languages,
        topRepos:   github.topRepos
      }
    });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────
// @route   DELETE /api/github/my
// @access  Private
// ────────────────────────────────────────────────────────
exports.deleteGitHubAnalysis = async (req, res, next) => {
  try {
    await GitHub.findOneAndDelete({ userId: req.user.id });
    res.json({ success: true, message: 'GitHub analysis deleted successfully' });
  } catch (err) {
    next(err);
  }
};