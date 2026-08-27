'use strict';

module.exports = {
  async up(queryInterface) {
    const roles = [
      'superadmin',
      'vendor',
      'user',
    ];

    for (const roleName of roles) {
      const [existingRoles] =
        await queryInterface.sequelize.query(
          `SELECT id FROM Roles WHERE name = :name LIMIT 1`,
          {
            replacements: {
              name: roleName,
            },
          }
        );

      if (existingRoles.length === 0) {
        await queryInterface.bulkInsert('Roles', [
          {
            name: roleName,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]);
      }
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Roles', {
      name: [
        'superadmin',
        'vendor',
        'user',
      ],
    });
  },
};