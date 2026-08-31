const express = require('express');
const { getStores, getStoreDetails, getLoyaltyProgramDetails,scanLoyaltyProgram } = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware.js');
const router = express.Router();

router.get('/stores', authMiddleware, getStores);

router.get('/stores/:vendorId', authMiddleware, getStoreDetails);

//loyalty program details
router.get('/loyalty-programs/:loyaltyProgramId', authMiddleware, getLoyaltyProgramDetails);
router.get('/loyalty/scan/:qrCodeToken', authMiddleware, scanLoyaltyProgram);

module.exports = router;
