module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_friends', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      friend_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addConstraint('user_friends', {
      fields: ['user_id', 'friend_id'],
      type: 'unique',
      name: 'unique_friendship',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('user_friends');
  },
};
