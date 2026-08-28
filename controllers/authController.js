const bcrypt = require('bcryptjs');
const crypto = require('crypto');


const {
  User,
  Role,
  VendorProfile,
} = require('../models');

const {
  createAndSendOtp,
  verifyOtp: verifyOtpService,
  resendOtp: resendOtpService,
} = require('../services/otpService');

const generateToken =
  require('../utils/generateToken');


// =====================================================
// REGISTER
// =====================================================

async function register(req, res) {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
    } = req.body;

    // Validate required fields
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).json({
        message:
          'First name, last name, email, password and confirm password are required',
      });
    }

    // Check password confirmation
    if (password !== confirmPassword) {
      return res.status(400).json({
        message:
          'Password and confirm password do not match',
      });
    }

    // Check if email already exists
    const existingUser =
      await User.findOne({
        where: { email },
      });

    if (existingUser) {
      return res.status(409).json({
        message:
          'Email already registered',
      });
    }

    // Hash password
    const hashedPassword =
      await bcrypt.hash(
        password,
        12
      );

    // Create user
    const user =
      await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        isActive: false,
      });

    // Send email verification OTP
    await createAndSendOtp(
      user,
      'EMAIL_VERIFICATION'
    );

    return res.status(201).json({
      message:
        'Registration successful. OTP sent to your email.',
      userId: user.id,
    });

  } catch (error) {
    console.error(
      'Register error:',
      error
    );

    return res.status(500).json({
      message:
        'Something went wrong',
    });
  }
}


// =====================================================
// VERIFY OTP
// =====================================================

async function verifyOtp(req, res) {
  try {
    const {
      userId,
      email,
      otp,
    } = req.body;

    // Either userId or email is required
    if (!userId && !email) {
      return res.status(400).json({
        message:
          'userId or email is required',
      });
    }

    // OTP is required
    if (!otp) {
      return res.status(400).json({
        message:
          'OTP is required',
      });
    }

    // Find user
    let user;

    if (userId) {
      user =
        await User.findByPk(userId);
    } else {
      user =
        await User.findOne({
          where: { email },
        });
    }

    if (!user) {
      return res.status(400).json({
        message:
          'Invalid or expired OTP',
      });
    }

    // Verify OTP
    //
    // Do NOT pass type from frontend.
    // OTP service gets the type from database.
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


    // =================================================
    // EMAIL VERIFICATION
    // =================================================

    if (
      otpRecord.type ===
      'EMAIL_VERIFICATION'
    ) {

      // Already verified
      if (user.isActive) {
        return res.status(400).json({
          message:
            'Email already verified',
        });
      }

      // Activate account
      user.isActive = true;

      user.emailVerifiedAt =
        new Date();

      await user.save();

      // Automatically login
      const token =
        generateToken(user);

      return res.json({
        message:
          'Email verified successfully',

        token,

        user: {
          id: user.id,
          firstName:
            user.firstName,
          lastName:
            user.lastName,
          email:
            user.email,
        },
      });
    }


    // =================================================
    // PASSWORD RESET
    // =================================================

    if (
      otpRecord.type ===
      'PASSWORD_RESET'
    ) {

      // Generate reset token
      const resetToken =
        crypto
          .randomBytes(32)
          .toString('hex');

      /*
       * IMPORTANT:
       *
       * This token is currently only
       * returned to the frontend.
       *
       * We should store it in a
       * PasswordResetTokens table
       * before production.
       */

      return res.json({
        message:
          'OTP verified successfully',

        resetToken,
      });
    }


    // =================================================
    // UNKNOWN OTP TYPE
    // =================================================

    return res.status(400).json({
      message:
        'Unsupported OTP type',
    });

  } catch (error) {
    console.error(
      'Verify OTP error:',
      error
    );

    return res.status(500).json({
      message:
        'Something went wrong',
    });
  }
}


// =====================================================
// RESEND OTP
// =====================================================

async function resendOtp(req, res) {
  try {
    const {
      userId,
      email,
    } = req.body;

    // Either userId or email is required
    if (!userId && !email) {
      return res.status(400).json({
        message:
          'userId or email is required',
      });
    }

    // Find user
    let user;

    if (userId) {
      user =
        await User.findByPk(userId);
    } else {
      user =
        await User.findOne({
          where: { email },
        });
    }

    if (!user) {
      return res.status(400).json({
        message:
          'Unable to resend OTP',
      });
    }

    // Resend OTP
    const result =
      await resendOtpService(user);

    // No previous OTP
    if (!result) {
      return res.status(400).json({
        message:
          'No OTP request found',
      });
    }

    // Current OTP has not expired
    if (!result.success) {
      return res.status(400).json({
        message:
          'Current OTP has not expired yet. Please wait before requesting a new OTP.',
      });
    }

    return res.json({
      message:
        'OTP resent successfully',
    });

  } catch (error) {
    console.error(
      'Resend OTP error:',
      error
    );

    return res.status(500).json({
      message:
        'Something went wrong',
    });
  }
}


