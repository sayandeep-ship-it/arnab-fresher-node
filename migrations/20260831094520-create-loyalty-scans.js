module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('LoyaltyScans', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
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

      pin: {
        type: Sequelize.STRING(3),
        allowNull: true,
      },

      pinGeneratedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      pinExpiresAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      verifiedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      starAdded: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
    await queryInterface.dropTable('LoyaltyScans');
  },
};
