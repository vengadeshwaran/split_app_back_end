'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('group_expense_splits', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      message_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'group_messages', key: 'id' }, onDelete: 'CASCADE',
      },
      user_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'users', key: 'id' }, onDelete: 'CASCADE',
      },
      amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
    });
    await queryInterface.addConstraint('group_expense_splits', {
      fields: ['message_id', 'user_id'],
      type: 'unique',
      name: 'unique_expense_split',
    });
  },
  async down(queryInterface) { await queryInterface.dropTable('group_expense_splits'); },
};
