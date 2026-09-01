const express = require('express');
const {
  getVendorProfile,
  updateVendorProfile,
  changeVendorPassword,
  createLoyaltyProgram,
  getLoyaltyPrograms,
  generateLoyaltyPin,
  getDashboardSummary,
} = require('../controllers/vendorController.js');

const authMiddleware = require('../middlewares/authMiddleware.js');

const roleMiddleware = require('../middlewares/roleMiddleware.js');

const upload = require('../middlewares/uploadMiddleware.js');

const router = express.Router();

//create loyalty program
router.post('/create', authMiddleware, roleMiddleware('vendor'), upload.single('image'), createLoyaltyProgram);

//get vendor profile
router.get('/profile', authMiddleware, roleMiddleware('vendor'), getVendorProfile);

router.put('/update-profile', authMiddleware, roleMiddleware('vendor'), upload.single('profilePicture'), updateVendorProfile);

router.put('/change-password', authMiddleware, roleMiddleware('vendor'), changeVendorPassword);

//Dashboard route
router.get('/loyalty', authMiddleware, roleMiddleware('vendor'), getLoyaltyPrograms);

router.post('/loyalty/generate-pin/:scanId', authMiddleware, roleMiddleware('vendor'), generateLoyaltyPin);
router.get('/dashboard/summary', authMiddleware, roleMiddleware('vendor'), getDashboardSummary);

module.exports = router;
