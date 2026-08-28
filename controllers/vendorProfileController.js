const bcrypt = require('bcryptjs');

const {
  User,
  VendorProfile,
} = require('../models');


// =====================================================
// GET VENDOR PROFILE
// =====================================================

async function getVendorProfile(req, res) {
  try {
    // Vendor ID comes from JWT
    const vendorId = req.user.id;

    // Find vendor
    const user = await User.findByPk(
      vendorId,
      {
        attributes: [
          'id',
          'firstName',
          'lastName',
          'email',
          'phone',
        ],

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
      }
    );

    if (!user) {
      return res.status(404).json({
        message: 'Vendor not found',
      });
    }

    return res.status(200).json({
      message:
        'Vendor profile fetched successfully',

      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
      },

      vendorProfile:
        user.vendorProfile || null,
    });

  } catch (error) {
    console.error(
      'Get vendor profile error:',
      error
    );

    return res.status(500).json({
      message:
        'Something went wrong',
    });
  }
}


// =====================================================
// UPDATE VENDOR PROFILE
// =====================================================

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


    // =================================================
    // FIND VENDOR
    // =================================================

    const user = await User.findByPk(
      vendorId
    );

    if (!user) {
      return res.status(404).json({
        message:
          'Vendor not found',
      });
    }


    // =================================================
    // FIND OR CREATE VENDOR PROFILE
    // =================================================

    let vendorProfile =
      await VendorProfile.findOne({
        where: {
          userId: vendorId,
        },
      });

    if (!vendorProfile) {
      vendorProfile =
        await VendorProfile.create({
          userId: vendorId,
          isAddress: false,
        });
    }


    // =================================================
    // UPDATE FIRST NAME
    // =================================================

    if (
      firstName !== undefined
    ) {
      const trimmedFirstName =
        String(firstName).trim();

      if (!trimmedFirstName) {
        return res.status(400).json({
          message:
            'First name cannot be empty',
        });
      }

      user.firstName =
        trimmedFirstName;
    }


    // =================================================
    // UPDATE LAST NAME
    // =================================================

    if (
      lastName !== undefined
    ) {
      user.lastName =
        String(lastName).trim();
    }


    // =================================================
    // UPDATE PHONE
    // =================================================

    if (
      phone !== undefined
    ) {
      const trimmedPhone =
        String(phone).trim();

      user.phone =
        trimmedPhone || null;
    }


    // =================================================
    // EMAIL
    // =================================================

    /*
     * Email intentionally cannot be changed
     * from this API.
     *
     * Even if frontend sends:
     *
     * {
     *   email: "new@email.com"
     * }
     *
     * it will simply be ignored.
     */


    // =================================================
    // UPDATE PROFILE PICTURE
    // =================================================

    if (req.file) {
      vendorProfile.profilePicture =
        `/uploads/vendor/${req.file.filename}`;
    }


    // =================================================
    // UPDATE STREET ADDRESS
    // =================================================

    if (
      streetAddress !== undefined
    ) {
      vendorProfile.streetAddress =
        String(streetAddress).trim() || null;
    }


    // =================================================
    // UPDATE CITY
    // =================================================

    if (
      city !== undefined
    ) {
      vendorProfile.city =
        String(city).trim() || null;
    }


    // =================================================
    // UPDATE STATE
    // =================================================

    if (
      state !== undefined
    ) {
      vendorProfile.state =
        String(state).trim() || null;
    }


    // =================================================
    // UPDATE COUNTRY
    // =================================================

    if (
      country !== undefined
    ) {
      vendorProfile.country =
        String(country).trim() || null;
    }


    // =================================================
    // UPDATE PINCODE
    // =================================================

    if (
      pincode !== undefined
    ) {
      vendorProfile.pincode =
        String(pincode).trim() || null;
    }


    // =================================================
    // ADDRESS STATUS
    // =================================================

    /*
     * Check the FINAL address values after
     * applying the requested changes.
     *
     * This is important because profile updates
     * are partial.
     */

    const addressComplete =
      Boolean(
        vendorProfile.streetAddress &&
        vendorProfile.city &&
        vendorProfile.state &&
        vendorProfile.country &&
        vendorProfile.pincode
      );

    vendorProfile.isAddress =
      addressComplete;


    // =================================================
    // SAVE USER
    // =================================================

    await user.save();


    // =================================================
    // SAVE VENDOR PROFILE
    // =================================================

    await vendorProfile.save();


    // =================================================
    // RESPONSE
    // =================================================

    return res.status(200).json({
      message:
        'Vendor profile updated successfully',

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
        profilePicture:
          vendorProfile.profilePicture,

        streetAddress:
          vendorProfile.streetAddress,

        city:
          vendorProfile.city,

        state:
          vendorProfile.state,

        country:
          vendorProfile.country,

        pincode:
          vendorProfile.pincode,

        isAddress:
          vendorProfile.isAddress,
      },
    });

  } catch (error) {
    console.error(
      'Update vendor profile error:',
      error
    );

    return res.status(500).json({
      message:
        'Something went wrong',
    });
  }
}


// =====================================================
// CHANGE VENDOR PASSWORD
// =====================================================

async function changeVendorPassword(req, res) {
  try {
    // Vendor ID comes from JWT
    const vendorId = req.user.id;

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
      newPassword !== confirmPassword
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
    // FIND VENDOR
    // =================================================

    const user =
      await User.findByPk(
        vendorId
      );

    if (!user) {
      return res.status(404).json({
        message:
          'Vendor not found',
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
    // CHECK SAME PASSWORD
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

    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        12
      );


    // =================================================
    // UPDATE PASSWORD
    // =================================================

    user.password =
      hashedPassword;

    await user.save();


    // =================================================
    // RESPONSE
    // =================================================

    return res.status(200).json({
      message:
        'Password changed successfully',
    });

  } catch (error) {
    console.error(
      'Change vendor password error:',
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
  getVendorProfile,
  updateVendorProfile,
  changeVendorPassword,
};