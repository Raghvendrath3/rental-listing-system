const express = require("express");
const healthRoutes = require("./routes/health.routes");

const app = express();

// global middleware
app.use(express.json());

const testRoutes = require('./routes/test.routes');
// routes
app.use("/health", healthRoutes);

app.use('/test', testRoutes);

app.use('/listings', require('./routes/listing.routes'));

// fallback error handler (basic for now)
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    status: "error",
    message: err.message || "Internal Server Error"
  });
});


module.exports = app;
