const {
  LoyaltyProgram,
} = require('../models');


// =====================================================
// CREATE LOYALTY PROGRAM
// =====================================================

async function createLoyaltyProgram(req, res) {
  try {
    const {
      programName,
      requiredStarCollection,
      qrCodeScanIntervalValue,
      qrCodeScanIntervalUnit,
      programRules,
      enablePinVerification,
    } = req.body || {};

    // Vendor ID comes from JWT
    const vendorId = req.user.id;

    // =================================================
    // VALIDATION
    // =================================================

    if (!programName) {
      return res.status(400).json({
        message: 'Program name is required',
      });
    }

    if (
      requiredStarCollection === undefined ||
      requiredStarCollection === null ||
      requiredStarCollection === ''
    ) {
      return res.status(400).json({
        message:
          'Required star collection is required',
      });
    }

    if (
      qrCodeScanIntervalValue === undefined ||
      qrCodeScanIntervalValue === null ||
      qrCodeScanIntervalValue === ''
    ) {
      return res.status(400).json({
        message:
          'QR code scan interval value is required',
      });
    }

    if (!qrCodeScanIntervalUnit) {
      return res.status(400).json({
        message:
          'QR code scan interval unit is required',
      });
    }

    // =================================================
    // NUMBER VALIDATION
    // =================================================

    const starCollection =
      Number(requiredStarCollection);

    const intervalValue =
      Number(qrCodeScanIntervalValue);

    if (
      !Number.isInteger(
        starCollection
      ) ||
      starCollection <= 0
    ) {
      return res.status(400).json({
        message:
          'Required star collection must be a positive integer',
      });
    }

    if (
      !Number.isInteger(
        intervalValue
      ) ||
      intervalValue <= 0
    ) {
      return res.status(400).json({
        message:
          'QR code scan interval value must be a positive integer',
      });
    }

    // =================================================
    // INTERVAL UNIT VALIDATION
    // =================================================

    const allowedUnits = [
      'MINUTES',
      'HOURS',
      'DAYS',
    ];

    const intervalUnit =
      String(
        qrCodeScanIntervalUnit
      ).toUpperCase();

    if (
      !allowedUnits.includes(
        intervalUnit
      )
    ) {
      return res.status(400).json({
        message:
          'QR code scan interval unit must be MINUTES, HOURS or DAYS',
      });
    }

    // =================================================
    // IMAGE
    // =================================================

    let imagePath = null;

    if (req.file) {
      imagePath =
        `/uploads/loyalty/${req.file.filename}`;
    }

    // =================================================
    // CREATE LOYALTY
    // =================================================

    const loyaltyProgram =
      await LoyaltyProgram.create({
        vendorId,

        image:
          imagePath,

        programName:
          programName.trim(),

        requiredStarCollection:
          starCollection,

        qrCodeScanIntervalValue:
          intervalValue,

        qrCodeScanIntervalUnit:
          intervalUnit,

        programRules:
          programRules
            ? programRules.trim()
            : null,

        enablePinVerification:
          enablePinVerification === true ||
          enablePinVerification === 'true',
      });

    return res.status(201).json({
      message:
        'Loyalty program created successfully',

      loyaltyProgram: {
        id:
          loyaltyProgram.id,

        vendorId:
          loyaltyProgram.vendorId,

        image:
          loyaltyProgram.image,

        programName:
          loyaltyProgram.programName,

        requiredStarCollection:
          loyaltyProgram.requiredStarCollection,

        qrCodeScanIntervalValue:
          loyaltyProgram.qrCodeScanIntervalValue,

        qrCodeScanIntervalUnit:
          loyaltyProgram.qrCodeScanIntervalUnit,

        programRules:
          loyaltyProgram.programRules,

        enablePinVerification:
          loyaltyProgram.enablePinVerification,

        createdAt:
          loyaltyProgram.createdAt,
      },
    });

  } catch (error) {
    console.error(
      'Create loyalty program error:',
      error
    );

    return res.status(500).json({
      message:
        'Something went wrong',
    });
  }
}

// =====================================================
// GET 5 RECENT LOYALTY PROGRAMS
// =====================================================

async function getRecentLoyaltyPrograms(req, res) {
  try {
    // Get vendor from JWT
    const vendorId = req.user.id;

    const loyaltyPrograms =
      await LoyaltyProgram.findAll({
        where: {
          vendorId,
        },

        order: [
          ['createdAt', 'DESC'],
        ],

        limit: 5,
      });

    return res.status(200).json({
      message:
        'Recent loyalty programs fetched successfully',

      count:
        loyaltyPrograms.length,

      loyaltyPrograms,
    });

  } catch (error) {
    console.error(
      'Get recent loyalty programs error:',
      error
    );

    return res.status(500).json({
      message:
        'Something went wrong',
    });
  }
}


// =====================================================
// GET ALL LOYALTY PROGRAMS
// =====================================================

async function getAllLoyaltyPrograms(req, res) {
  try {
    // Get vendor from JWT
    const vendorId = req.user.id;

    const loyaltyPrograms =
      await LoyaltyProgram.findAll({
        where: {
          vendorId,
        },

        order: [
          ['createdAt', 'DESC'],
        ],
      });

    return res.status(200).json({
      message:
        'Loyalty programs fetched successfully',

      count:
        loyaltyPrograms.length,

      loyaltyPrograms,
    });

  } catch (error) {
    console.error(
      'Get all loyalty programs error:',
      error
    );

    return res.status(500).json({
      message:
        'Something went wrong',
    });
  }
}


module.exports = {
  createLoyaltyProgram,
  getRecentLoyaltyPrograms,
  getAllLoyaltyPrograms,
};