const adminService = require('../services/adminService');

const getOverview = async (req, res) => {
  try {
    const data = await adminService.getOverview();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to fetch admin overview' });
  }
};

module.exports = { getOverview };
