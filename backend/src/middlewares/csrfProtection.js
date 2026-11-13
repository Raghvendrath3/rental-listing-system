const AppError = require('../errors/AppErrors');

module.exports = function csrfProtection(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const origin = req.get('Origin');
  if (origin && !req.app.locals.allowedOrigins.has(origin)) {
    return next(new AppError('Origin not allowed', 403));
  }
  if (origin && req.get('X-Requested-With') !== 'XMLHttpRequest') {
    return next(new AppError('CSRF validation failed', 403));
  }
  if (req.cookies && req.cookies.rental_session && req.get('Sec-Fetch-Site') === 'cross-site') {
    return next(new AppError('Cross-site request denied', 403));
  }

  next();
};
