require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: Number(process.env.PGPORT) || 5432,
});

const drop = async () => {
  const sql = `
    DROP TABLE IF EXISTS user_friends CASCADE;
    DROP TABLE IF EXISTS friends CASCADE;
    DROP TABLE IF EXISTS items CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
    DROP TABLE IF EXISTS "SequelizeMeta" CASCADE;
  `;
  await pool.query(sql);
  console.log('All old tables dropped successfully');
  await pool.end();
};

drop().catch((err) => {
  console.error('Failed to drop tables:', err.message);
  process.exit(1);
});
