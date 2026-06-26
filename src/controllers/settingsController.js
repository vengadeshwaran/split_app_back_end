const settingsService = require('../services/settingsService');
const { CURRENCY_LIST } = require('../constants/currencies');

class SettingsController {
  async getCurrency(req, res, next) {
    try {
      const value = await settingsService.getCurrency();
      res.json({ currency: value });
    } catch (err) { next(err); }
  }

  async updateCurrency(req, res, next) {
    try {
      const { currency } = req.body;
      if (!currency) return res.status(400).json({ error: 'currency is required' });
      if (!CURRENCY_LIST.includes(currency)) {
        return res.status(400).json({ error: 'Invalid currency value' });
      }
      const value = await settingsService.updateCurrency(currency);
      res.json({ currency: value });
    } catch (err) { next(err); }
  }
}

module.exports = new SettingsController();
