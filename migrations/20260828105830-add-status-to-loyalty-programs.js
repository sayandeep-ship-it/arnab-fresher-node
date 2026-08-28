'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'LoyaltyPrograms',
      'status',
      {
        type: Sequelize.ENUM(
          'active',
          'inactive'
        ),
        allowNull: false,
        defaultValue: 'active',
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      'LoyaltyPrograms',
      'status'
    );

    // MySQL cleanup for ENUM
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS `enum_LoyaltyPrograms_status`;'
    );
  },
};