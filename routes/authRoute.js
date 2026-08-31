const express = require('express');

const {
  register,
  verifyOtp,
  resendOtp,
  login,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
} = require('../controllers/authController.js');

const {
  vendorLogin,
  updateVendorAddress,
  vendorForgotPassword,
  vendorVerifyResetOtp,
  vendorResetPassword,
} = require('../controllers/authController.js');

const authMiddleware = require('../middlewares/authMiddleware.js');
const roleMiddleware = require('../middlewares/roleMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const { getMe } = require('../controllers/authController.js');

const router = express.Router();

router.get('/me', authMiddleware, getMe);

//user section..
router.post('/register', register);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/user-login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/profile', authMiddleware, getUserProfile);
router.put('/profile', authMiddleware, upload.single('profilePicture'), updateUserProfile);
router.put('/profile/password', authMiddleware, changeUserPassword);

//vendor section
router.post('/vendor-login', vendorLogin);
router.post('/vendor-forgot-password', vendorForgotPassword);
router.post('/vendor-verify-reset-otp', vendorVerifyResetOtp);
router.post('/vendor-reset-password', vendorResetPassword);
router.put('/vendor-address', authMiddleware, roleMiddleware('vendor'), updateVendorAddress);

module.exports = router;
