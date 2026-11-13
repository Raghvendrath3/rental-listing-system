const jwt = require('jsonwebtoken');
const AppError = require('../errors/AppErrors'); // Fix: needed to wrap JWT errors with a proper statusCode
const { dbContext } = require('../config/db');
const { SESSION_COOKIE } = require('../config/authCookies');

module.exports = function requireAuth(req, res, next) {
  try {
    const token = req.cookies && req.cookies[SESSION_COOKIE];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: No session cookie.' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!Number.isInteger(decoded.id) || !['user', 'owner', 'admin'].includes(decoded.role)) {
      throw new Error('Invalid session claims');
    }
    req.user = decoded;
    const context = dbContext.getStore();
    if (context) {
      context.userId = decoded.id;
      context.userRole = decoded.role;
    }
    next();
  } catch (err) {
    next(new AppError('Unauthorized: Invalid or expired token.', 401)); // Fix: raw JWT errors have no statusCode, causing global handler to return 500 instead of 401
  }
}