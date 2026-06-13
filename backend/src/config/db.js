const { Pool } = require('pg');

// If DATABASE_URL exists (like on Render), use it. Otherwise, use individual fields (local dev).
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: false,
    });

const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log('PostgreSQL connected successfully');
    client.release();
  } catch (err) {
    console.error('PostgreSQL connection failed');
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = { pool, connectDB };