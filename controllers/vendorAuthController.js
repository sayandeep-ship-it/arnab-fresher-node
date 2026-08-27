const bcrypt = require('bcryptjs');

const crypto = require('crypto');

const {
  createAndSendOtp,
  verifyOtp: verifyOtpService,
} = require('../services/otpService');

const {
  User,
  Role,
  UserRole,
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
      streetAddress,
      city,
      country,
      state,
      pincode,
    } = req.body;

    // Get user ID from JWT
    const userId = req.user.id;

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
        message:
          'Vendor profile not found',
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
        userId:
          vendorProfile.userId,

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

// =====================================================
// VENDOR FORGOT PASSWORD
// =====================================================

async function vendorForgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: 'Email is required',
      });
    }

    // Find user
    const user = await User.findOne({
      where: { email },
    });

    /*
     * Don't reveal whether the email exists.
     */
    if (!user) {
      return res.json({
        message:
          'If the email exists, an OTP has been sent.',
      });
    }

    // Verify that this user is a vendor
    const vendorRole = await UserRole.findOne({
      where: {
        userId: user.id,
      },
      include: [
        {
          model: Role,
          where: {
            name: 'vendor',
          },
        },
      ],
    });

    if (!vendorRole) {
      return res.json({
        message:
          'If the email exists, an OTP has been sent.',
      });
    }

    // Send password reset OTP
    await createAndSendOtp(
      user,
      'PASSWORD_RESET'
    );

    return res.json({
      message:
        'If the email exists, an OTP has been sent.',
    });

  } catch (error) {
    console.error(
      'Vendor forgot password error:',
      error
    );

    return res.status(500).json({
      message: 'Something went wrong',
    });
  }
}

// =====================================================
// VENDOR VERIFY RESET OTP
// =====================================================

async function vendorVerifyResetOtp(req, res) {
  try {
    const {
      email,
      otp,
    } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message:
          'Email and OTP are required',
      });
    }

    // Find user
    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({
        message:
          'Invalid or expired OTP',
      });
    }

    // Verify vendor role
    const vendorRole = await UserRole.findOne({
      where: {
        userId: user.id,
      },
      include: [
        {
          model: Role,
          where: {
            name: 'vendor',
          },
        },
      ],
    });

    if (!vendorRole) {
      return res.status(400).json({
        message:
          'Invalid or expired OTP',
      });
    }

    // Verify OTP
    const otpRecord =
      await verifyOtpService(
        user.id,
        otp
      );

    if (!otpRecord) {
      return res.status(400).json({
        message:
          'Invalid or expired OTP',
      });
    }

    if (
      otpRecord.type !==
      'PASSWORD_RESET'
    ) {
      return res.status(400).json({
        message:
          'Invalid OTP type',
      });
    }

    return res.json({
      message:
        'OTP verified successfully',

      resetToken:
        crypto
          .randomBytes(32)
          .toString('hex'),
    });

  } catch (error) {
    console.error(
      'Vendor verify reset OTP error:',
      error
    );

    return res.status(500).json({
      message:
        'Something went wrong',
    });
  }
}

// =====================================================
// VENDOR RESET PASSWORD
// =====================================================

async function vendorResetPassword(req, res) {
  try {
    const {
      email,
      newPassword,
      confirmPassword,
    } = req.body;

    if (
      !email ||
      !newPassword ||
      !confirmPassword
    ) {
      return res.status(400).json({
        message:
          'Email, new password and confirm password are required',
      });
    }

    if (
      newPassword !== confirmPassword
    ) {
      return res.status(400).json({
        message:
          'Password and confirm password do not match',
      });
    }

    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({
        message:
          'Unable to reset password',
      });
    }

    // Verify vendor
    const vendorRole = await UserRole.findOne({
      where: {
        userId: user.id,
      },
      include: [
        {
          model: Role,
          where: {
            name: 'vendor',
          },
        },
      ],
    });

    if (!vendorRole) {
      return res.status(400).json({
        message:
          'Unable to reset password',
      });
    }

    // Hash new password
    user.password =
      await bcrypt.hash(
        newPassword,
        12
      );

    await user.save();

    return res.json({
      message:
        'Vendor password reset successfully',
    });

  } catch (error) {
    console.error(
      'Vendor reset password error:',
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
  vendorVerifyResetOtp,
  vendorResetPassword,
vendorForgotPassword,
};
