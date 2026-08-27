const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const User = require('./user');
const Otp = require('./otp');

const Role = require('./role')(sequelize, DataTypes);

const UserRole = require('./userRole')(
  sequelize,
  DataTypes
);

const VendorProfile = require('./vendorProfile')(
  sequelize,
  DataTypes
);

User.hasMany(Otp, {
  foreignKey: 'userId',
});

Otp.belongsTo(User, {
  foreignKey: 'userId',
});

// User ↔ Role
User.belongsToMany(Role, {
  through: UserRole,
  foreignKey: 'userId',
  otherKey: 'roleId',
  as: 'roles',
});

Role.belongsToMany(User, {
  through: UserRole,
  foreignKey: 'roleId',
  otherKey: 'userId',
  as: 'users',
});

// User ↔ VendorProfile
User.hasOne(VendorProfile, {
  foreignKey: 'userId',
  as: 'vendorProfile',
});

VendorProfile.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});


UserRole.belongsTo(Role, {
  foreignKey: 'roleId',
});

Role.hasMany(UserRole, {
  foreignKey: 'roleId',
});

UserRole.belongsTo(User, {
  foreignKey: 'userId',
});

User.hasMany(UserRole, {
  foreignKey: 'userId',
});


module.exports = {
  sequelize,
  User,
  Otp,
  Role,
  UserRole,
  VendorProfile,
};