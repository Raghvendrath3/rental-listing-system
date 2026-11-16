const packageInfo = require('../../package.json');
const { getPoolMetrics, pool } = require('../config/db');

const DATABASE_TIMEOUT_MS = 2000;
const DEGRADED_LATENCY_MS = 500;

function withTimeout(promise, timeoutMs) {
  let timeout;
  const timeoutPromise = new Promise((_, reject) => {
    timeout = setTimeout(() => reject(new Error('Dependency check timed out')), timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeout));
}

function getPoolStatus() {
  const metrics = getPoolMetrics();
  return {
    total: metrics.totalCount,
    idle: metrics.idleCount,
    waiting: metrics.waitingCount
  };
}

function getLatencyMs(startedAt) {
  return Number((Number(process.hrtime.bigint() - startedAt) / 1e6).toFixed(1));
}

async function checkDatabase() {
  const startedAt = process.hrtime.bigint();
  try {
    await withTimeout(pool.query('SELECT 1'), DATABASE_TIMEOUT_MS);
    return {
      status: 'up',
      latencyMs: getLatencyMs(startedAt),
      pool: getPoolStatus()
    };
  } catch (error) {
    console.error('[health] database check failed', error);
    return {
      status: 'down',
      latencyMs: getLatencyMs(startedAt),
      pool: getPoolStatus(),
      error: 'Database check failed'
    };
  }
}

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${days}d ${hours}h ${minutes}m`;
}

function getServiceMetadata() {
  return {
    name: 'rentalhub-api',
    version: process.env.APP_VERSION || process.env.npm_package_version || packageInfo.version,
    environment: process.env.NODE_ENV || 'development',
    commit: process.env.GIT_SHA || process.env.RENDER_GIT_COMMIT || process.env.COMMIT_SHA || null
  };
}

async function buildHealthReport() {
  const database = await checkDatabase();
  const status = database.status === 'down'
    ? 'down'
    : database.latencyMs > DEGRADED_LATENCY_MS ? 'degraded' : 'ok';
  const memory = process.memoryUsage();

  return {
    status,
    timestamp: new Date().toISOString(),
    service: getServiceMetadata(),
    uptime: {
      seconds: process.uptime(),
      human: formatUptime(process.uptime())
    },
    checks: {
      database: {
        status: database.status,
        latencyMs: database.latencyMs,
        pool: database.pool,
        ...(database.error ? { error: database.error } : {})
      }
    },
    system: {
      memory: {
        rssMb: Number((memory.rss / 1024 / 1024).toFixed(1)),
        heapUsedMb: Number((memory.heapUsed / 1024 / 1024).toFixed(1)),
        heapTotalMb: Number((memory.heapTotal / 1024 / 1024).toFixed(1))
      },
      nodeVersion: process.version
    }
  };
}

module.exports = { buildHealthReport, checkDatabase, formatUptime };
