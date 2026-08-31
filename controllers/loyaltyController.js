const { Op } = require('sequelize');

const { LoyaltyProgram } = require('../models');

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

    if (!programName || !programName.trim()) {
      return res.status(400).json({
        message: 'Program name is required',
      });
    }

    if (requiredStarCollection === undefined || requiredStarCollection === null || requiredStarCollection === '') {
      return res.status(400).json({
        message: 'Required star collection is required',
      });
    }

    const starCollection = Number(requiredStarCollection);

    if (!Number.isInteger(starCollection) || starCollection <= 0) {
      return res.status(400).json({
        message: 'Required star collection must be a positive integer',
      });
    }

    let intervalValue = null;
    let intervalUnit = null;

    const hasIntervalValue =
      qrCodeScanIntervalValue !== undefined && qrCodeScanIntervalValue !== null && qrCodeScanIntervalValue !== '';

    const hasIntervalUnit =
      qrCodeScanIntervalUnit !== undefined && qrCodeScanIntervalUnit !== null && qrCodeScanIntervalUnit !== '';

    if (hasIntervalValue !== hasIntervalUnit) {
      return res.status(400).json({
        message: 'QR code scan interval value and unit must be provided together',
      });
    }

    if (hasIntervalValue && hasIntervalUnit) {
      intervalValue = Number(qrCodeScanIntervalValue);

      if (!Number.isInteger(intervalValue) || intervalValue <= 0) {
        return res.status(400).json({
          message: 'QR code scan interval value must be a positive integer',
        });
      }

      const allowedUnits = ['MINUTES', 'HOURS', 'DAYS', 'SECONDS'];

      intervalUnit = String(qrCodeScanIntervalUnit).trim().toUpperCase();

      if (!allowedUnits.includes(intervalUnit)) {
        return res.status(400).json({
          message: 'QR code scan interval unit must be MINUTES, HOURS or DAYS',
        });
      }
    }

    let imagePath = null;

    if (req.file) {
      imagePath = `/uploads/loyalty/${req.file.filename}`;
    }

    let rules = null;

    if (programRules !== undefined && programRules !== null && programRules !== '') {
      rules = String(programRules).trim();
    }

    const pinVerification = enablePinVerification === true || enablePinVerification === 'true';

    const loyaltyProgram = await LoyaltyProgram.create({
      vendorId,

      image: imagePath,

      programName: programName.trim(),

      requiredStarCollection: starCollection,

      qrCodeScanIntervalValue: intervalValue,

      qrCodeScanIntervalUnit: intervalUnit,

      programRules: rules,

      enablePinVerification: pinVerification,
    });

    return res.status(201).json({
      message: 'Loyalty program created successfully',

      loyaltyProgram: {
        id: loyaltyProgram.id,

        vendorId: loyaltyProgram.vendorId,

        image: loyaltyProgram.image,

        programName: loyaltyProgram.programName,

        requiredStarCollection: loyaltyProgram.requiredStarCollection,

        qrCodeScanIntervalValue: loyaltyProgram.qrCodeScanIntervalValue,

        qrCodeScanIntervalUnit: loyaltyProgram.qrCodeScanIntervalUnit,

        programRules: loyaltyProgram.programRules,

        enablePinVerification: loyaltyProgram.enablePinVerification,

        createdAt: loyaltyProgram.createdAt,

        updatedAt: loyaltyProgram.updatedAt,
      },
    });
  } catch (error) {
    console.error('Create loyalty program error:', error);

    return res.status(500).json({
      message: 'Something went wrong',
    });
  }
}

// GET VENDOR LOYALTY PROGRAMS
async function getLoyaltyPrograms(req, res) {
  try {
    const { page = 1, limit = 5, search = '' } = req.query;

    const vendorId = req.user.id;

    const pageNumber = Number(page);

    const limitNumber = Number(limit);

    if (!Number.isInteger(pageNumber) || pageNumber < 1) {
      return res.status(400).json({
        message: 'Page must be a positive integer',
      });
    }

    if (!Number.isInteger(limitNumber) || limitNumber < 1 || limitNumber > 100) {
      return res.status(400).json({
        message: 'Limit must be between 1 and 100',
      });
    }

    // Calculate offset
    const offset = (pageNumber - 1) * limitNumber;

    const whereCondition = {
      vendorId,
    };

    if (search && search.trim()) {
      whereCondition.programName = {
        [Op.like]: `%${search.trim()}%`,
      };
    }

    const { count, rows: loyaltyPrograms } = await LoyaltyProgram.findAndCountAll({
      where: whereCondition,

      order: [['createdAt', 'DESC']],

      limit: limitNumber,

      offset,
    });

    const totalPages = Math.ceil(count / limitNumber);

    return res.status(200).json({
      message: 'Loyalty programs fetched successfully',

      data: loyaltyPrograms,

      pagination: {
        currentPage: pageNumber,

        limit: limitNumber,

        totalItems: count,

        totalPages,

        hasNextPage: pageNumber < totalPages,

        hasPreviousPage: pageNumber > 1,
      },
    });
  } catch (error) {
    console.error('Get loyalty programs error:', error);

    return res.status(500).json({
      message: 'Something went wrong',
    });
  }
}

module.exports = {
  createLoyaltyProgram,
  getLoyaltyPrograms,
};
