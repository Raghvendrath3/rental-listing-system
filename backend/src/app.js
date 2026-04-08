const express = require("express");
const healthRoutes = require("./routes/healths.routes");
const testRoutes = require('./routes/tests.routes');
const adminRoutes = require('./routes/admin.routes');

const cors = require('cors');

const app = express();

// global middleware
app.use(express.json());
app.use(cors());

// routes
app.use("/health", healthRoutes);

app.use('/test', testRoutes);

app.use('/listings', require('./routes/listings.routes'));

app.use('/users', require('./routes/users.routes'));

app.use('/owner-requests', require('./routes/ownerRequests.routes'));

app.use('/admin', adminRoutes);

// fallback error handler (basic for now)
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    status: "error",
    message: err.message || "Internal Server Error"
  });
});


module.exports = app;
