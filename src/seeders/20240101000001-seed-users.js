const bcrypt = require('bcrypt');

const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];

module.exports = {
  up: async (queryInterface) => {
    const hashedPassword = await bcrypt.hash('password123', 10);

    await queryInterface.bulkInsert('users', [
      { id: 1, name: 'X', email: 'x@example.com', password: hashedPassword, color_code: colors[0], created_at: new Date() },
      { id: 2, name: 'A', email: 'a@example.com', password: hashedPassword, color_code: colors[1], created_at: new Date() },
      { id: 3, name: 'B', email: 'b@example.com', password: hashedPassword, color_code: colors[2], created_at: new Date() },
      { id: 4, name: 'C', email: 'c@example.com', password: hashedPassword, color_code: colors[3], created_at: new Date() },
      { id: 5, name: 'D', email: 'd@example.com', password: hashedPassword, color_code: colors[4], created_at: new Date() },
    ]);

    // Reset sequence so new inserts don't conflict with seeded IDs
    await queryInterface.sequelize.query(
      "SELECT setval(pg_get_serial_sequence('users', 'id'), MAX(id)) FROM users;"
    );
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('users', null, {
      truncate: true,
      restartIdentity: true,
      cascade: true,
    });
  },
};
