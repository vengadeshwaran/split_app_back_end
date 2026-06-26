'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('group_members', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      group_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'groups', key: 'id' }, onDelete: 'CASCADE',
      },
      user_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'users', key: 'id' }, onDelete: 'CASCADE',
      },
      joined_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });
    await queryInterface.addConstraint('group_members', {
      fields: ['group_id', 'user_id'], type: 'unique', name: 'unique_group_member',
    });
  },
  async down(queryInterface) { await queryInterface.dropTable('group_members'); },
};
