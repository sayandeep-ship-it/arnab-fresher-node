const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Otp = sequelize.define(
  'Otp',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    otp: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },

    type: {
      type: DataTypes.ENUM('EMAIL_VERIFICATION', 'PASSWORD_RESET'),

      allowNull: false,
    },

    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    verifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },

  {
    tableName: 'Otps',
  }
);

module.exports = Otp;
