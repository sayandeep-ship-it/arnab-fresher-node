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
  '/register',
  register
);


// Generic OTP verification
// Works for email verification
// and password reset
router.post(
  '/verify-otp',
  verifyOtp
);



// Resend OTP
// Works for email verification
// and password reset
router.post(
  '/resend-otp',
  resendOtp
);


// Login
router.post(
  '/login',
  login
);


// Forgot password
router.post(
  '/forgot-password',
  forgotPassword
);


// Reset password
router.post(
  '/reset-password',
  resetPassword
);


module.exports = router;