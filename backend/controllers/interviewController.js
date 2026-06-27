const Interview = require('../models/Interview');
const User      = require('../models/User');
const {
  generateInterviewQuestions,
  evaluateAnswer
} = require('../services/geminiService');

// ────────────────────────────────────────────────────────
// @route   POST /api/interview/generate
// @access  Private
// ────────────────────────────────────────────────────────
exports.generateQuestions = async (req, res, next) => {
  try {
    const { targetRole, skills } = req.body;

    if (!targetRole) {
      return res.status(400).json({
        success: false,
        message: 'Please provide targetRole'
      });
    }

    const user         = await User.findById(req.user.id);
    const finalSkills  = skills || user.skills || [];

    console.log(`🎤 Generating interview questions for: ${targetRole}`);

    const questions = await generateInterviewQuestions(targetRole, finalSkills);

    const interview = await Interview.create({
      userId:             req.user.id,
      targetRole,
      skills:             finalSkills,
      hrQuestions:        questions.hrQuestions,
      technicalQuestions: questions.technicalQuestions,
      projectQuestions:   questions.projectQuestions
    });

    res.status(201).json({
      success: true,
      message: 'Interview questions generated successfully',
      data:    interview
    });

  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────
// @route   GET /api/interview/my
// @access  Private
// ────────────────────────────────────────────────────────
exports.getMyInterviews = async (req, res, next) => {
  try {
    const interviews = await Interview.find({ userId: req.user.id })
      .select('targetRole skills score completed createdAt')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: interviews.length, data: interviews });

  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────
// @route   GET /api/interview/:id
// @access  Private
// ────────────────────────────────────────────────────────
exports.getInterviewById = async (req, res, next) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    if (interview.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: interview });

  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────
// @route   POST /api/interview/:id/evaluate
// @access  Private
// ────────────────────────────────────────────────────────
exports.evaluateInterviewAnswer = async (req, res, next) => {
  try {
    const { questionId, questionType, answer } = req.body;

    if (!questionId || !answer || !questionType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide questionId, questionType and answer'
      });
    }

    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    // Find the question based on type
    let questionObj;
    if (questionType === 'hr') {
      questionObj = interview.hrQuestions.id(questionId);
    } else if (questionType === 'technical') {
      questionObj = interview.technicalQuestions.id(questionId);
    } else if (questionType === 'project') {
      questionObj = interview.projectQuestions.id(questionId);
    }

    if (!questionObj) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    console.log('🤖 Evaluating answer...');

    // Get AI evaluation
    const evaluation = await evaluateAnswer(
      questionObj.question,
      answer,
      interview.targetRole
    );

    // Save answer to question
    questionObj.answer   = answer;
    questionObj.answered = true;

    // Update interview score (average)
    const allAnswered = [
      ...interview.hrQuestions.filter(q => q.answered),
      ...interview.technicalQuestions.filter(q => q.answered),
      ...interview.projectQuestions.filter(q => q.answered)
    ];

    interview.score = Math.round(
      (evaluation.score / 10) * 100
    );

    await interview.save();

    res.json({
      success: true,
      message: 'Answer evaluated successfully',
      data: {
        score:       evaluation.score,
        grade:       evaluation.grade,
        feedback:    evaluation.feedback,
        idealAnswer: evaluation.idealAnswer,
        answeredCount: allAnswered.length
      }
    });

  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────
// @route   DELETE /api/interview/:id
// @access  Private
// ────────────────────────────────────────────────────────
exports.deleteInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    if (interview.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await interview.deleteOne();

    res.json({ success: true, message: 'Interview deleted successfully' });

  } catch (err) {
    next(err);
  }
};