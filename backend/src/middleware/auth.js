const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'sweety_default_secret_key_change_in_production';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null;

  if (!token) {
    return res.status(401).json({ error: 'Access token required. Please log in.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired session. Please log in again.' });
    }
    req.user = decoded;
    next();
  });
}

module.exports = {
  authenticateToken,
  JWT_SECRET
};

