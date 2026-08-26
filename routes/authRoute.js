const express =
  require('express');

const {
  register,
  verifyEmail,
  login,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
} = require(
  '../controllers/authController.js'
);

const router = express.Router();

router.post('/register',register);

router.post('/verify-email',verifyEmail);

router.post('/login',login); // Login route

router.post('/forgot-password',forgotPassword);

router.post('/verify-reset-otp',verifyResetOtp);

router.post('/reset-password',resetPassword);

module.exports = router;