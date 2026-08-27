const express = require('express');

const {
  vendorLogin,
  updateVendorAddress
} = require('../controllers/vendorAuthController.js');

const router = express.Router();

router.post(
  '/login',
  vendorLogin
);

router.put(
  '/address',
  updateVendorAddress
);

module.exports = router;