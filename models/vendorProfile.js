'use strict';

module.exports = (sequelize, DataTypes) => {
  const VendorProfile = sequelize.define(
    'VendorProfile',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },

      streetAddress: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      city: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      country: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      state: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      pincode: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      isAddress: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      profilePicture: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: 'VendorProfiles',
      timestamps: true,
    }
  );

  return VendorProfile;
};