// =====================================================
// LOGIN
// =====================================================

async function login(req, res) {
  try {
    const {
      email,
      password,
    } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        message:
          'Email and password are required',
      });
    }

    // Find user
    const user =
      await User.findOne({
        where: { email },
      });

    if (!user) {
      return res.status(401).json({
        message:
          'Invalid email or password',
      });
    }

    // Check email verification
    if (!user.isActive) {
      return res.status(403).json({
        message:
          'Please verify your email before logging in.',
      });
    }

    // Compare password
    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      return res.status(401).json({
        message:
          'Invalid email or password',
      });
    }

    // Generate JWT
    const token =
      generateToken(user);

    return res.json({
      message:
        'Login successful',

      token,

      user: {
        id: user.id,
        firstName:
          user.firstName,
        lastName:
          user.lastName,
        email:
          user.email,
      },
    });

  } catch (error) {
    console.error(
      'Login error:',
      error
    );

    return res.status(500).json({
      message:
        'Something went wrong',
    });
  }
}


// =====================================================
// FORGOT PASSWORD
// =====================================================

async function forgotPassword(
  req,
  res
) {
  try {
    const { email } =
      req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({
        message:
          'Email is required',
      });
    }

    // Find user
    const user =
      await User.findOne({
        where: { email },
      });

    /*
     * Don't reveal whether the
     * email exists or not.
     */

    if (!user) {
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
      'Forgot password error:',
      error
    );

    return res.status(500).json({
      message:
        'Something went wrong',
    });
  }
}


// =====================================================
// RESET PASSWORD
// =====================================================

async function resetPassword(
  req,
  res
) {
  try {
    const {
      email,
      newPassword,
    } = req.body;

    // Validate fields
    if (!email || !newPassword) {
      return res.status(400).json({
        message:
          'Email and new password are required',
      });
    }

    // Find user
    const user =
      await User.findOne({
        where: { email },
      });

    if (!user) {
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
        'Password reset successfully',
    });

  } catch (error) {
    console.error(
      'Reset password error:',
      error
    );

    return res.status(500).json({
      message:
        'Something went wrong',
    });
  }
}

// =====================================================
// GET LOGGED-IN USER
// =====================================================

async function getMe(req, res) {
  try {
    // User ID comes from JWT
    const userId = req.user.id;

    const user =
      await User.findByPk(userId, {
        attributes: [
          'id',
          'firstName',
          'lastName',
          'email',
          'isActive',
          'emailVerifiedAt',
          'createdAt',
          'updatedAt',
        ],

        include: [
          {
            model: Role,
            as: 'roles',

            attributes: [
              'id',
              'name',
            ],

            through: {
              attributes: [],
            },
          },

          {
            model: VendorProfile,
            as: 'vendorProfile',

            required: false,

            attributes: [
              'id',
              'userId',
              'streetAddress',
              'city',
              'country',
              'state',
              'pincode',
              'isAddress',
            ],
          },
        ],
      });

    // User no longer exists
    if (!user) {
      return res.status(404).json({
        message:
          'User not found',
      });
    }

    return res.status(200).json({
      message:
        'User details fetched successfully',

      user,
    });

  } catch (error) {
    console.error(
      'Get me error:',
      error
    );

    return res.status(500).json({
      message:
        'Something went wrong',
    });
  }
}

// =====================================================
// GET USER PROFILE
// =====================================================

async function getUserProfile(req, res) {
  try {
    // User ID comes from JWT
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      attributes: [
        'id',
        'firstName',
        'lastName',
        'email',
        'phone',
        'profilePicture',
        'isActive',
        'emailVerifiedAt',
        'createdAt',
        'updatedAt',
      ],
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    return res.status(200).json({
      message: 'User profile fetched successfully',

      user: {
        id: user.id,

        firstName:
          user.firstName,

        lastName:
          user.lastName,

        email:
          user.email,

        phone:
          user.phone,

        profilePicture:
          user.profilePicture,

        isActive:
          user.isActive,

        emailVerifiedAt:
          user.emailVerifiedAt,

        createdAt:
          user.createdAt,

        updatedAt:
          user.updatedAt,
      },
    });

  } catch (error) {
    console.error(
      'Get user profile error:',
      error
    );

    return res.status(500).json({
      message:
        'Something went wrong',
    });
  }
}


