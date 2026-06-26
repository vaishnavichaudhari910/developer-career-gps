const crypto    = require('crypto');
const User      = require('../models/User');
const jwt       = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

// ── Helper: sign JWT ──────────────────────────────────────
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

// ── Helper: send token response ───────────────────────────
const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id:       user._id,
      name:     user.name,
      email:    user.email,
      role:     user.role,
      skills:   user.skills,
      avatar:   user.avatar,
      isVerified: user.isVerified,
    },
  });
};

// ────────────────────────────────────────────────────────────
// @route   POST /api/auth/register
// @access  Public
// ────────────────────────────────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check duplicate
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Create user
    const user = await User.create({ name, email, password });

    // Generate verify token
    const verifyToken = user.getVerifyToken();
    await user.save({ validateBeforeSave: false });

    // Send verification email
    const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verifyToken}`;
    await sendEmail({
      to: email,
      subject: 'Verify your Developer Career GPS account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2 style="color: #6366f1;">Welcome to Developer Career GPS 🚀</h2>
          <p>Hi ${name}, thanks for registering!</p>
          <p>Click the button below to verify your email address:</p>
          <a href="${verifyUrl}"
             style="background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin:16px 0;">
            Verify Email
          </a>
          <p>This link expires in 24 hours.</p>
          <p>If you didn't register, ignore this email.</p>
        </div>
      `,
    });

    res.status(201).json({
      success: true,
      message: 'Registered successfully! Please check your email to verify your account.',
    });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────
// @route   GET /api/auth/verify-email/:token
// @access  Public
// ────────────────────────────────────────────────────────────
exports.verifyEmail = async (req, res, next) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      verifyToken:       hashedToken,
      verifyTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification link' });
    }

    user.isVerified       = true;
    user.verifyToken      = undefined;
    user.verifyTokenExpire = undefined;
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, message: 'Email verified successfully! You can now login.' });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────
// @route   POST /api/auth/login
// @access  Public
// ────────────────────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check if verified
    if (!user.isVerified) {
      return res.status(401).json({ success: false, message: 'Please verify your email before logging in' });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────
// @route   GET /api/auth/me
// @access  Private
// ────────────────────────────────────────────────────────────
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────
// @route   PUT /api/auth/update-profile
// @access  Private
// ────────────────────────────────────────────────────────────
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, role, experience, skills, githubUsername } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, role, experience, skills, githubUsername },
      { new: true, runValidators: true }
    );

    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────
// @route   POST /api/auth/forgot-password
// @access  Public
// ────────────────────────────────────────────────────────────
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with that email' });
    }

    const resetToken = user.getResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Developer Career GPS – Password Reset',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2 style="color: #6366f1;">Password Reset Request</h2>
          <p>You requested a password reset. Click below to set a new password:</p>
          <a href="${resetUrl}"
             style="background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin:16px 0;">
            Reset Password
          </a>
          <p>This link expires in <strong>15 minutes</strong>.</p>
          <p>If you didn't request this, ignore this email.</p>
        </div>
      `,
    });

    res.json({ success: true, message: 'Password reset email sent' });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────
// @route   PUT /api/auth/reset-password/:token
// @access  Public
// ────────────────────────────────────────────────────────────
exports.resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetToken:       hashedToken,
      resetTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    user.password         = req.body.password;
    user.resetToken       = undefined;
    user.resetTokenExpire = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successful! You can now login.' });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────
// @route   PUT /api/auth/change-password
// @access  Private
// ────────────────────────────────────────────────────────────
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
};