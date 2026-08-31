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

const authMiddleware = require('../middlewares/authMiddleware.js');

const { getStores, getStoreDetails, getLoyaltyProgramDetails } = require('../controllers/storeController');

const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.post('/register', register);

router.post('/verify-otp', verifyOtp);

router.post('/resend-otp', resendOtp);

// Login
router.post('/login', login);

// Forgot password
router.post('/forgot-password', forgotPassword);

// Reset password
router.post('/reset-password', resetPassword);

router.get('/profile', authMiddleware, getUserProfile);

// Update profile
router.put('/profile', authMiddleware, upload.single('profilePicture'), updateUserProfile);

// Change password
router.put('/profile/password', authMiddleware, changeUserPassword);

router.get('/stores', authMiddleware, getStores);

router.get('/stores/:vendorId', authMiddleware, getStoreDetails);

//loyalty program details
router.get('/loyalty-programs/:loyaltyProgramId', authMiddleware, getLoyaltyProgramDetails);

module.exports = router;
