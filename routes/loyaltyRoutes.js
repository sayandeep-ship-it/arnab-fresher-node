const express = require('express');

const {
  createLoyaltyProgram,
  getRecentLoyaltyPrograms,
  getAllLoyaltyPrograms,
} = require('../controllers/loyaltyController.js');

const authMiddleware =
  require('../middlewares/authMiddleware.js');

const roleMiddleware =
  require('../middlewares/roleMiddleware.js');

const upload =
  require('../middlewares/uploadMiddleware.js');

const router =
  express.Router();


// =====================================================
// CREATE LOYALTY PROGRAM
// =====================================================

router.post(
  '/create',
  authMiddleware,
  roleMiddleware('vendor'),
  upload.single('image'),
  createLoyaltyProgram
);

// =====================================================
// RECENT 5 LOYALTY PROGRAMS
// =====================================================

router.get(
  '/recent',
  authMiddleware,
  roleMiddleware('vendor'),
  getRecentLoyaltyPrograms
);


// =====================================================
// ALL LOYALTY PROGRAMS
// =====================================================

router.get(
  '/all',
  authMiddleware,
  roleMiddleware('vendor'),
  getAllLoyaltyPrograms
);

module.exports = router;