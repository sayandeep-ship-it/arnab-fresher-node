'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'LoyaltyPrograms',
      'qrCodePath',
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn(
      'LoyaltyPrograms',
      'qrCodePath'
    );
  },
};
