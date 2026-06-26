const itemService = require('../services/itemService');

const createItem = async (req, res) => {
  try {
    const item = await itemService.createItem(req.body);
    res.status(201).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to create item' });
  }
};

const getItems = async (req, res) => {
  try {
    const items = await itemService.getAllItems();
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to fetch items' });
  }
};

const getItem = async (req, res) => {
  try {
    const item = await itemService.getItemById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to fetch item' });
  }
};

const updateItem = async (req, res) => {
  try {
    const item = await itemService.updateItem(req.params.id, req.body);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to update item' });
  }
};

const deleteItem = async (req, res) => {
  try {
    const item = await itemService.deleteItem(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to delete item' });
  }
};

module.exports = {
  createItem,
  getItems,
  getItem,
  updateItem,
  deleteItem,
};
