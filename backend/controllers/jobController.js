const Job = require('../models/Job');
const User = require('../models/User');
const {
  fetchArbeitnowJobs,
  fetchAdzunaJobs,
  mergeAndSortJobs
} = require('../services/jobService');

// ────────────────────────────────────────────────────────
// @route   GET /api/jobs/matched
// @access  Private
// ────────────────────────────────────────────────────────
exports.getMatchedJobs = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    const skills    = user.skills      || [];
    const role      = user.role        || '';
    const targetRole = req.query.role  || role;

    console.log(`💼 Fetching jobs for: ${targetRole}, skills: ${skills.join(', ')}`);

    // Fetch from both APIs in parallel
    const [arbeitnowJobs, adzunaJobs] = await Promise.all([
      fetchArbeitnowJobs(skills, targetRole),
      fetchAdzunaJobs(skills, targetRole)
    ]);

    console.log(`✅ Arbeitnow: ${arbeitnowJobs.length} jobs`);
    console.log(`✅ Adzuna: ${adzunaJobs.length} jobs`);

    const jobs = mergeAndSortJobs(arbeitnowJobs, adzunaJobs);

    res.json({
      success: true,
      count:   jobs.length,
      data:    jobs
    });

  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────
// @route   GET /api/jobs/search
// @access  Private
// ────────────────────────────────────────────────────────
exports.searchJobs = async (req, res, next) => {
  try {
    const { query, location } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a search query'
      });
    }

    const user   = await User.findById(req.user.id);
    const skills = user.skills || [];

    const [arbeitnowJobs, adzunaJobs] = await Promise.all([
      fetchArbeitnowJobs(skills, query),
      fetchAdzunaJobs(skills, query)
    ]);

    const jobs = mergeAndSortJobs(arbeitnowJobs, adzunaJobs);

    res.json({
      success: true,
      count:   jobs.length,
      query,
      data:    jobs
    });

  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────
// @route   POST /api/jobs/save
// @access  Private
// ────────────────────────────────────────────────────────
exports.saveJob = async (req, res, next) => {
  try {
    const { jobId, title, company, location,
            description, url, salary, jobType,
            tags, matchScore, source } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Job title is required'
      });
    }

    // Find or create job document for user
    let jobDoc = await Job.findOne({ userId: req.user.id });

    if (!jobDoc) {
      jobDoc = await Job.create({ userId: req.user.id, savedJobs: [], applications: [] });
    }

    // Check if already saved
    const alreadySaved = jobDoc.savedJobs.some(
      j => j.jobId === jobId || j.title === title
    );

    if (alreadySaved) {
      return res.status(400).json({
        success: false,
        message: 'Job already saved'
      });
    }

    jobDoc.savedJobs.push({
      jobId, title, company, location,
      description, url, salary, jobType,
      tags, matchScore, source
    });

    await jobDoc.save();

    res.status(201).json({
      success: true,
      message: 'Job saved successfully',
      data:    jobDoc.savedJobs
    });

  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────
// @route   GET /api/jobs/saved
// @access  Private
// ────────────────────────────────────────────────────────
exports.getSavedJobs = async (req, res, next) => {
  try {
    const jobDoc = await Job.findOne({ userId: req.user.id });

    res.json({
      success: true,
      count:   jobDoc?.savedJobs?.length || 0,
      data:    jobDoc?.savedJobs         || []
    });

  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────
// @route   DELETE /api/jobs/saved/:jobId
// @access  Private
// ────────────────────────────────────────────────────────
exports.removeSavedJob = async (req, res, next) => {
  try {
    const jobDoc = await Job.findOne({ userId: req.user.id });

    if (!jobDoc) {
      return res.status(404).json({
        success: false,
        message: 'No saved jobs found'
      });
    }

    jobDoc.savedJobs = jobDoc.savedJobs.filter(
      j => j._id.toString() !== req.params.jobId
    );

    await jobDoc.save();

    res.json({
      success: true,
      message: 'Job removed from saved list',
      data:    jobDoc.savedJobs
    });

  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────
// @route   POST /api/jobs/apply
// @access  Private
// ────────────────────────────────────────────────────────
exports.trackApplication = async (req, res, next) => {
  try {
    const { jobTitle, company, url, notes } = req.body;

    if (!jobTitle) {
      return res.status(400).json({
        success: false,
        message: 'Job title is required'
      });
    }

    let jobDoc = await Job.findOne({ userId: req.user.id });

    if (!jobDoc) {
      jobDoc = await Job.create({
        userId: req.user.id,
        savedJobs: [],
        applications: []
      });
    }

    jobDoc.applications.push({ jobTitle, company, url, notes });
    await jobDoc.save();

    res.status(201).json({
      success: true,
      message: 'Application tracked successfully',
      data:    jobDoc.applications
    });

  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────
// @route   GET /api/jobs/applications
// @access  Private
// ────────────────────────────────────────────────────────
exports.getApplications = async (req, res, next) => {
  try {
    const jobDoc = await Job.findOne({ userId: req.user.id });

    res.json({
      success: true,
      count:   jobDoc?.applications?.length || 0,
      data:    jobDoc?.applications         || []
    });

  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────
// @route   PATCH /api/jobs/applications/:appId/status
// @access  Private
// ────────────────────────────────────────────────────────
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Applied', 'Interview', 'Offer', 'Rejected', 'Saved'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    const jobDoc = await Job.findOne({ userId: req.user.id });

    if (!jobDoc) {
      return res.status(404).json({
        success: false,
        message: 'No applications found'
      });
    }

    const app = jobDoc.applications.id(req.params.appId);

    if (!app) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    app.status = status;
    await jobDoc.save();

    res.json({
      success: true,
      message: `Application status updated to "${status}"`,
      data:    app
    });

  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────
// @route   DELETE /api/jobs/applications/:appId
// @access  Private
// ────────────────────────────────────────────────────────
exports.deleteApplication = async (req, res, next) => {
  try {
    const jobDoc = await Job.findOne({ userId: req.user.id });

    if (!jobDoc) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    jobDoc.applications = jobDoc.applications.filter(
      a => a._id.toString() !== req.params.appId
    );

    await jobDoc.save();

    res.json({
      success: true,
      message: 'Application deleted',
      data:    jobDoc.applications
    });

  } catch (err) {
    next(err);
  }
};