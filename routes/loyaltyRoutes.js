const express = require('express');

const {
  createLoyaltyProgram,
  getLoyaltyPrograms,
} = require('../controllers/loyaltyController.js');

const authMiddleware = require('../middlewares/authMiddleware.js');

const roleMiddleware = require('../middlewares/roleMiddleware.js');

const upload = require('../middlewares/uploadMiddleware.js');

const router = express.Router();


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
  '/',
  authMiddleware,
  roleMiddleware('vendor'),
  getLoyaltyPrograms
);

module.exports = router;