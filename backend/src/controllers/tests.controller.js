const appError = require('../errors/AppErrors');

// A test controller to intentionally throw an error for testing purposes
const throwTestError = (req, res, next) => {
  next(new appError("Intentional test failure", 400));
};

module.exports = { throwTestError };