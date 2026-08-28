const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');


// =====================================================
// MODELS
// =====================================================

const User = require('./user');

const Otp = require('./otp');

const Role = require('./role')(
  sequelize,
  DataTypes
);

const UserRole = require('./userRole')(
  sequelize,
  DataTypes
);

const VendorProfile = require('./vendorProfile')(
  sequelize,
  DataTypes
);

const LoyaltyProgram =
  require('./loyaltyProgram')(
    sequelize,
    DataTypes
  );


// =====================================================
// USER ↔ OTP
// =====================================================

User.hasMany(Otp, {
  foreignKey: 'userId',
});

Otp.belongsTo(User, {
  foreignKey: 'userId',
});


// =====================================================
// USER ↔ ROLE
// =====================================================

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


// =====================================================
// USER ↔ USER ROLE
// =====================================================

User.hasMany(UserRole, {
  foreignKey: 'userId',
});

UserRole.belongsTo(User, {
  foreignKey: 'userId',
});

Role.hasMany(UserRole, {
  foreignKey: 'roleId',
});

UserRole.belongsTo(Role, {
  foreignKey: 'roleId',
});


// =====================================================
// USER ↔ VENDOR PROFILE
// =====================================================

User.hasOne(VendorProfile, {
  foreignKey: 'userId',
  as: 'vendorProfile',
});

VendorProfile.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});


// =====================================================
// VENDOR ↔ LOYALTY PROGRAM
// =====================================================

User.hasMany(LoyaltyProgram, {
  foreignKey: 'vendorId',
  as: 'loyaltyPrograms',
});

LoyaltyProgram.belongsTo(User, {
  foreignKey: 'vendorId',
  as: 'vendor',
});


// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  sequelize,

  User,

  Otp,

  Role,

  UserRole,

  VendorProfile,

  LoyaltyProgram,
};