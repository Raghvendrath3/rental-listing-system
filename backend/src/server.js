require('dotenv').config(); // Must be first — db.js reads process.env at import time
const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 3000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();