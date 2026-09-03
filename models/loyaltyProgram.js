module.exports = (sequelize, DataTypes) => {
  const LoyaltyProgram = sequelize.define(
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
      qrCodeToken: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        unique: true,
      },

      qrCodePath: {
        type: DataTypes.STRING,
        allowNull: true,
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

      status: {
        type: DataTypes.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active',
      },
    },
    {
      tableName: 'LoyaltyPrograms',
      timestamps: true,
    }
  );

  return LoyaltyProgram;
};
