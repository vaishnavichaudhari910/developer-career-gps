const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false  // never return password in queries
  },
  role: {
    type: String,
    enum: ['fresher', 'junior', 'mid', 'senior'],
    default: 'fresher'
  },
  experience: {
    type: String,
    default: '0'
  },
  skills: {
    type: [String],
    default: []
  },
  githubUsername: {
    type: String,
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifyToken:       String,
  verifyTokenExpire: Date,
  resetToken:        String,
  resetTokenExpire:  Date,
}, { timestamps: true });

// ── Hash password before saving ──────────────────────────
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const bcrypt = require("bcryptjs");
  this.password = await bcrypt.hash(this.password, 10);
});

// ── Compare entered password with hashed ─────────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ── Generate email verify token ───────────────────────────
userSchema.methods.getVerifyToken = function () {
  const token = crypto.randomBytes(20).toString('hex');
  this.verifyToken = crypto.createHash('sha256').update(token).digest('hex');
  this.verifyTokenExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return token; // send raw token in email
};

// ── Generate password reset token ────────────────────────
userSchema.methods.getResetToken = function () {
  const token = crypto.randomBytes(20).toString('hex');
  this.resetToken = crypto.createHash('sha256').update(token).digest('hex');
  this.resetTokenExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
  return token;
};

module.exports = mongoose.model('User', userSchema);