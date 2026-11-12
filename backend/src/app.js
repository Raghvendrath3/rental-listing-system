const express = require("express");
const healthRoutes = require("./routes/healths.routes");
const testRoutes = require('./routes/tests.routes');

const cors = require('cors');
const initializeDbContext = require('./middlewares/dbContext');

const app = express();

// global middleware
app.use(express.json());
const allowedOrigins = new Set(
  [
    ...(process.env.CORS_ORIGINS || '').split(','),
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ]
    .map(origin => origin && origin.trim())
    .filter(Boolean)
);
const corsOptions = {
  origin(origin, callback) {
    callback(null, !origin || allowedOrigins.has(origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(initializeDbContext);

// routes
app.use("/api/v1/health", healthRoutes);

app.use('/api/v1/test', testRoutes);

app.use('/api/v1/listings', require('./routes/listings.routes'));

app.use('/api/v1/auth', require('./routes/users.routes'));

app.use('/api/v1/admin', require('./routes/admin.routes'));

app.use('/api/v1/owner', require('./routes/owner.routes'));

app.use('/api/v1/inquiries', require('./routes/inquiries.routes'));

// Production-ready centralized error handler
app.use((err, req, res, next) => {
  // 1. Prevent app crash if headers are already sent to the client
  if (res.headersSent) {
    return next(err);
  }

  // 2. Set default status and determine environment
  const statusCode = err.statusCode || 500;
  const isSafeClientError = err.isOperational && statusCode >= 400 && statusCode < 500;
  if (!isSafeClientError) {
    console.error(`[Error] ${req.method} ${req.url} - Status: ${statusCode}`, err);
  }

  res.status(statusCode).json({
    status: "error",
    statusCode,
    message: isSafeClientError ? err.message : "Internal server error"
  });
});



module.exports = app;
