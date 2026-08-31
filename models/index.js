const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const User = require('./user');

const Otp = require('./otp');

const Role = require('./role')(sequelize, DataTypes);

const UserRole = require('./userRole')(sequelize, DataTypes);

const VendorProfile = require('./vendorProfile')(sequelize, DataTypes);

const LoyaltyProgram = require('./loyaltyProgram')(sequelize, DataTypes);

const LoyaltyScan = require('./loyaltyScan')(sequelize, DataTypes);

const UserLoyaltyProgram = require('./userLoyaltyProgram')(sequelize, DataTypes);

User.hasMany(Otp, {
  foreignKey: 'userId',
});

Otp.belongsTo(User, {
  foreignKey: 'userId',
});

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

User.hasOne(VendorProfile, {
  foreignKey: 'userId',
  as: 'vendorProfile',
});

VendorProfile.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

User.hasMany(LoyaltyProgram, {
  foreignKey: 'vendorId',
  as: 'loyaltyPrograms',
});

LoyaltyProgram.belongsTo(User, {
  foreignKey: 'vendorId',
  as: 'vendor',
});

User.hasMany(LoyaltyScan, {
  foreignKey: 'userId',
  as: 'loyaltyScans',
});

LoyaltyScan.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

LoyaltyProgram.hasMany(LoyaltyScan, {
  foreignKey: 'loyaltyProgramId',
  as: 'loyaltyScans',
});

LoyaltyScan.belongsTo(LoyaltyProgram, {
  foreignKey: 'loyaltyProgramId',
  as: 'loyaltyProgram',
});
User.hasMany(UserLoyaltyProgram, {
  foreignKey: 'userId',
  as: 'userLoyaltyPrograms',
});

UserLoyaltyProgram.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});
LoyaltyProgram.hasMany(UserLoyaltyProgram, {
  foreignKey: 'loyaltyProgramId',
  as: 'customers',
});

UserLoyaltyProgram.belongsTo(LoyaltyProgram, {
  foreignKey: 'loyaltyProgramId',
  as: 'loyaltyProgram',
});

module.exports = {
  sequelize,

  User,

  Otp,

  Role,

  UserRole,

  VendorProfile,

  LoyaltyProgram,

  LoyaltyScan,

  UserLoyaltyProgram,
};
