const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface) => {
    const hashedPassword = await bcrypt.hash('Pass@123', 10);

    await queryInterface.sequelize.query(`
      INSERT INTO users (name, email, password, color_code, is_admin, preferred_currency, created_at)
      VALUES (
        'Vengadeshwaran',
        'vengadeshwaran2061992@gmail.com',
        '${hashedPassword}',
        '#FF6B6B',
        true,
        'Indian Rupee (₹)',
        NOW()
      )
      ON CONFLICT (email)
        DO UPDATE SET is_admin = true;
    `);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('users', {
      email: 'vengadeshwaran2061992@gmail.com',
    });
  },
};
