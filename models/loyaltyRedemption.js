module.exports = (sequelize, DataTypes) => {
  const LoyaltyRedemption = sequelize.define(
    'LoyaltyRedemption',
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

      loyaltyProgramId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      vendorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      starsRedeemed: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      status: {
        type: DataTypes.ENUM('in_progress', 'redeemed'),
        allowNull: false,
        defaultValue: 'redeemed',
      },

      redeemedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: 'LoyaltyRedemptions',
      timestamps: true,
    }
  );

  return LoyaltyRedemption;
};