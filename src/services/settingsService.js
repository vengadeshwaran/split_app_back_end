const db = require('../config/db');

class SettingsService {
  async getCurrency(userId) {
    const result = await db.query('SELECT preferred_currency FROM users WHERE id = $1', [userId]);
    return result.rows[0]?.preferred_currency || 'Indian Rupee (₹)';
  }

  async updateCurrency(userId, value) {
    await db.query('UPDATE users SET preferred_currency = $1 WHERE id = $2', [value, userId]);
    return value;
  }
}

module.exports = new SettingsService();
