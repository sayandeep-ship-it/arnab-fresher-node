const express = require('express');

const { getMe } = require('../controllers/authController.js');

const authMiddleware = require('../middlewares/authMiddleware.js');

const router = express.Router();

router.get('/me', authMiddleware, getMe);

module.exports = router;
