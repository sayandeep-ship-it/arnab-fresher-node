const { Op } = require('sequelize');

const { User, Role, VendorProfile, LoyaltyProgram, LoyaltyScan, UserLoyaltyProgram } = require('../models');

async function getStores(req, res) {
  try {
    let { page = 1, limit = 10, search = '' } = req.query;

    page = Number(page);
    limit = Number(limit);

    // Validate page
    if (!Number.isInteger(page) || page < 1) {
      page = 1;
    }

    // Validate limit
    if (!Number.isInteger(limit) || limit < 1) {
      limit = 10;
    }

    // Maximum 100 records per request
    if (limit > 100) {
      limit = 100;
    }

    const offset = (page - 1) * limit;

    search = String(search || '').trim();

    const userWhere = {};

    if (search) {
      userWhere[Op.or] = [
        {
          firstName: {
            [Op.like]: `%${search}%`,
          },
        },
        {
          lastName: {
            [Op.like]: `%${search}%`,
          },
        },
      ];
    }

    const vendorRole = await Role.findOne({
      where: {
        name: 'vendor',
      },
    });

    if (!vendorRole) {
      return res.status(500).json({
        message: 'Vendor role not found',
      });
    }

    const { count, rows } = await User.findAndCountAll({
      where: userWhere,

      attributes: ['id', 'firstName', 'lastName'],

      include: [
        {
          model: Role,

          as: 'roles',

          where: {
            id: vendorRole.id,
          },

          attributes: [],

          through: {
            attributes: [],
          },
        },

        {
          model: VendorProfile,

          as: 'vendorProfile',

          where: {
            isAddress: true,
          },

          attributes: ['id', 'profilePicture', 'streetAddress', 'city', 'state', 'country', 'pincode'],
        },

        {
          model: LoyaltyProgram,

          as: 'loyaltyPrograms',

          required: false,

          attributes: [
            'id',
            'image',
            'programName',
            'requiredStarCollection',
            'qrCodeScanIntervalValue',
            'qrCodeScanIntervalUnit',
            'programRules',
            'enablePinVerification',
            'createdAt',
          ],

          separate: true,

          order: [['createdAt', 'DESC']],
        },
      ],

      distinct: true,

      order: [['id', 'DESC']],

      limit,

      offset,
    });

    const stores = rows.map((vendor) => {
      const profile = vendor.vendorProfile;

      const vendorName = `${vendor.firstName || ''} ${vendor.lastName || ''}`.trim();

      return {
        id: vendor.id,

        name: vendorName,

        profilePicture: profile?.profilePicture || null,

        address: {
          streetAddress: profile?.streetAddress || null,

          city: profile?.city || null,

          state: profile?.state || null,

          country: profile?.country || null,

          pincode: profile?.pincode || null,
        },

        loyaltyPrograms: vendor.loyaltyPrograms || [],
      };
    });

    return res.status(200).json({
      message: 'Stores fetched successfully',

      pagination: {
        currentPage: page,

        limit: limit,

        totalStores: count,

        totalPages: Math.ceil(count / limit),
      },

      stores,
    });
  } catch (error) {
    console.error('Get stores error:', error);

    return res.status(500).json({
      message: 'Something went wrong',
    });
  }
}

async function getStoreDetails(req, res) {
  try {
    const { vendorId } = req.params;

    if (!vendorId) {
      return res.status(400).json({
        message: 'Vendor ID is required',
      });
    }

    const vendor = await User.findOne({
      where: {
        id: vendorId,
      },

      attributes: ['id', 'firstName', 'lastName', 'phone'],

      include: [
        {
          model: Role,
          as: 'roles',

          where: {
            name: 'vendor',
          },

          attributes: [],

          through: {
            attributes: [],
          },
        },

        {
          model: VendorProfile,
          as: 'vendorProfile',

          where: {
            isAddress: true,
          },

          attributes: ['id', 'profilePicture', 'streetAddress', 'city', 'state', 'country', 'pincode'],
        },

        {
          model: LoyaltyProgram,
          as: 'loyaltyPrograms',

          required: false,

          attributes: [
            'id',
            'image',
            'programName',
            'requiredStarCollection',
            'qrCodeScanIntervalValue',
            'qrCodeScanIntervalUnit',
            'programRules',
            'enablePinVerification',
            'createdAt',
          ],

          separate: true,

          order: [['createdAt', 'DESC']],
        },
      ],
    });

    if (!vendor) {
      return res.status(404).json({
        message: 'Store not found',
      });
    }

    const profile = vendor.vendorProfile;

    const vendorName = `${vendor.firstName || ''} ${vendor.lastName || ''}`.trim();

    return res.status(200).json({
      message: 'Store details fetched successfully',

      store: {
        id: vendor.id,

        name: vendorName,

        phone: vendor.phone || null,

        profilePicture: profile?.profilePicture || null,

        address: {
          streetAddress: profile?.streetAddress || null,

          city: profile?.city || null,

          state: profile?.state || null,

          country: profile?.country || null,

          pincode: profile?.pincode || null,
        },

        loyaltyPrograms: vendor.loyaltyPrograms || [],
      },
    });
  } catch (error) {
    console.error('Get store details error:', error);

    return res.status(500).json({
      message: 'Something went wrong',
    });
  }
}

