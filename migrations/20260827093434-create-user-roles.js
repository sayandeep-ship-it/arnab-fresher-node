'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UserRoles', {
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

      roleId: {
        type: Sequelize.INTEGER,
        allowNull: false,

        references: {
          model: 'Roles',
          key: 'id',
        },

        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
    });

    await queryInterface.addConstraint('UserRoles', {
      fields: ['userId', 'roleId'],
      type: 'unique',
      name: 'unique_user_role',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('UserRoles');
  },
};
