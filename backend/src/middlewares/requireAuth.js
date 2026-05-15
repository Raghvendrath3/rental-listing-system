const jwt = require('jsonwebtoken');
const AppError = require('../errors/AppErrors'); // Fix: needed to wrap JWT errors with a proper statusCode

module.exports = function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ message: 'Unauthorized: No token provided.' });
  }
  const [bearer, token] = authHeader.split(' ');
  if (!token || bearer !== 'Bearer') {
    return res.status(401).json({ message: 'Unauthorized: Invalid token format.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    next(new AppError('Unauthorized: Invalid or expired token.', 401)); // Fix: raw JWT errors have no statusCode, causing global handler to return 500 instead of 401
  }
}