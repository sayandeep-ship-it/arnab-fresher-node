module.exports = (sequelize, DataTypes) => {
  const LoyaltyScan = sequelize.define(
    'LoyaltyScan',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      loyaltyProgramId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      pin: {
        type: DataTypes.STRING(3),
        allowNull: true,
      },

      pinGeneratedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      pinExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      verifiedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      starAdded: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      tableName: 'LoyaltyScans',
      timestamps: true,
    }
  );

  return LoyaltyScan;
};