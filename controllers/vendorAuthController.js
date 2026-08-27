const bcrypt = require('bcryptjs');

const {
  User,
  Role,
  VendorProfile,
} = require('../models');

const generateToken = require('../utils/generateToken');

// =====================================================
// VENDOR LOGIN
// =====================================================

async function vendorLogin(req, res) {
  try {
    const {
      email,
      password,
    } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
      });
    }

    // Find user with vendor role
    const user = await User.findOne({
      where: {
        email,
      },
      include: [
        {
          model: Role,
          as: 'roles',
          where: {
            name: 'vendor',
          },
          through: {
            attributes: [],
          },
        },
      ],
    });

    // User doesn't exist or isn't a vendor
    if (!user) {
      return res.status(401).json({
        message: 'Invalid vendor credentials',
      });
    }

    // Check account status
    if (!user.isActive) {
      return res.status(403).json({
        message: 'Please verify your email before logging in.',
      });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: 'Invalid vendor credentials',
      });
    }

    // Find vendor profile
    const vendorProfile = await VendorProfile.findOne({
      where: {
        userId: user.id,
      },
    });

    if (!vendorProfile) {
      return res.status(500).json({
        message: 'Vendor profile not found',
      });
    }

    // Generate JWT
    const token = generateToken(user);

    return res.status(200).json({
      message: 'Vendor login successful',

      token,

      vendor: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,

        isAddress: vendorProfile.isAddress,
      },
    });

  } catch (error) {
    console.error(
      'Vendor login error:',
      error
    );

    return res.status(500).json({
      message: 'Something went wrong',
    });
  }
}

// =====================================================
// UPDATE VENDOR ADDRESS
// =====================================================

async function updateVendorAddress(req, res) {
  try {
    const {
      userId,
      streetAddress,
      city,
      country,
      state,
      pincode,
    } = req.body;

    // Validate userId
    if (!userId) {
      return res.status(400).json({
        message: 'userId is required',
      });
    }

    // Validate address fields
    if (
      !streetAddress ||
      !city ||
      !country ||
      !state ||
      !pincode
    ) {
      return res.status(400).json({
        message:
          'Street address, city, country, state and pincode are required',
      });
    }

    // Find vendor profile
    const vendorProfile =
      await VendorProfile.findOne({
        where: {
          userId,
        },
      });

    if (!vendorProfile) {
      return res.status(404).json({
        message: 'Vendor profile not found',
      });
    }

    // Update address
    vendorProfile.streetAddress =
      streetAddress;

    vendorProfile.city =
      city;

    vendorProfile.country =
      country;

    vendorProfile.state =
      state;

    vendorProfile.pincode =
      pincode;

    // Address completed
    vendorProfile.isAddress = true;

    await vendorProfile.save();

    return res.status(200).json({
      message:
        'Vendor address saved successfully',

      vendor: {
        userId: vendorProfile.userId,
        streetAddress:
          vendorProfile.streetAddress,
        city:
          vendorProfile.city,
        country:
          vendorProfile.country,
        state:
          vendorProfile.state,
        pincode:
          vendorProfile.pincode,
        isAddress:
          vendorProfile.isAddress,
      },
    });

  } catch (error) {
    console.error(
      'Update vendor address error:',
      error
    );

    return res.status(500).json({
      message:
        'Something went wrong',
    });
  }
}

module.exports = {
  vendorLogin,
  updateVendorAddress,
};