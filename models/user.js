const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    lastName: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },

    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    emailVerifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },

  {
    tableName: 'Users',
  }
);

User.associate = (models) => {
  User.belongsToMany(models.Role, {
    through: models.UserRole,
    foreignKey: 'userId',
    otherKey: 'roleId',
    as: 'roles',
  });
};

module.exports = User;