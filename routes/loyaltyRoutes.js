const express = require('express');

const { createLoyaltyProgram } = require('../controllers/loyaltyController.js');

const authMiddleware = require('../middlewares/authMiddleware.js');

const roleMiddleware = require('../middlewares/roleMiddleware.js');

const upload = require('../middlewares/uploadMiddleware.js');

const router = express.Router();

router.post('/create', authMiddleware, roleMiddleware('vendor'), upload.single('image'), createLoyaltyProgram);

module.exports = router;
