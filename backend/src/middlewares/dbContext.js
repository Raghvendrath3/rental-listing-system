const { dbContext } = require('../config/db');

module.exports = function initializeDbContext(req, res, next) {
  dbContext.run({
    userId: null,
    userRole: 'anonymous',
    requestId: req.requestId,
    timings: req.dbTimings
  }, next);
};
