const { Op } = require('sequelize');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const bcrypt = require('bcryptjs');

const { User, VendorProfile, LoyaltyProgram, UserLoyaltyProgram,LoyaltyRedemption } = require('../models');

async function getVendorProfile(req, res) {
  try {
    // Vendor ID comes from JWT
    const vendorId = req.user.id;

    // Find vendor
    const user = await User.findByPk(vendorId, {
      attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],

      include: [
        {
          model: VendorProfile,
          as: 'vendorProfile',

          attributes: [
            'id',
            'userId',
            'profilePicture',
            'streetAddress',
            'city',
            'state',
            'country',
            'pincode',
            'isAddress',
            'createdAt',
            'updatedAt',
          ],

          required: false,
        },
      ],
    });

    if (!user) {
      return res.status(404).json({
        message: 'Vendor not found',
      });
    }

    return res.status(200).json({
      message: 'Vendor profile fetched successfully',

      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
      },

      vendorProfile: user.vendorProfile || null,
    });
  } catch (error) {
    console.error('Get vendor profile error:', error);

    return res.status(500).json({
      message: 'Something went wrong',
    });
  }
}

async function updateVendorProfile(req, res) {
  try {
    // Vendor ID comes from JWT
    const vendorId = req.user.id;

    const {
      firstName,
      lastName,
      phone,

      streetAddress,
      city,
      state,
      country,
      pincode,
    } = req.body || {};

    const user = await User.findByPk(vendorId);

    if (!user) {
      return res.status(404).json({
        message: 'Vendor not found',
      });
    }

    let vendorProfile = await VendorProfile.findOne({
      where: {
        userId: vendorId,
      },
    });

    if (!vendorProfile) {
      vendorProfile = await VendorProfile.create({
        userId: vendorId,
        isAddress: false,
      });
    }

    if (firstName !== undefined) {
      const trimmedFirstName = String(firstName).trim();

      if (!trimmedFirstName) {
        return res.status(400).json({
          message: 'First name cannot be empty',
        });
      }

      user.firstName = trimmedFirstName;
    }

    if (lastName !== undefined) {
      user.lastName = String(lastName).trim();
    }

    if (phone !== undefined) {
      const trimmedPhone = String(phone).trim();

      user.phone = trimmedPhone || null;
    }

    if (req.file) {
      vendorProfile.profilePicture = `/uploads/vendor/${req.file.filename}`;
    }

    if (streetAddress !== undefined) {
      vendorProfile.streetAddress = String(streetAddress).trim() || null;
    }

    if (city !== undefined) {
      vendorProfile.city = String(city).trim() || null;
    }

    if (state !== undefined) {
      vendorProfile.state = String(state).trim() || null;
    }

    if (country !== undefined) {
      vendorProfile.country = String(country).trim() || null;
    }

    if (pincode !== undefined) {
      vendorProfile.pincode = String(pincode).trim() || null;
    }

    const addressComplete = Boolean(
      vendorProfile.streetAddress &&
      vendorProfile.city &&
      vendorProfile.state &&
      vendorProfile.country &&
      vendorProfile.pincode
    );

    vendorProfile.isAddress = addressComplete;

    await user.save();

    await vendorProfile.save();

    return res.status(200).json({
      message: 'Vendor profile updated successfully',

      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
      },

      vendorProfile: {
        id: vendorProfile.id,
        userId: vendorProfile.userId,
        profilePicture: vendorProfile.profilePicture,

        streetAddress: vendorProfile.streetAddress,

        city: vendorProfile.city,

        state: vendorProfile.state,

        country: vendorProfile.country,

        pincode: vendorProfile.pincode,

        isAddress: vendorProfile.isAddress,
      },
    });
  } catch (error) {
    console.error('Update vendor profile error:', error);

    return res.status(500).json({
      message: 'Something went wrong',
    });
  }
}

