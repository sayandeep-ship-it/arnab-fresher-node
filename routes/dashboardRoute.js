const express = require('express');

const { getLoyaltyPrograms } = require('../controllers/loyaltyController.js');

const authMiddleware = require('../middlewares/authMiddleware.js');

const roleMiddleware = require('../middlewares/roleMiddleware.js');

const router = express.Router();

router.get('/', authMiddleware, roleMiddleware('vendor'), getLoyaltyPrograms);

module.exports = router;
