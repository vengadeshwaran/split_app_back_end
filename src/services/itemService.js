const db = require('../config/db');

const createItem = async ({ name, description }) => {
  const result = await db.query(
    'INSERT INTO items(name, description) VALUES($1, $2) RETURNING *',
    [name, description]
  );
  return result.rows[0];
};

const getAllItems = async () => {
  const result = await db.query('SELECT * FROM items ORDER BY id');
  return result.rows;
};

const getItemById = async (id) => {
  const result = await db.query('SELECT * FROM items WHERE id = $1', [id]);
  return result.rows[0];
};

const updateItem = async (id, { name, description }) => {
  const result = await db.query(
    'UPDATE items SET name = $1, description = $2 WHERE id = $3 RETURNING *',
    [name, description, id]
  );
  return result.rows[0];
};

const deleteItem = async (id) => {
  const result = await db.query('DELETE FROM items WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
};

module.exports = {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
};