// =====================================================
// UPDATE USER PROFILE
// =====================================================

async function updateUserProfile(req, res) {
  try {
    // User ID comes from JWT
    const userId = req.user.id;

    const {
      firstName,
      lastName,
      email,
      phone,
    } = req.body || {};

    // =================================================
    // FIND USER
    // =================================================

    const user =
      await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        message:
          'User not found',
      });
    }

    // =================================================
    // VALIDATION
    // =================================================

    if (
      firstName !== undefined &&
      !String(firstName).trim()
    ) {
      return res.status(400).json({
        message:
          'First name cannot be empty',
      });
    }

    if (
      email !== undefined &&
      !String(email).trim()
    ) {
      return res.status(400).json({
        message:
          'Email cannot be empty',
      });
    }

    // =================================================
    // EMAIL UPDATE
    // =================================================

    if (
      email !== undefined &&
      email.trim() !== user.email
    ) {
      const existingUser =
        await User.findOne({
          where: {
            email: email.trim(),
          },
        });

      if (
        existingUser &&
        existingUser.id !== user.id
      ) {
        return res.status(409).json({
          message:
            'Email is already registered',
        });
      }

      user.email =
        email.trim();
    }

    // =================================================
    // NAME
    // =================================================

    if (firstName !== undefined) {
      user.firstName =
        firstName.trim();
    }

    if (lastName !== undefined) {
      user.lastName =
        lastName
          ? lastName.trim()
          : null;
    }

    // =================================================
    // PHONE
    // =================================================

    if (phone !== undefined) {
      user.phone =
        phone
          ? String(phone).trim()
          : null;
    }

    // =================================================
    // PROFILE PICTURE
    // =================================================

    if (req.file) {
      user.profilePicture =
        `/uploads/users/${req.file.filename}`;
    }

    // =================================================
    // SAVE
    // =================================================

    await user.save();

    return res.status(200).json({
      message:
        'User profile updated successfully',

      user: {
        id:
          user.id,

        firstName:
          user.firstName,

        lastName:
          user.lastName,

        email:
          user.email,

        phone:
          user.phone,

        profilePicture:
          user.profilePicture,

        isActive:
          user.isActive,

        emailVerifiedAt:
          user.emailVerifiedAt,
      },
    });

  } catch (error) {
    console.error(
      'Update user profile error:',
      error
    );

    // Handle Sequelize unique constraint
    if (
      error.name ===
      'SequelizeUniqueConstraintError'
    ) {
      return res.status(409).json({
        message:
          'Email is already registered',
      });
    }

    return res.status(500).json({
      message:
        'Something went wrong',
    });
  }
}


// =====================================================
// CHANGE USER PASSWORD
// =====================================================

async function changeUserPassword(req, res) {
  try {
    // User ID comes from JWT
    const userId = req.user.id;

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = req.body || {};

    // =================================================
    // VALIDATION
    // =================================================

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      return res.status(400).json({
        message:
          'Current password, new password and confirm password are required',
      });
    }

    // =================================================
    // CONFIRM PASSWORD
    // =================================================

    if (
      newPassword !==
      confirmPassword
    ) {
      return res.status(400).json({
        message:
          'New password and confirm password do not match',
      });
    }

    // =================================================
    // PASSWORD LENGTH
    // =================================================

    if (
      newPassword.length < 8
    ) {
      return res.status(400).json({
        message:
          'New password must be at least 8 characters long',
      });
    }

    // =================================================
    // FIND USER
    // =================================================

    const user =
      await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        message:
          'User not found',
      });
    }

    // =================================================
    // CHECK CURRENT PASSWORD
    // =================================================

    const passwordMatch =
      await bcrypt.compare(
        currentPassword,
        user.password
      );

    if (!passwordMatch) {
      return res.status(401).json({
        message:
          'Current password is incorrect',
      });
    }

    // =================================================
    // PREVENT SAME PASSWORD
    // =================================================

    const samePassword =
      await bcrypt.compare(
        newPassword,
        user.password
      );

    if (samePassword) {
      return res.status(400).json({
        message:
          'New password must be different from current password',
      });
    }

    // =================================================
    // HASH NEW PASSWORD
    // =================================================

    user.password =
      await bcrypt.hash(
        newPassword,
        12
      );

    await user.save();

    return res.status(200).json({
      message:
        'Password changed successfully',
    });

  } catch (error) {
    console.error(
      'Change user password error:',
      error
    );

    return res.status(500).json({
      message:
        'Something went wrong',
    });
  }
}


// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  register,
  verifyOtp,
  resendOtp,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
};