module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define(
    'Notification',
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

      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },

      isRead: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      tableName: 'Notifications',
      timestamps: true,
    }
  );

  return Notification;
};