async function changeVendorPassword(req, res) {
  try {
    // Vendor ID comes from JWT
    const vendorId = req.user.id;

    const { currentPassword, newPassword, confirmPassword } = req.body || {};

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: 'Current password, new password and confirm password are required',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: 'New password and confirm password do not match',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: 'New password must be at least 8 characters long',
      });
    }

    const user = await User.findByPk(vendorId);

    if (!user) {
      return res.status(404).json({
        message: 'Vendor not found',
      });
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        message: 'Current password is incorrect',
      });
    }

    const samePassword = await bcrypt.compare(newPassword, user.password);

    if (samePassword) {
      return res.status(400).json({
        message: 'New password must be different from current password',
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    user.password = hashedPassword;

    await user.save();

    return res.status(200).json({
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change vendor password error:', error);

    return res.status(500).json({
      message: 'Something went wrong',
    });
  }
}

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
          message: 'QR code scan interval unit must be MINUTES, HOURS, DAYS or SECONDS',
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

    // Create loyalty program
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

    const qrDirectory = path.join(__dirname, '..', 'uploads', 'loyalty', 'qr');

    // Create QR directory if it doesn't exist
    if (!fs.existsSync(qrDirectory)) {
      fs.mkdirSync(qrDirectory, {
        recursive: true,
      });
    }

    // URL stored inside QR code
    const qrUrl = `${process.env.FRONTEND_URL}/loyalty/scan/${loyaltyProgram.qrCodeToken}`;

    // QR file name
    const qrFileName = `loyalty-${loyaltyProgram.id}-qr.png`;

    // Full local file path
    const qrFilePath = path.join(qrDirectory, qrFileName);

    // Generate QR code
    await QRCode.toFile(qrFilePath, qrUrl, {
      type: 'png',
      width: 500,
      margin: 2,
      errorCorrectionLevel: 'H',
    });

    // Path saved in database
    const qrCodePath = `/uploads/loyalty/qr/${qrFileName}`;

    loyaltyProgram.qrCodePath = qrCodePath;

    await loyaltyProgram.save();

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

        status: loyaltyProgram.status,

        qrCodeToken: loyaltyProgram.qrCodeToken,

        qrUrl,

        qrCodePath,

        qrCodeUrl: `${process.env.BASE_URL || 'http://localhost:5000'}${qrCodePath}`,

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

async function generateLoyaltyPin(req, res) {
  try {
    const { loyaltyProgramId } = req.body || {};
    const vendorId = req.user.id;

    if (!loyaltyProgramId) {
      return res.status(400).json({
        message: 'Loyalty program ID is required',
      });
    }

    const loyaltyProgram = await LoyaltyProgram.findOne({
      where: {
        id: loyaltyProgramId,
        vendorId,
        status: 'active',
      },
    });

    if (!loyaltyProgram) {
      return res.status(404).json({
        message: 'Loyalty program not found',
      });
    }

    if (!loyaltyProgram.enablePinVerification) {
      return res.status(400).json({
        message: 'PIN verification is disabled for this loyalty program',
      });
    }

    const pin = Math.floor(100 + Math.random() * 900).toString();

    const pinGeneratedAt = new Date();

    const pinExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    loyaltyProgram.pin = pin;
    loyaltyProgram.pinGeneratedAt = pinGeneratedAt;
    loyaltyProgram.pinExpiresAt = pinExpiresAt;

    await loyaltyProgram.save();

    return res.status(200).json({
      message: 'PIN generated successfully',
      pin,
      pinExpiresAt,
    });
  } catch (error) {
    console.error('Generate loyalty PIN error:', error);

    return res.status(500).json({
      message: 'Something went wrong',
    });
  }
}

async function getDashboardSummary(req, res) {
  try {
    const vendorId = req.user.id;

    // Total active loyalty programs
    const totalActiveLoyaltyPrograms = await LoyaltyProgram.count({
      where: {
        vendorId,
        status: 'active',
      },
    });

    // Total unique customers
    const totalCustomers = await UserLoyaltyProgram.count({
      distinct: true,
      col: 'userId',
      include: [
        {
          model: LoyaltyProgram,
          as: 'loyaltyProgram',
          where: {
            vendorId,
          },
          attributes: [],
        },
      ],
    });

    return res.status(200).json({
      message: 'Dashboard summary fetched successfully',

      data: {
        totalActiveLoyaltyPrograms,
        totalCustomers,

        totalRewardsRedeemed: 0,
        totalFraudAlerts: 0,
      },
    });
  } catch (error) {
    console.error('Get dashboard summary error:', error);

    return res.status(500).json({
      message: 'Something went wrong',
    });
  }
}

async function getCustomersForRedemption(req, res) {
  try {
    const { loyaltyProgramId } = req.params;

    if (!loyaltyProgramId) {
      return res.status(400).json({
        message: 'Loyalty program ID is required',
      });
    }

    const loyaltyProgram = await LoyaltyProgram.findOne({
      where: {
        id: loyaltyProgramId,
        status: 'active',
      },
    });

    if (!loyaltyProgram) {
      return res.status(404).json({
        message: 'Loyalty program not found or inactive',
      });
    }

    const customers = await UserLoyaltyProgram.findAll({
      where: {
        loyaltyProgramId: loyaltyProgram.id,
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
        },
      ],
    });

    const eligibleCustomers = customers.filter(
      (customer) => customer.obtainedStars >= loyaltyProgram.requiredStarCollection
    );

    return res.status(200).json({
      message: 'Eligible customers fetched successfully',
      data: {
        loyaltyProgramId: loyaltyProgram.id,
        programName: loyaltyProgram.programName,
        requiredStarCollection: loyaltyProgram.requiredStarCollection,
        customers: eligibleCustomers,
      },
    });
  } catch (error) {
    console.error('Get customers for redemption error:', error);

    return res.status(500).json({
      message: 'Something went wrong',
      error: error.message,
    });
  }
}
async function redeemCustomer(req, res) {
  try {
    const { loyaltyProgramId, userId } = req.body || {};

    const vendorId = req.user.id;

    if (!loyaltyProgramId) {
      return res.status(400).json({
        message: 'Loyalty program ID is required',
      });
    }

    if (!userId) {
      return res.status(400).json({
        message: 'User ID is required',
      });
    }

    const loyaltyProgram = await LoyaltyProgram.findOne({
      where: {
        id: loyaltyProgramId,
        status: 'active',
      },
    });

    if (!loyaltyProgram) {
      return res.status(404).json({
        message: 'Loyalty program not found or inactive',
      });
    }

    const userLoyaltyProgram = await UserLoyaltyProgram.findOne({
      where: {
        userId,
        loyaltyProgramId: loyaltyProgram.id,
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: [
            'id',
            'firstName',
            'lastName',
            'email',
            'phone',
          ],
        },
      ],
    });

    if (!userLoyaltyProgram) {
      return res.status(404).json({
        message: 'Customer is not enrolled in this loyalty program',
      });
    }

    if (
      userLoyaltyProgram.obtainedStars <
      loyaltyProgram.requiredStarCollection
    ) {
      return res.status(400).json({
        message: 'Customer has not earned enough stars to redeem',
        data: {
          obtainedStars: userLoyaltyProgram.obtainedStars,
          requiredStars: loyaltyProgram.requiredStarCollection,
        },
      });
    }

    const starsRedeemed = loyaltyProgram.requiredStarCollection;

    const redemption = await LoyaltyRedemption.create({
      userId,
      loyaltyProgramId: loyaltyProgram.id,
      vendorId,
      starsRedeemed,
      status: 'redeemed',
      redeemedAt: new Date(),
    });

    userLoyaltyProgram.obtainedStars -= starsRedeemed;

    await userLoyaltyProgram.save();

    return res.status(200).json({
      message: 'Customer redeemed successfully',
      data: {
        redemptionId: redemption.id,
        userId,
        customer: userLoyaltyProgram.user,
        loyaltyProgramId: loyaltyProgram.id,
        programName: loyaltyProgram.programName,
        starsRedeemed,
        remainingStars: userLoyaltyProgram.obtainedStars,
        status: redemption.status,
        redeemedAt: redemption.redeemedAt,
      },
    });
  } catch (error) {
    console.error('Customer redeem error:', error);

    return res.status(500).json({
      message: 'Something went wrong',
      error: error.message,
    });
  }
}

module.exports = {
  getVendorProfile,
  updateVendorProfile,
  changeVendorPassword,
  createLoyaltyProgram,
  getLoyaltyPrograms,
  generateLoyaltyPin,
  getDashboardSummary,
  getCustomersForRedemption,
  redeemCustomer,
};
