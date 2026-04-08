const { Pool } = require('pg');

// Check for Supabase connection string first (POSTGRES_URL), then fallback to individual connection parameters
const connectionString = process.env.POSTGRES_URL || 
  (process.env.DB_HOST && process.env.DB_PORT && process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_NAME
    ? `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
    : null);

const isDBConfigured = !!connectionString;

const pool = new Pool({
  connectionString: connectionString || 'postgresql://postgres:postgres@localhost:5432/rental_system',
});

const connectDB = async () => {
  if (!isDBConfigured) {
    console.warn('⚠️  Database environment variables not configured.');
    console.warn('Running in offline mode - API will work but database operations will fail.');
    return; // Don't fail startup, just warn
  }

  try {
    const client = await pool.connect();
    console.log('✓ Connected to PostgreSQL database');
    client.release();
  } catch (err) {
    console.warn('⚠️  Database connection failed');
    console.warn(`Error: ${err.message}`);
    console.warn('Running in offline mode - API will work but database operations will fail.');
    // Don't exit - allow server to start in offline mode for development
  }
};

module.exports = { pool , connectDB };
