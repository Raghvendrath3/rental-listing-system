const jwt = require('jsonwebtoken');
module.exports = function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ message: 'Unauthorized: No token provided.' });
  }
  const [bearer, token] = authHeader.split(' ');
  if (!token|| bearer !== 'Bearer') {
    return res.status(401).json({ message: 'Unauthorized: Invalid token format.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    next(err);
  }
}