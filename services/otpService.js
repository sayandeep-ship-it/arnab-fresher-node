const { Op } = require('sequelize');

const {
  Otp,
} = require('../models');

const generateOtp = require('../utils/generateOtp.js');

const {
  sendOtpEmail,
} = require('./emailService.js');

async function createAndSendOtp(
  user,
  type
) {
  const otp = generateOtp();

  const expiresAt = new Date(
    Date.now() +
      Number(
        process.env.OTP_EXPIRES_MINUTES || 10                       //10 minutes
      ) *
        60 *
        1000
  );

  // Invalidate previous OTPs
  await Otp.update(
    {
      verifiedAt: new Date(),
    },

    {
      where: {
        userId: user.id,
        type,
        verifiedAt: null,
      },
    }
  );

  await Otp.create({
    userId: user.id,
    otp,
    type,
    expiresAt,
  });

  await sendOtpEmail(
    user.email,
    otp,
    type
  );
}

async function verifyOtp(
  userId,
  otp,
  type
) {
  const otpRecord =
    await Otp.findOne({
      where: {
        userId,
        otp,
        type,

        verifiedAt: null,

        expiresAt: {
          [Op.gt]: new Date(),
        },
      },

      order: [
        ['createdAt', 'DESC'],
      ],
    });

  if (!otpRecord) {
    return false;
  }

  otpRecord.verifiedAt =
    new Date();

  await otpRecord.save();

  return true;
}

module.exports = {
  createAndSendOtp,
  verifyOtp,
};