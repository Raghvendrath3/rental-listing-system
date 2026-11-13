const { Pool } = require('pg');
const { AsyncLocalStorage } = require('async_hooks');

const dbContext = new AsyncLocalStorage();
const poolOptions = {
  max: Number(process.env.DB_POOL_MAX) || 10,
  idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS) || 30000,
  connectionTimeoutMillis: Number(process.env.DB_CONNECTION_TIMEOUT_MS) || 5000,
  maxUses: Number(process.env.DB_MAX_USES) || 7500
};

// If DATABASE_URL exists (like on Render), use it. Otherwise, use individual fields (local dev).
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      ...poolOptions,
    })
  : new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: false,
      ...poolOptions,
    });

pool.on('error', error => {
  console.error('[db-pool] idle client error', { code: error.code || 'unknown' });
});

function getDbContext() {
  const context = dbContext.getStore();
  return {
    userId: context && context.userId != null ? String(context.userId) : '0',
    userRole: context && context.userRole ? context.userRole : 'anonymous'
  };
}

function getPoolMetrics() {
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount
  };
}

function getQueryLabel(text) {
  const operation = String(text).trim().match(/^(SELECT|INSERT|UPDATE|DELETE|WITH|BEGIN|COMMIT|ROLLBACK)\b/i);
  const relation = String(text).match(/\b(?:FROM|INTO|UPDATE|JOIN)\s+["']?([a-zA-Z_][\w.]*)/i);
  return [operation ? operation[1].toUpperCase() : 'QUERY', relation ? relation[1] : null]
    .filter(Boolean)
    .join(' ');
}

function logSlowConnectionAcquisition(durationMs) {
  const context = dbContext.getStore();
  if (context && context.timings) {
    context.timings.connectionAcquisitionMs += durationMs;
  }
  if (durationMs <= 200) return;
  console.warn('[slow-db-acquire]', JSON.stringify({
    requestId: context?.requestId || null,
    durationMs: Number(durationMs.toFixed(1))
  }));
}

async function executeQuery(client, text, values, connectionAcquisitionMs = 0) {
  const startedAt = process.hrtime.bigint();
  try {
    return await client.query(text, values);
  } finally {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
    const context = dbContext.getStore();
    if (context && context.timings) {
      context.timings.queryExecutionMs += durationMs;
    }
    const queryLabel = getQueryLabel(text);
    const requestId = context?.requestId || null;
    if (durationMs > 200) {
      console.warn('[slow-db-query]', JSON.stringify({
        requestId,
        operation: queryLabel,
        durationMs: Number(durationMs.toFixed(1)),
        connectionAcquisitionMs: Number(connectionAcquisitionMs.toFixed(1)),
        filterMetadata: {
          hasWhereClause: /\bWHERE\b/i.test(String(text)),
          bindParameterCount: Array.isArray(values) ? values.length : 0,
          usesSubstringSearch: /\bILIKE\b/i.test(String(text))
        }
      }));
    }
  }
}

function withDbContext(context, callback) {
  const current = dbContext.getStore() || {};
  return dbContext.run({
    userId: context.userId !== undefined ? context.userId : current.userId,
    userRole: context.userRole || current.userRole || 'anonymous',
    requestId: context.requestId !== undefined ? context.requestId : current.requestId,
    timings: context.timings !== undefined ? context.timings : current.timings
  }, callback);
}

async function setTransactionContext(client) {
  const { userId, userRole } = getDbContext();
  await executeQuery(client,
    `SELECT set_config('app.user_id', $1, true),
            set_config('app.user_role', $2, true)`,
    [userId, userRole]
  );
}

async function query(text, values) {
  const acquisitionStartedAt = process.hrtime.bigint();
  const client = await pool.connect();
  const connectionAcquisitionMs = Number(process.hrtime.bigint() - acquisitionStartedAt) / 1e6;
  logSlowConnectionAcquisition(connectionAcquisitionMs);
  try {
    await executeQuery(client, 'BEGIN');
    await setTransactionContext(client);
    const result = await executeQuery(client, text, values, connectionAcquisitionMs);
    await executeQuery(client, 'COMMIT');
    return result;
  } catch (error) {
    await executeQuery(client, 'ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function withTransaction(callback) {
  const acquisitionStartedAt = process.hrtime.bigint();
  const client = await pool.connect();
  const connectionAcquisitionMs = Number(process.hrtime.bigint() - acquisitionStartedAt) / 1e6;
  logSlowConnectionAcquisition(connectionAcquisitionMs);
  try {
    await executeQuery(client, 'BEGIN');
    await setTransactionContext(client);
    const transactionClient = {
      query: (text, values) => executeQuery(client, text, values, connectionAcquisitionMs)
    };
    const result = await callback(transactionClient);
    await executeQuery(client, 'COMMIT');
    return result;
  } catch (error) {
    await executeQuery(client, 'ROLLBACK');
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
  getPoolMetrics,
  connectDB,
  query,
  withTransaction,
  withDbContext,
  setTransactionContext,
  dbContext
};