const express = require('express');

const {
  register,
  verifyOtp,
  resendOtp,
  login,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController.js');

const router = express.Router();


//...........................
//User Authentication Routes
//...........................

// Register
router.post(
  '/user/register',
  register
);


// Generic OTP verification
// Works for email verification
// and password reset
router.post(
  '/user/verify-otp',
  verifyOtp
);



// Resend OTP
// Works for email verification
// and password reset
router.post(
  '/user/resend-otp',
  resendOtp
);


// Login
router.post(
  '/user/login',
  login
);


// Forgot password
router.post(
  '/user/forgot-password',
  forgotPassword
);


// Reset password
router.post(
  '/user/reset-password',
  resetPassword
);


module.exports = router;