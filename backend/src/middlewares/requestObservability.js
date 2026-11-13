const crypto = require('crypto');

const SLOW_REQUEST_MS = 500;
const REQUEST_ID_PATTERN = /^[a-zA-Z0-9._:-]{1,128}$/;

module.exports = function requestObservability(req, res, next) {
  const incomingRequestId = req.get('x-request-id');
  const requestId = incomingRequestId && REQUEST_ID_PATTERN.test(incomingRequestId)
    ? incomingRequestId
    : crypto.randomUUID();
  const startedAt = process.hrtime.bigint();
  req.dbTimings = { connectionAcquisitionMs: 0, queryExecutionMs: 0 };

  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);

  const setServerTiming = () => {
    if (res.headersSent) return;
    const headerDurationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
    const timings = req.dbTimings;
    res.setHeader('Server-Timing', [
      `db-acquire;dur=${timings.connectionAcquisitionMs.toFixed(1)}`,
      `db-query;dur=${timings.queryExecutionMs.toFixed(1)}`,
      `app;dur=${headerDurationMs.toFixed(1)}`
    ].join(', '));
  };
  const originalWriteHead = res.writeHead;
  res.writeHead = function (...args) {
    setServerTiming();
    return originalWriteHead.apply(this, args);
  };

  const originalEnd = res.end;
  res.end = function (...args) {
    setServerTiming();
    return originalEnd.apply(this, args);
  };

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
    if (durationMs <= SLOW_REQUEST_MS) return;

    const route = req.route
      ? `${req.baseUrl || ''}${req.route.path}`
      : 'unmatched';
    console.warn('[slow-http-request]', JSON.stringify({
      requestId,
      method: req.method,
      route,
      statusCode: res.statusCode,
      durationMs: Number(durationMs.toFixed(1))
    }));
  });

  next();
};
