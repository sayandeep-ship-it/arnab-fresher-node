'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UserLoyaltyPrograms', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      loyaltyProgramId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'LoyaltyPrograms',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      obtainedStars: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
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

    await queryInterface.addConstraint(
      'UserLoyaltyPrograms',
      {
        fields: ['userId', 'loyaltyProgramId'],
        type: 'unique',
        name: 'unique_user_loyalty_program',
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('UserLoyaltyPrograms');
  },
};
