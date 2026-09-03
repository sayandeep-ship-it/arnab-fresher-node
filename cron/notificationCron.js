const cron = require('node-cron');

const {
  UserLoyaltyProgram,
  LoyaltyProgram,
  Notification,
  User,
} = require('../models');

const sendRewardNotifications = async () => {
  try {
    console.log('Checking customer loyalty notifications...');

    const loyaltyCustomers = await UserLoyaltyProgram.findAll({
      include: [
        {
          model: LoyaltyProgram,
          as: 'loyaltyProgram',
          where: {
            status: 'active',
          },
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName'],
        },
      ],
    });

    for (const customer of loyaltyCustomers) {
      const loyaltyProgram = customer.loyaltyProgram;

      if (
        customer.obtainedStars !==
        loyaltyProgram.requiredStarCollection
      ) {
        continue;
      }

      const existingNotification = await Notification.findOne({
        where: {
          userId: customer.userId,
          loyaltyProgramId: loyaltyProgram.id,
          isRead: false,
        },
      });

      if (existingNotification) {
        continue;
      }

      const vendor = await User.findByPk(loyaltyProgram.vendorId, {
        attributes: ['id', 'firstName', 'lastName'],
      });

      if (!vendor) {
        continue;
      }

      const vendorName = `${vendor.firstName} ${vendor.lastName}`.trim();

      await Notification.create({
        userId: customer.userId,
        loyaltyProgramId: loyaltyProgram.id,
        vendorId: loyaltyProgram.vendorId,
        title: 'Reward Available',
        message: `You can redeem this ${loyaltyProgram.programName} now, please meet ${vendorName}`,
        isRead: false,
      });

      console.log(
        `Notification created for user ${customer.userId} - ${loyaltyProgram.programName}`
      );
    }
  } catch (error) {
    console.error('Notification cron error:', error);
  }
};

// Runs every minute
cron.schedule('*/10 * * * * *', sendRewardNotifications);

module.exports = sendRewardNotifications;