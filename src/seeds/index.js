const db = require('../config/db');
const bcrypt = require('bcrypt');

const generateRandomColor = () => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#AB63FA'];
  return colors[Math.floor(Math.random() * colors.length)];
};

const createTablesOnly = async () => {
  try {
    console.log('Creating items table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT
      )
    `);

    console.log('Creating users table...');
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

    console.log('Creating friends table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS friends (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        friend_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, friend_id)
      )
    `);

    console.log('✓ All tables created');
  } catch (error) {
    console.error('✗ Failed to create tables', error);
    throw error;
  }
};

const seedItemsData = async () => {
  try {
    console.log('Seeding items data...');
    await db.query('TRUNCATE TABLE items RESTART IDENTITY');

    const items = [
      { name: 'First item', description: 'This is the first seeded item.' },
      { name: 'Second item', description: 'This is the second seeded item.' },
      { name: 'Third item', description: 'This is the third seeded item.' },
    ];

    for (const item of items) {
      await db.query(
        'INSERT INTO items(name, description) VALUES($1, $2)',
        [item.name, item.description]
      );
    }

    console.log('✓ Items data seeded');
  } catch (error) {
    console.error('✗ Failed to seed items data', error);
    throw error;
  }
};

const seedUsersData = async () => {
  try {
    console.log('Seeding users data...');

    const sampleUsers = [
      { fullName: 'John Doe', email: 'john@example.com', password: 'password123' },
      { fullName: 'Jane Smith', email: 'jane@example.com', password: 'password123' },
      { fullName: 'Bob Johnson', email: 'bob@example.com', password: 'password123' },
    ];

    for (const user of sampleUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const colorCode = generateRandomColor();

      await db.query(
        'INSERT INTO users(full_name, email, password, color_code) VALUES($1, $2, $3, $4) ON CONFLICT(email) DO NOTHING',
        [user.fullName, user.email, hashedPassword, colorCode]
      );
    }

    console.log('✓ Users data seeded');
  } catch (error) {
    console.error('✗ Failed to seed users data', error);
    throw error;
  }
};

const runCommonSeed = async () => {
  try {
    await db.query('BEGIN');
    await createTablesOnly();
    await seedItemsData();
    await seedUsersData();
    await db.query('COMMIT');
    console.log('\n✓ Common seed completed successfully');
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('\n✗ Common seed failed', error);
    process.exit(1);
  } finally {
    db.end();
  }
};

const runSpecificSeed = async (seedName) => {
  try {
    await db.query('BEGIN');
    
    if (seedName === 'items') {
      await seedItemsData();
    } else if (seedName === 'users') {
      await seedUsersData();
    } else {
      console.error(`✗ Unknown seed: ${seedName}`);
      console.log('Available seeds: items, users');
      process.exit(1);
    }

    await db.query('COMMIT');
    console.log(`\n✓ ${seedName} seed completed successfully`);
  } catch (error) {
    await db.query('ROLLBACK');
    console.error(`\n✗ ${seedName} seed failed`, error);
    process.exit(1);
  } finally {
    db.end();
  }
};

const seedArg = process.argv[2];

if (seedArg) {
  runSpecificSeed(seedArg);
} else {
  runCommonSeed();
}
