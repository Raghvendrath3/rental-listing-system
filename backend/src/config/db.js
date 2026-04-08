const { Pool } = require('pg');

// Build connection string from environment variables
// Priority: POSTGRES_URL (Supabase) > individual parameters > default
const connectionString = process.env.POSTGRES_URL || 
  (process.env.DB_HOST && process.env.DB_PORT && process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_NAME
    ? `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
    : 'postgresql://postgres:postgres@localhost:5432/rental_system');

const pool = new Pool({
  connectionString,
});

const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log('✓ Database connection established');
    client.release();
  } catch (err) {
    // Silently fail - the pool will attempt to reconnect when needed
    // This allows development without a database
  }
};

module.exports = { pool , connectDB };
