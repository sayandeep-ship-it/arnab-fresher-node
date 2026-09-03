'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('LoyaltyRedemptions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      loyaltyProgramId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      vendorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      starsRedeemed: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      status: {
        type: Sequelize.ENUM('in_progress', 'redeemed'),
        allowNull: false,
        defaultValue: 'redeemed',
      },

      redeemedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('LoyaltyRedemptions');
  },
};