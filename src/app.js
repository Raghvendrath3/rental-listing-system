const express = require("express");
const healthRoutes = require("./routes/health.routes");

const app = express();

// global middleware
app.use(express.json());

// routes
app.use("/health", healthRoutes);

// fallback error handler (basic for now)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    status: "error",
    message: "Internal Server Error"
  });
});

module.exports = app;
