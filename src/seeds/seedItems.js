const db = require('../config/db');

const seedItems = async () => {
  try {
    await db.query('BEGIN');

    await db.query(`
      CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT
      )
    `);

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

    await db.query('COMMIT');
    console.log('Seed completed');
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Seed failed', error);
    process.exit(1);
  } finally {
    db.end();
  }
};

seedItems();