async function getLoyaltyProgramDetails(req, res) {
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
      },

      attributes: [
        'id',
        'vendorId',
        'image',
        'programName',
        'requiredStarCollection',
        'qrCodeScanIntervalValue',
        'qrCodeScanIntervalUnit',
        'programRules',
        'enablePinVerification',
        'createdAt',
        'updatedAt',
      ],

      include: [
        {
          model: User,
          as: 'vendor',

          attributes: ['id', 'firstName', 'lastName', 'phone'],

          include: [
            {
              model: VendorProfile,
              as: 'vendorProfile',

              attributes: ['profilePicture', 'streetAddress', 'city', 'state', 'country', 'pincode'],
            },
          ],
        },
      ],
    });

    if (!loyaltyProgram) {
      return res.status(404).json({
        message: 'Loyalty program not found',
      });
    }

    const vendor = loyaltyProgram.vendor;

    const vendorProfile = vendor?.vendorProfile;

    return res.status(200).json({
      message: 'Loyalty program details fetched successfully',

      loyaltyProgram: {
        id: loyaltyProgram.id,

        image: loyaltyProgram.image,

        programName: loyaltyProgram.programName,

        requiredStarCollection: loyaltyProgram.requiredStarCollection,

        qrCodeScanIntervalValue: loyaltyProgram.qrCodeScanIntervalValue,

        qrCodeScanIntervalUnit: loyaltyProgram.qrCodeScanIntervalUnit,

        programRules: loyaltyProgram.programRules,

        enablePinVerification: loyaltyProgram.enablePinVerification,

        createdAt: loyaltyProgram.createdAt,

        updatedAt: loyaltyProgram.updatedAt,

        vendor: {
          id: vendor?.id,

          name: `${vendor?.firstName || ''} ${vendor?.lastName || ''}`.trim(),

          phone: vendor?.phone || null,

          profilePicture: vendorProfile?.profilePicture || null,

          address: {
            streetAddress: vendorProfile?.streetAddress || null,

            city: vendorProfile?.city || null,

            state: vendorProfile?.state || null,

            country: vendorProfile?.country || null,

            pincode: vendorProfile?.pincode || null,
          },
        },
      },
    });
  } catch (error) {
    console.error('Get loyalty program details error:', error);

    return res.status(500).json({
      message: 'Something went wrong',
    });
  }
}

async function getDashboardMetrics(req, res) {
  try {
    const userId = req.user.id;

    const userLoyaltyPrograms = await UserLoyaltyProgram.findAll({
      where: {
        userId,
      },

      include: [
        {
          model: LoyaltyProgram,
          as: 'loyaltyProgram',
          attributes: [
            'id',
            'requiredStarCollection',
            'status',
          ],
        },
      ],

      attributes: [
        'id',
        'userId',
        'loyaltyProgramId',
        'obtainedStars',
      ],
    });

    let totalStarsCollected = 0;
    let activeLoyaltyPrograms = 0;
    let rewardsEarned = 0;

    for (const record of userLoyaltyPrograms) {
      const obtainedStars = Number(
        record.obtainedStars || 0
      );

      const requiredStars = Number(
        record.loyaltyProgram?.requiredStarCollection || 0
      );

      // Total stars collected by customer
      totalStarsCollected += obtainedStars;

      // Active loyalty programs in which customer participated
      if (
        record.loyaltyProgram &&
        record.loyaltyProgram.status === 'active'
      ) {
        activeLoyaltyPrograms++;
      }

      // Rewards earned from this loyalty program
      if (requiredStars > 0) {
        rewardsEarned += Math.floor(
          obtainedStars / requiredStars
        );
      }
    }

    return res.status(200).json({
      message: 'Dashboard metrics fetched successfully',

      data: {
        totalStarsCollected,
        rewardsEarned,
        activeLoyaltyPrograms,
        pendingRewards: 0,
      },
    });
  } catch (error) {
    console.error(
      'Get dashboard metrics error:',
      error
    );

    return res.status(500).json({
      message: 'Something went wrong',
    });
  }
}

