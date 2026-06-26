const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const verifyAdmin = async (req, res, next) => {
  try {
    const db = require('../config/db');
    const result = await db.query('SELECT is_admin FROM users WHERE id = $1', [req.user.userId]);
    if (!result.rows[0]?.is_admin) {
      return res.status(403).json({ error: 'Forbidden: admin access required' });
    }
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { verifyToken, verifyAdmin };
