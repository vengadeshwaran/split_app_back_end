const db = require('../config/db');

const seedUsers = async () => {
  try {
    await db.query('BEGIN');

    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        color_code TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query('COMMIT');
    console.log('Users table created successfully');
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Failed to create users table', error);
    process.exit(1);
  } finally {
    db.end();
  }
};

seedUsers();
