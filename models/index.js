const sequelize = require('../config/database');

const User = require('./user');
const Otp = require('./otp');

User.hasMany(Otp, {
  foreignKey: 'userId',
});

Otp.belongsTo(User, {
  foreignKey: 'userId',
});

module.exports = {
  sequelize,
  User,
  Otp,
};