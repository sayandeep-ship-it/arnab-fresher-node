module.exports = (sequelize, DataTypes) => {
  const LoyaltyProgram =
    sequelize.define(
      'LoyaltyProgram',
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },

        vendorId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },

        image: {
          type: DataTypes.STRING,
          allowNull: true,
        },

        programName: {
          type: DataTypes.STRING,
          allowNull: false,
        },

        requiredStarCollection: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },

        qrCodeScanIntervalValue: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },

        qrCodeScanIntervalUnit: {
          type: DataTypes.STRING,
          allowNull: true,
        },

        programRules: {
          type: DataTypes.TEXT,
          allowNull: true,
        },

        enablePinVerification: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
      },
      {
        tableName: 'LoyaltyPrograms',
      }
    );

  return LoyaltyProgram;
};