const {
  buildHealthReport,
  checkDatabase,
  formatUptime
} = require('../services/health.service');

const getLiveness = (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
};

const getReadiness = async (req, res) => {
  const database = await checkDatabase();
  const status = database.status === 'down'
    ? 'down'
    : database.latencyMs > 500 ? 'degraded' : 'ok';

  res.status(status === 'down' ? 503 : 200).json({
    status,
    timestamp: new Date().toISOString()
  });
};

const getHealth = async (req, res) => {
  const report = await buildHealthReport();
  const statusCode = report.status === 'down' ? 503 : 200;
  const detailsEnabled = String(process.env.HEALTH_DETAILS).toLowerCase() !== 'false';

  if (!detailsEnabled) {
    return res.status(statusCode).json({
      status: report.status,
      timestamp: report.timestamp,
      uptime: {
        seconds: report.uptime.seconds,
        human: formatUptime(report.uptime.seconds)
      }
    });
  }

  res.status(statusCode).json(report);
};

module.exports = { getHealth, getLiveness, getReadiness };
