const { Pool } = require('pg');

// Check if database environment variables are configured
const isDBConfigured = 
  process.env.DB_HOST && 
  process.env.DB_PORT && 
  process.env.DB_USER && 
  process.env.DB_PASSWORD && 
  process.env.DB_NAME;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'rental_system',
});

const connectDB = async () => {
  if (!isDBConfigured) {
    console.warn('⚠️  Database environment variables not configured.');
    console.warn('Set DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, and DB_NAME to connect to PostgreSQL.');
    console.warn('Running in offline mode - API will work but database operations will fail.');
    return; // Don't fail startup, just warn
  }

  try {
    const client = await pool.connect();
    console.log('✓ PostgreSQL connected successfully');
    client.release();
  } catch (err) {
    console.warn('⚠️  PostgreSQL connection failed');
    console.warn(`Error: ${err.message}`);
    console.warn('Running in offline mode - API will work but database operations will fail.');
    console.warn('To enable database features, configure environment variables: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME');
    // Don't exit - allow server to start in offline mode for development
  }
};

module.exports = { pool , connectDB };
