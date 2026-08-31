const express = require('express');
const {
  getVendorProfile,
  updateVendorProfile,
  changeVendorPassword,
  createLoyaltyProgram,
  getLoyaltyPrograms,
} = require('../controllers/vendorController.js');

const authMiddleware = require('../middlewares/authMiddleware.js');

const roleMiddleware = require('../middlewares/roleMiddleware.js');

const upload = require('../middlewares/uploadMiddleware.js');

const router = express.Router();

//create loyalty program
router.post('/create', authMiddleware, roleMiddleware('vendor'), upload.single('image'), createLoyaltyProgram);

//get vendor profile
router.get('/', authMiddleware, roleMiddleware('vendor'), getVendorProfile);

router.put('/', authMiddleware, roleMiddleware('vendor'), upload.single('profilePicture'), updateVendorProfile);

router.put('/change-password', authMiddleware, roleMiddleware('vendor'), changeVendorPassword);

//Dashboard route
router.get('/dashboard', authMiddleware, roleMiddleware('vendor'), getLoyaltyPrograms);

module.exports = router;