async function getDashboardStores(req, res) {
  try {
    const userId = req.user.id;

    const vendors = await User.findAll({
      attributes: [
        'id',
        'firstName',
        'lastName',
      ],

      include: [
        {
          model: Role,
          as: 'roles',

          where: {
            name: 'vendor',
          },

          attributes: [],

          through: {
            attributes: [],
          },
        },

        {
          model: VendorProfile,
          as: 'vendorProfile',

          where: {
            isAddress: true,
          },

          attributes: [
            'id',
            'profilePicture',
            'streetAddress',
            'city',
            'state',
            'country',
            'pincode',
          ],
        },

        {
          model: LoyaltyProgram,
          as: 'loyaltyPrograms',

          where: {
            status: 'active',
          },

          required: false,

          attributes: [
            'id',
            'image',
            'programName',
            'requiredStarCollection',
            'qrCodeScanIntervalValue',
            'qrCodeScanIntervalUnit',
            'programRules',
            'enablePinVerification',
            'status',
            'createdAt',
          ],

          include: [
            {
              model: UserLoyaltyProgram,
              as: 'customers',

              where: {
                userId,
              },

              required: false,

              attributes: [
                'id',
                'userId',
                'loyaltyProgramId',
                'obtainedStars',
              ],
            },
          ],
        },
      ],

      order: [['id', 'DESC']],
    });

    const stores = vendors.map((vendor) => {
      const profile = vendor.vendorProfile;

      const vendorName =
        `${vendor.firstName || ''} ${vendor.lastName || ''}`.trim();

      const loyaltyPrograms =
        (vendor.loyaltyPrograms || []).map((program) => {
          const customerRecord =
            program.customers?.[0];

          return {
            id: program.id,

            image: program.image,

            programName: program.programName,

            requiredStarCollection:
              program.requiredStarCollection,

            obtainedStars:
              customerRecord?.obtainedStars || 0,

            qrCodeScanIntervalValue:
              program.qrCodeScanIntervalValue,

            qrCodeScanIntervalUnit:
              program.qrCodeScanIntervalUnit,

            programRules: program.programRules,

            enablePinVerification:
              program.enablePinVerification,

            status: program.status,

            createdAt: program.createdAt,
          };
        });

      return {
        id: vendor.id,

        name: vendorName,

        profilePicture:
          profile?.profilePicture || null,

        address: {
          streetAddress:
            profile?.streetAddress || null,

          city:
            profile?.city || null,

          state:
            profile?.state || null,

          country:
            profile?.country || null,

          pincode:
            profile?.pincode || null,
        },

        loyaltyPrograms,
      };
    });

    return res.status(200).json({
      message: 'Dashboard stores fetched successfully',

      stores,
    });
  } catch (error) {
    console.error(
      'Get dashboard stores error:',
      error
    );

    return res.status(500).json({
      message: 'Something went wrong',
    });
  }
}

async function scanLoyaltyProgram(req, res) {
  try {
    const { qrCodeToken } = req.params;

    // Customer ID comes from JWT
    const userId = req.user.id;

    if (!qrCodeToken) {
      return res.status(400).json({
        message: 'QR code token is required',
      });
    }

    // Find active loyalty program
    const loyaltyProgram = await LoyaltyProgram.findOne({
      where: {
        qrCodeToken,
        status: 'active',
      },
    });

    if (!loyaltyProgram) {
      return res.status(404).json({
        message: 'Loyalty program not found or inactive',
      });
    }

    if (!loyaltyProgram.enablePinVerification) {
      let userLoyaltyProgram = await UserLoyaltyProgram.findOne({
        where: {
          userId,
          loyaltyProgramId: loyaltyProgram.id,
        },
      });

      // Customer is not enrolled yet
      if (!userLoyaltyProgram) {
        userLoyaltyProgram = await UserLoyaltyProgram.create({
          userId,
          loyaltyProgramId: loyaltyProgram.id,
          obtainedStars: 1,
        });
      } else {
        // Customer already enrolled
        userLoyaltyProgram.obtainedStars += 1;

        await userLoyaltyProgram.save();
      }

      return res.status(200).json({
        message: 'Star added successfully',

        pinRequired: false,

        starAdded: true,

        obtainedStars: userLoyaltyProgram.obtainedStars,

        requiredStars: loyaltyProgram.requiredStarCollection,

        loyaltyProgram: {
          id: loyaltyProgram.id,

          programName: loyaltyProgram.programName,
        },
      });
    }

    const loyaltyScan = await LoyaltyScan.create({
      loyaltyProgramId: loyaltyProgram.id,

      userId,

      pin: null,

      pinGeneratedAt: null,

      pinExpiresAt: null,

      verifiedAt: null,

      starAdded: false,
    });

    return res.status(200).json({
      message: 'PIN verification required',

      pinRequired: true,

      starAdded: false,

      scanId: loyaltyScan.id,

      loyaltyProgram: {
        id: loyaltyProgram.id,

        programName: loyaltyProgram.programName,

        requiredStarCollection: loyaltyProgram.requiredStarCollection,
      },
    });
  } catch (error) {
    console.error('Scan loyalty program error:', error);

    return res.status(500).json({
      message: 'Something went wrong',
    });
  }
}

