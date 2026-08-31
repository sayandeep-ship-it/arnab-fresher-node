module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'LoyaltyPrograms',
      'qrCodeToken',
      {
        type: Sequelize.UUID,
        allowNull: true,
        unique: true,
      }
    );

    const [programs] = await queryInterface.sequelize.query(
      'SELECT id FROM LoyaltyPrograms'
    );

    for (const program of programs) {
      await queryInterface.sequelize.query(
        `UPDATE LoyaltyPrograms
         SET qrCodeToken = UUID()
         WHERE id = :id`,
        {
          replacements: {
            id: program.id,
          },
        }
      );
    }

    await queryInterface.changeColumn(
      'LoyaltyPrograms',
      'qrCodeToken',
      {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn(
      'LoyaltyPrograms',
      'qrCodeToken'
    );
  },
};
