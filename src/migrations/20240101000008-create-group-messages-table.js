'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('group_messages', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      group_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'groups', key: 'id' }, onDelete: 'CASCADE',
      },
      from_user_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'users', key: 'id' }, onDelete: 'CASCADE',
      },
      type: {
        type: Sequelize.ENUM('expense', 'payment'),
        allowNull: false, defaultValue: 'expense',
      },
      description: { type: Sequelize.TEXT, allowNull: true },
      amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      currency: { type: Sequelize.STRING(10), allowNull: false, defaultValue: 'AED' },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });
  },
  async down(queryInterface) { await queryInterface.dropTable('group_messages'); },
};
