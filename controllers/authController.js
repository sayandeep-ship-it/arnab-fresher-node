const bcrypt = require('bcryptjs');

const {User} = require('../models');

const {
  createAndSendOtp,
  verifyOtp,
} = require('../services/otpService');

const generateToken = require('../utils/generateToken');

const crypto = require('crypto');

// Register a new user
async function register(req, res) {
  try {
    // Extract user details from request body
    const {
      firstName,
      lastName,
      email,
      password,
    } = req.body;

    // Check if the email is already registered
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

    // Hash the password before storing it
    const hashedPassword =
      await bcrypt.hash(
        password,
        12
      );

    const user =
      await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,

        // User MUST remain inactive
        isActive: false,
      });

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
    console.error(error);

    return res.status(500).json({
      message:
        'Something went wrong',
    });
  }
}

// Verify email using OTP
async function verifyEmail(req, res) {
  try {
    const {
      userId,
      otp,
    } = req.body;

    const user =
      await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        message:
          'User not found',
      });
    }

    if (user.isActive) {
      return res.status(400).json({
        message:
          'Email already verified',
      });
    }

    const isValid =
      await verifyOtp(
        user.id,
        otp,
        'EMAIL_VERIFICATION'
      );

    if (!isValid) {
      return res.status(400).json({
        message:
          'Invalid or expired OTP',
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
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message:
        'Something went wrong',
    });
  }
}

//login user

async function login(req, res) {
  try {
    const {
      email,
      password,
    } = req.body;

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

    // IMPORTANT
    if (!user.isActive) {
      return res.status(403).json({
        message:
          'Please verify your email before logging in.',
      });
    }

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

    const token = generateToken(user);

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
    console.error(error);

    return res.status(500).json({
      message:
        'Something went wrong',
    });
  }
}

//forgot password
async function forgotPassword(
  req,
  res
) {
  try {
    const { email } =
      req.body;

    const user =
      await User.findOne({
        where: { email },
      });

    // Don't reveal whether email exists
    if (!user) {
      return res.json({
        message:
          'If the email exists, an OTP has been sent.',
      });
    }

    await createAndSendOtp(
      user,
      'PASSWORD_RESET'
    );

    return res.json({
      message:
        'If the email exists, an OTP has been sent.',
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message:
        'Something went wrong',
    });
  }
}

//verify OTP for password reset

async function verifyResetOtp(
  req,
  res
) {
  try {
    const {
      email,
      otp,
    } = req.body;

    const user =
      await User.findOne({
        where: { email },
      });

    if (!user) {
      return res.status(400).json({
        message:
          'Invalid or expired OTP',
      });
    }

    const valid =
      await verifyOtp(
        user.id,
        otp,
        'PASSWORD_RESET'
      );

    if (!valid) {
      return res.status(400).json({
        message:
          'Invalid or expired OTP',
      });
    }

    const resetToken =
      crypto
        .randomBytes(32)
        .toString('hex');

    // For a production application,
    // store this reset token in a separate
    // PasswordResetTokens table.
    //
    // For now we return it to demonstrate
    // the flow.

    return res.json({
      message:
        'OTP verified successfully',

      resetToken,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message:
        'Something went wrong',
    });
  }
}

// Reset password using the reset token

async function resetPassword(req,res) {
  try {
    const {
      email,
      newPassword,
    } = req.body;

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
    console.error(error);

    return res.status(500).json({
      message:
        'Something went wrong',
    });
  }
}


module.exports = {
  register,
  verifyEmail,
  login,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
};