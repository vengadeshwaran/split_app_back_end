'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('group_message_settlements', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      message_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'group_messages', key: 'id' }, onDelete: 'CASCADE',
      },
      user_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'users', key: 'id' }, onDelete: 'CASCADE',
      },
      settled_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });
    await queryInterface.addConstraint('group_message_settlements', {
      fields: ['message_id', 'user_id'], type: 'unique', name: 'unique_message_user_settlement',
    });
  },
  async down(queryInterface) { await queryInterface.dropTable('group_message_settlements'); },
};
