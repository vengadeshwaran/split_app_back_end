const db = require('../config/db');

class SettingsService {
  async getCurrency() {
    const result = await db.query("SELECT value FROM app_settings WHERE key = 'currency'");
    return result.rows[0]?.value || 'Indian Rupee (₹)';
  }

  async updateCurrency(value) {
    await db.query(
      "INSERT INTO app_settings (key, value) VALUES ('currency', $1) ON CONFLICT (key) DO UPDATE SET value = $1",
      [value]
    );
    return value;
  }
}

module.exports = new SettingsService();
