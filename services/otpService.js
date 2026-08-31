const { Op } = require('sequelize');

const { Otp } = require('../models');

const generateOtp = require('../utils/generateOtp.js');

const { sendOtpEmail } = require('./emailService.js');

const OTP_EXPIRES_MINUTES = Number(process.env.OTP_EXPIRES_MINUTES || 10);

async function createAndSendOtp(user, type) {
  const otp = generateOtp();

  const expiresAt = new Date(Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000);

  // Invalidate all previous active OTPs
  await Otp.update(
    {
      verifiedAt: new Date(),
    },
    {
      where: {
        userId: user.id,
        verifiedAt: null,
      },
    }
  );

  // Create new OTP
  await Otp.create({
    userId: user.id,
    otp,
    type,
    expiresAt,
  });

  // Send OTP email
  await sendOtpEmail(user.email, otp, type);
}

async function verifyOtp(userId, otp) {
  const otpRecord = await Otp.findOne({
    where: {
      userId,
      otp,

      // OTP must not already be used
      verifiedAt: null,

      // OTP must not be expired
      expiresAt: {
        [Op.gt]: new Date(),
      },
    },

    // Always use newest OTP
    order: [['createdAt', 'DESC']],
  });

  // Invalid or expired OTP
  if (!otpRecord) {
    return null;
  }

  // Mark OTP as used
  otpRecord.verifiedAt = new Date();

  await otpRecord.save();

  return otpRecord;
}

async function resendOtp(user) {
  // Find the latest OTP
  const latestOtp = await Otp.findOne({
    where: {
      userId: user.id,
    },

    order: [['createdAt', 'DESC']],
  });

  // No previous OTP request
  if (!latestOtp) {
    return null;
  }

  const now = new Date();

  const otpStillValid = latestOtp.expiresAt && latestOtp.expiresAt > now && !latestOtp.verifiedAt;

  if (otpStillValid) {
    return {
      success: false,
      reason: 'OTP_NOT_EXPIRED',
    };
  }

  const otp = generateOtp();

  const expiresAt = new Date(Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000);

  await Otp.create({
    userId: user.id,

    otp,

    type: latestOtp.type,

    expiresAt,

    verifiedAt: null,
  });

  await sendOtpEmail(user.email, otp, latestOtp.type);

  return {
    success: true,
    type: latestOtp.type,
  };
}

module.exports = {
  createAndSendOtp,
  verifyOtp,
  resendOtp,
};
