const pdfParse = require('pdf-parse-fork');
const Resume     = require('../models/Resume');
const User       = require('../models/User');
const { analyzeResumeWithAI } = require('../services/geminiService');

// ────────────────────────────────────────────────────────────
// @route   POST /api/resume/upload
// @access  Private
// ────────────────────────────────────────────────────────────
exports.uploadResume = async (req, res, next) => {
  try {
    // Check file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF file'
      });
    }

    console.log('📄 Parsing PDF...');

    // Extract text from PDF buffer
    const pdfData = await pdfParse(req.file.buffer);
    const resumeText = pdfData.text;

    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message: 'PDF appears to be empty or unreadable. Please upload a text-based PDF.'
      });
    }

    console.log(`✅ PDF parsed. Characters extracted: ${resumeText.length}`);
    console.log('🤖 Sending to Gemini AI for analysis...');

    // Send to Gemini for analysis
    const analysis = await analyzeResumeWithAI(resumeText);

    console.log('✅ AI Analysis complete. ATS Score:', analysis.atsScore);

    // Save to database
    const resume = await Resume.create({
      userId:          req.user.id,
      originalName:    req.file.originalname,
      resumeText:      resumeText.substring(0, 5000),
      atsScore:        analysis.atsScore,
      experienceLevel: analysis.experienceLevel,
      summary:         analysis.summary,
      detectedSkills:  analysis.detectedSkills,
      strengths:       analysis.strengths,
      weaknesses:      analysis.weaknesses,
      missingKeywords: analysis.missingKeywords,
      suggestions:     analysis.suggestions,
    });

    // Also update user's skills from resume
    await User.findByIdAndUpdate(req.user.id, {
      skills: analysis.detectedSkills,
      role:   analysis.experienceLevel?.toLowerCase().includes('senior') ? 'senior'
            : analysis.experienceLevel?.toLowerCase().includes('mid')    ? 'mid'
            : analysis.experienceLevel?.toLowerCase().includes('junior') ? 'junior'
            : 'fresher'
    });

    res.status(201).json({
      success: true,
      message: 'Resume analyzed successfully',
      data: resume
    });

  } catch (err) {
    console.error('Resume upload error:', err.message);

    // Handle Gemini JSON parse error
    if (err instanceof SyntaxError) {
      return res.status(500).json({
        success: false,
        message: 'AI returned invalid response. Please try again.'
      });
    }

    next(err);
  }
};

// ────────────────────────────────────────────────────────────
// @route   GET /api/resume/my
// @access  Private
// ────────────────────────────────────────────────────────────
exports.getMyResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ userId: req.user.id })
      .select('-resumeText')     // don't send full text, it's large
      .sort({ createdAt: -1 }); // newest first

    res.json({
      success: true,
      count: resumes.length,
      data: resumes
    });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────
// @route   GET /api/resume/:id
// @access  Private
// ────────────────────────────────────────────────────────────
exports.getResumeById = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    // Make sure user owns this resume
    if (resume.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: resume });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────
// @route   DELETE /api/resume/:id
// @access  Private
// ────────────────────────────────────────────────────────────
exports.deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    if (resume.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await resume.deleteOne();

    res.json({ success: true, message: 'Resume deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────
// @route   GET /api/resume/:id/ats-score
// @access  Private
// ────────────────────────────────────────────────────────────
exports.getATSScore = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id)
      .select('atsScore missingKeywords suggestions experienceLevel');

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    res.json({
      success: true,
      data: {
        atsScore:        resume.atsScore,
        grade:           resume.atsScore >= 80 ? 'Excellent'
                       : resume.atsScore >= 60 ? 'Good'
                       : resume.atsScore >= 40 ? 'Average'
                       : 'Needs Work',
        missingKeywords: resume.missingKeywords,
        suggestions:     resume.suggestions,
        experienceLevel: resume.experienceLevel
      }
    });
  } catch (err) {
    next(err);
  }
};