const express = require('express');

const {
  vendorLogin,
  updateVendorAddress,
  vendorForgotPassword,
  vendorVerifyResetOtp,
  vendorResetPassword,
} = require('../controllers/vendorAuthController.js');

const authMiddleware =
  require('../middlewares/authMiddleware.js');

const roleMiddleware =
  require('../middlewares/roleMiddleware');

const router = express.Router();


// Vendor Login
router.post(
  '/login',
  vendorLogin
);


// Vendor Forgot Password
router.post(
  '/forgot-password',
  vendorForgotPassword
);


// Vendor Verify Reset OTP
router.post(
  '/verify-reset-otp',
  vendorVerifyResetOtp
);


// Vendor Reset Password
router.post(
  '/reset-password',
  vendorResetPassword
);


// Vendor Address
router.put(
  '/address',
  authMiddleware,
  roleMiddleware('vendor'),
  updateVendorAddress
);


module.exports = router;