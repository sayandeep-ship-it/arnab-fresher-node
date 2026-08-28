const express = require('express');

const {
  getMe,
} = require('../controllers/authController.js');

const authMiddleware =
  require('../middlewares/authMiddleware.js');

const router =
  express.Router();


// =====================================================
// GET CURRENT LOGGED-IN USER
// =====================================================

router.get(
  '/me',
  authMiddleware,
  getMe
);

module.exports = router;