'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'LoyaltyPrograms',
      'pin',
      {
        type: Sequelize.STRING(3),
        allowNull: true,
      }
    );

    await queryInterface.addColumn(
      'LoyaltyPrograms',
      'pinGeneratedAt',
      {
        type: Sequelize.DATE,
        allowNull: true,
      }
    );

    await queryInterface.addColumn(
      'LoyaltyPrograms',
      'pinExpiresAt',
      {
        type: Sequelize.DATE,
        allowNull: true,
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn(
      'LoyaltyPrograms',
      'pin'
    );

    await queryInterface.removeColumn(
      'LoyaltyPrograms',
      'pinGeneratedAt'
    );

    await queryInterface.removeColumn(
      'LoyaltyPrograms',
      'pinExpiresAt'
    );
  },
};