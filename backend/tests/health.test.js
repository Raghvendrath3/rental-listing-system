require('dotenv').config();
const request = require('supertest');
const app = require('../src/app');
const { pool } = require('../src/config/db');

const originalHealthDetails = process.env.HEALTH_DETAILS;

describe('Health endpoints', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    process.env.HEALTH_DETAILS = 'true';
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(() => {
    if (originalHealthDetails === undefined) {
      delete process.env.HEALTH_DETAILS;
    } else {
      process.env.HEALTH_DETAILS = originalHealthDetails;
    }
  });

  test('full health returns a detailed report when the database is healthy', async () => {
    const query = jest.spyOn(pool, 'query').mockResolvedValue({ rows: [{ '?column?': 1 }] });
    const response = await request(app).get('/api/v1/health');

    expect(response.statusCode).toBe(200);
    expect(response.headers['cache-control']).toBe('no-store');
    expect(query).toHaveBeenCalledWith('SELECT 1');
    expect(response.body).toMatchObject({
      status: 'ok',
      service: {
        name: 'rentalhub-api',
        version: expect.any(String),
        environment: expect.any(String)
      },
      uptime: { seconds: expect.any(Number), human: expect.any(String) },
      checks: {
        database: {
          status: 'up',
          latencyMs: expect.any(Number),
          pool: {
            total: expect.any(Number),
            idle: expect.any(Number),
            waiting: expect.any(Number)
          }
        }
      },
      system: {
        memory: {
          rssMb: expect.any(Number),
          heapUsedMb: expect.any(Number),
          heapTotalMb: expect.any(Number)
        },
        nodeVersion: expect.any(String)
      }
    });
    expect(response.body.service).toHaveProperty('commit');
    expect(response.body.service.commit === null || typeof response.body.service.commit === 'string').toBe(true);
    expect(Number.isNaN(Date.parse(response.body.timestamp))).toBe(false);
  });

  test('database failure returns 503 without leaking error details', async () => {
    jest.spyOn(pool, 'query').mockRejectedValue(
      new Error('password=secret postgres://private-host/production')
    );
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const response = await request(app).get('/api/v1/health');
    const body = JSON.stringify(response.body);

    expect(response.statusCode).toBe(503);
    expect(response.body.status).toBe('down');
    expect(response.body.checks.database.error).toBe('Database check failed');
    expect(body).not.toContain('secret');
    expect(body).not.toContain('private-host');
  });

  test('a hanging database check times out and returns 503', async () => {
    jest.spyOn(pool, 'query').mockImplementation(() => new Promise(() => {}));
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const response = await request(app).get('/api/v1/health');

    expect(response.statusCode).toBe(503);
    expect(response.body.status).toBe('down');
    expect(response.body.checks.database.error).toBe('Database check failed');
  });

  test('liveness does not query PostgreSQL', async () => {
    const query = jest.spyOn(pool, 'query').mockRejectedValue(new Error('database unavailable'));

    const response = await request(app).get('/api/v1/health/live');

    expect(response.statusCode).toBe(200);
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.body.status).toBe('ok');
    expect(query).not.toHaveBeenCalled();
  });

  test('health details can be disabled without changing the status code', async () => {
    process.env.HEALTH_DETAILS = 'false';
    jest.spyOn(pool, 'query').mockResolvedValue({ rows: [{ '?column?': 1 }] });

    const response = await request(app).get('/api/v1/health');

    expect(response.statusCode).toBe(200);
    expect(Object.keys(response.body).sort()).toEqual(['status', 'timestamp', 'uptime']);
    expect(response.body.uptime).toMatchObject({
      seconds: expect.any(Number),
      human: expect.any(String)
    });
  });
});
