const router  = require('express').Router();
const protect = require('../middleware/auth');
const {
  register,
  verifyEmail,
  login,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
  changePassword,
} = require('../controllers/authController');

router.post('/register',               register);
router.get ('/verify-email/:token',    verifyEmail);
router.post('/login',                  login);
router.get ('/me',         protect,    getMe);
router.put ('/update-profile', protect, updateProfile);
router.post('/forgot-password',        forgotPassword);
router.put ('/reset-password/:token',  resetPassword);
router.put ('/change-password', protect, changePassword);

module.exports = router;