const express = require('express');
const {
  getStores,
  getStoreDetails,
  getLoyaltyProgramDetails,
  scanLoyaltyProgram,
  verifyLoyaltyPin,
  getDashboardMetrics,
  getDashboardStores,
} = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware.js');
const router = express.Router();

router.get('/stores', authMiddleware, getStores);
router.get('/stores/:vendorId', authMiddleware, getStoreDetails);
router.get('/loyalty-programs/:loyaltyProgramId', authMiddleware, getLoyaltyProgramDetails);
router.get('/loyalty/scan/:qrCodeToken', authMiddleware, scanLoyaltyProgram);
router.post('/loyalty/verify-pin/:scanId', authMiddleware, verifyLoyaltyPin);
router.get('/dashboard/metrics', authMiddleware, getDashboardMetrics);
router.get('/dashboard/stores', authMiddleware, getDashboardStores);

module.exports = router;
