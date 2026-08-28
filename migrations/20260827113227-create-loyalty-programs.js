'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'LoyaltyPrograms',
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },

        vendorId: {
          type: Sequelize.INTEGER,
          allowNull: false,

          references: {
            model: 'Users',
            key: 'id',
          },

          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },

        image: {
          type: Sequelize.STRING,
          allowNull: true,
        },

        programName: {
          type: Sequelize.STRING,
          allowNull: false,
        },

        requiredStarCollection: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },

        qrCodeScanIntervalValue: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },

        qrCodeScanIntervalUnit: {
          type: Sequelize.STRING,
          allowNull: true,
        },

        programRules: {
          type: Sequelize.TEXT,
          allowNull: true,
        },

        enablePinVerification: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },

        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal(
            'CURRENT_TIMESTAMP'
          ),
        },

        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal(
            'CURRENT_TIMESTAMP'
          ),
        },
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable(
      'LoyaltyPrograms'
    );
  },
};