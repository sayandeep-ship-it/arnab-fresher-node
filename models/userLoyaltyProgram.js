module.exports = (sequelize, DataTypes) => {
  const UserLoyaltyProgram = sequelize.define(
    'UserLoyaltyProgram',
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

      obtainedStars: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      tableName: 'UserLoyaltyPrograms',
      timestamps: true,
    }
  );

  return UserLoyaltyProgram;
};