module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('user_friends', [
      { user_id: 1, friend_id: 2, created_at: new Date() },
      { user_id: 1, friend_id: 3, created_at: new Date() },
      { user_id: 1, friend_id: 4, created_at: new Date() },
      { user_id: 1, friend_id: 5, created_at: new Date() },
    ]);

    // Reset sequence so new inserts don't conflict with seeded IDs
    await queryInterface.sequelize.query(
      "SELECT setval(pg_get_serial_sequence('user_friends', 'id'), MAX(id)) FROM user_friends;"
    );
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('user_friends', null, {
      truncate: true,
      restartIdentity: true,
      cascade: true,
    });
  },
};
