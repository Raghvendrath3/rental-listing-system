const { Pool } = require('pg');
const { AsyncLocalStorage } = require('async_hooks');

const dbContext = new AsyncLocalStorage();

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

function getDbContext() {
  const context = dbContext.getStore();
  return {
    userId: context && context.userId != null ? String(context.userId) : '0',
    userRole: context && context.userRole ? context.userRole : 'anonymous'
  };
}

function withDbContext(context, callback) {
  const current = dbContext.getStore() || {};
  return dbContext.run({
    userId: context.userId !== undefined ? context.userId : current.userId,
    userRole: context.userRole || current.userRole || 'anonymous'
  }, callback);
}

async function setTransactionContext(client) {
  const { userId, userRole } = getDbContext();
  await client.query(
    `SELECT set_config('app.user_id', $1, true),
            set_config('app.user_role', $2, true)`,
    [userId, userRole]
  );
}

async function query(text, values) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await setTransactionContext(client);
    const result = await client.query(text, values);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function withTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await setTransactionContext(client);
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

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

module.exports = {
  pool,
  connectDB,
  query,
  withTransaction,
  withDbContext,
  setTransactionContext,
  dbContext
};