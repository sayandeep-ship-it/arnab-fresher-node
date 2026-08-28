'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'VendorProfiles',
      'profilePicture',
      {
        type: Sequelize.STRING,
        allowNull: true,
        after: 'pincode',
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn(
      'VendorProfiles',
      'profilePicture'
    );
  },
};