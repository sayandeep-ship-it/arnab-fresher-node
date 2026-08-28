const express = require('express');

const {
  getVendorProfile,
  updateVendorProfile,
  changeVendorPassword,
} = require('../controllers/vendorProfileController.js');

const authMiddleware =
  require('../middlewares/authMiddleware.js');

const roleMiddleware =
  require('../middlewares/roleMiddleware.js');

const upload =
  require('../middlewares/uploadMiddleware.js');

const router = express.Router();




router.get(
  '/',
  authMiddleware,
  roleMiddleware('vendor'),
  getVendorProfile
);



router.put(
  '/',
  authMiddleware,
  roleMiddleware('vendor'),
  upload.single('profilePicture'),
  updateVendorProfile
);




router.put(
  '/password',
  authMiddleware,
  roleMiddleware('vendor'),
  changeVendorPassword
);


module.exports = router;