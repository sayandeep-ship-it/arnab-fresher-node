const bcrypt = require('bcryptjs');

const { User, VendorProfile } = require('../models');

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

module.exports = {
  getVendorProfile,
  updateVendorProfile,
  changeVendorPassword,
};
