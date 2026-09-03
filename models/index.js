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

const LoyaltyRedemption = require('./loyaltyRedemption')(sequelize, DataTypes);

const Notification = require('./notification')(sequelize, DataTypes);

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

User.hasMany(LoyaltyRedemption, {
  foreignKey: 'userId',
  as: 'redemptions',
});

LoyaltyRedemption.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

LoyaltyProgram.hasMany(LoyaltyRedemption, {
  foreignKey: 'loyaltyProgramId',
  as: 'redemptions',
});

LoyaltyRedemption.belongsTo(LoyaltyProgram, {
  foreignKey: 'loyaltyProgramId',
  as: 'loyaltyProgram',
});

User.hasMany(Notification, {
  foreignKey: 'userId',
  as: 'notifications',
});

Notification.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

LoyaltyProgram.hasMany(Notification, {
  foreignKey: 'loyaltyProgramId',
  as: 'notifications',
});

Notification.belongsTo(LoyaltyProgram, {
  foreignKey: 'loyaltyProgramId',
  as: 'loyaltyProgram',
});

Notification.belongsTo(User, {
  foreignKey: 'vendorId',
  as: 'vendor',
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

  LoyaltyRedemption,

  Notification,
};
