module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDesc = await queryInterface.describeTable('users');

    if (!tableDesc.is_admin) {
      await queryInterface.addColumn('users', 'is_admin', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
    }

    if (!tableDesc.preferred_currency) {
      await queryInterface.addColumn('users', 'preferred_currency', {
        type: Sequelize.STRING(50),
        allowNull: true,
        defaultValue: 'Indian Rupee (₹)',
      });
    }
  },

  down: async (queryInterface) => {
    const tableDesc = await queryInterface.describeTable('users');
    if (tableDesc.is_admin) await queryInterface.removeColumn('users', 'is_admin');
    if (tableDesc.preferred_currency) await queryInterface.removeColumn('users', 'preferred_currency');
  },
};
