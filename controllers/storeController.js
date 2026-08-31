const { Op } = require('sequelize');

const { User, Role, VendorProfile, LoyaltyProgram } = require('../models');

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

module.exports = {
  getStores,
  getStoreDetails,
  getLoyaltyProgramDetails,
};
