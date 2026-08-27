'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface) {
    // 1. Find vendor role
    const [roles] = await queryInterface.sequelize.query(
      `SELECT id FROM Roles WHERE name = 'vendor' LIMIT 1;`
    );

    if (!roles.length) {
      throw new Error(
        'Vendor role not found. Run role seeder first.'
      );
    }

    const vendorRoleId = roles[0].id;

    // 2. Check if vendor already exists
    const [existingUsers] =
      await queryInterface.sequelize.query(
        `SELECT id FROM Users WHERE email = 'vendor@example.com' LIMIT 1;`
      );

    if (existingUsers.length) {
      console.log('Dummy vendor already exists.');
      return;
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(
      'Vendor@123',
      12
    );

    // 4. Create vendor user
    await queryInterface.bulkInsert('Users', [
      {
        firstName: 'Dummy',
        lastName: 'Vendor',
        email: 'vendor@example.com',
        password: hashedPassword,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // 5. Get created vendor
    const [users] =
      await queryInterface.sequelize.query(
        `SELECT id FROM Users WHERE email = 'vendor@example.com' LIMIT 1;`
      );

    const vendorUserId = users[0].id;

    // 6. Assign vendor role
    await queryInterface.bulkInsert('UserRoles', [
      {
        userId: vendorUserId,
        roleId: vendorRoleId,
      },
    ]);

    // 7. Create vendor profile
    await queryInterface.bulkInsert(
      'VendorProfiles',
      [
        {
          userId: vendorUserId,

          streetAddress: null,
          city: null,
          country: null,
          state: null,
          pincode: null,

          isAddress: false,

          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]
    );
  },

  async down(queryInterface) {
    const [users] =
      await queryInterface.sequelize.query(
        `SELECT id FROM Users WHERE email = 'vendor@example.com' LIMIT 1;`
      );

    if (!users.length) {
      return;
    }

    const vendorUserId = users[0].id;

    await queryInterface.bulkDelete(
      'VendorProfiles',
      {
        userId: vendorUserId,
      }
    );

    await queryInterface.bulkDelete(
      'UserRoles',
      {
        userId: vendorUserId,
      }
    );

    await queryInterface.bulkDelete(
      'Users',
      {
        id: vendorUserId,
      }
    );
  },
};