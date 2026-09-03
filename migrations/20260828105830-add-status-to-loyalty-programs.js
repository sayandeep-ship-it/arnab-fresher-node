'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('LoyaltyPrograms', 'status', {
      type: Sequelize.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: 'active',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      'LoyaltyPrograms',
      'status'
    );
  },
};