async function verifyLoyaltyPin(req, res) {
  try {
    const { scanId } = req.params;
    const { pin } = req.body || {};

    // Customer ID comes from JWT
    const userId = req.user.id;

    // Validate scanId
    if (!scanId) {
      return res.status(400).json({
        message: 'Scan ID is required',
      });
    }

    // Validate PIN
    if (!pin) {
      return res.status(400).json({
        message: 'PIN is required',
      });
    }

    const enteredPin = String(pin).trim();

    if (!/^\d{3}$/.test(enteredPin)) {
      return res.status(400).json({
        message: 'PIN must be exactly 3 digits',
      });
    }

    // Find customer's loyalty scan
    const loyaltyScan = await LoyaltyScan.findOne({
      where: {
        id: scanId,
        userId,
      },
    });

    if (!loyaltyScan) {
      return res.status(404).json({
        message: 'Loyalty scan not found',
      });
    }

    // Check whether PIN was generated
    if (!loyaltyScan.pin) {
      return res.status(400).json({
        message: 'PIN has not been generated yet',
      });
    }

    // Check whether this scan was already completed
    if (loyaltyScan.starAdded) {
      return res.status(400).json({
        message: 'Star has already been added for this scan',
      });
    }

    // Check PIN expiry
    if (
      loyaltyScan.pinExpiresAt &&
      new Date() > new Date(loyaltyScan.pinExpiresAt)
    ) {
      return res.status(400).json({
        message: 'PIN has expired',
      });
    }

    // Verify PIN
    if (enteredPin !== loyaltyScan.pin) {
      return res.status(400).json({
        message: 'Invalid PIN',
      });
    }

    // Find the loyalty program
    const loyaltyProgram = await LoyaltyProgram.findOne({
      where: {
        id: loyaltyScan.loyaltyProgramId,
        status: 'active',
      },
    });

    if (!loyaltyProgram) {
      return res.status(404).json({
        message: 'Loyalty program not found or inactive',
      });
    }

    // Find user's loyalty program record
    let userLoyaltyProgram = await UserLoyaltyProgram.findOne({
      where: {
        userId,
        loyaltyProgramId: loyaltyProgram.id,
      },
    });

    // If user has not enrolled yet, create record
    if (!userLoyaltyProgram) {
      userLoyaltyProgram = await UserLoyaltyProgram.create({
        userId,
        loyaltyProgramId: loyaltyProgram.id,
        obtainedStars: 0,
      });
    }

    // Add one star
    userLoyaltyProgram.obtainedStars += 1;

    await userLoyaltyProgram.save();

    // Mark scan as completed
    loyaltyScan.verifiedAt = new Date();
    loyaltyScan.starAdded = true;

    await loyaltyScan.save();

    return res.status(200).json({
      message: 'PIN verified and star added successfully',

      pinRequired: true,

      starAdded: true,

      data: {
        scanId: loyaltyScan.id,

        loyaltyProgramId: loyaltyProgram.id,

        userId,

        obtainedStars: userLoyaltyProgram.obtainedStars,
      },
    });
  } catch (error) {
    console.error('Verify loyalty PIN error:', error);

    return res.status(500).json({
      message: 'Something went wrong',
    });
  }
}

module.exports = {
  getStores,
  getStoreDetails,
  getLoyaltyProgramDetails,
  scanLoyaltyProgram,
  verifyLoyaltyPin,
  getDashboardMetrics,
  getDashboardStores,
};
