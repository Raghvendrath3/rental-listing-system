const appError = require("../errors/appErrors");

const throwTestError = (req, res, next) => {
  next(new appError("Intentional test failure", 400));
};

module.exports = { throwTestError };