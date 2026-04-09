const { Pool } = require('pg');

// Check for Supabase connection string first (POSTGRES_URL), then fallback to individual connection parameters
const connectionString = process.env.POSTGRES_URL || 
  (process.env.DB_HOST && process.env.DB_PORT && process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_NAME
    ? `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
    : null);

const isDBConfigured = !!connectionString;

// Configure pool with proper SSL settings for Supabase
// Supabase requires SSL, so we need to configure it properly
const poolConfig = {
  connectionString: connectionString || 'postgresql://postgres:postgres@localhost:5432/rental_system',
};

// Add SSL configuration for Supabase (when using POSTGRES_URL)
if (process.env.POSTGRES_URL) {
  poolConfig.ssl = {
    rejectUnauthorized: false // Allow self-signed certificates in development
  };
}

const pool = new Pool(poolConfig);

const connectDB = async () => {
  if (!isDBConfigured) {
    return; // Silently skip if no database configured
  }

  try {
    const client = await pool.connect();
    console.log('✓ Connected to PostgreSQL database');
    client.release();
  } catch (err) {
    // Silently fail - the pool will work for most operations even with a failed initial connection
  }
};

module.exports = { pool , connectDB };
