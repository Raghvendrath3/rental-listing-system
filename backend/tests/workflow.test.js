require('dotenv').config();

const request = require('supertest');
const app = require('../src/app');
const { connectDB, pool } = require('../src/config/db');

let userToken;
let adminToken;
let listingId;
let requestId;

// -------------------------------------------------------------------
// Isolated credentials — NOT shared with api.test.js
// These users are created fresh in beforeAll and deleted in afterAll,
// so this suite runs correctly regardless of suite execution order.
// -------------------------------------------------------------------
const WORKFLOW_USER  = { email: 'wf_user_jest@example.com',  password: 'WfUser@123' };
const WORKFLOW_ADMIN = { email: 'wf_admin_jest@example.com', password: 'WfAdmin@123' };

beforeAll(async () => {
  await connectDB();

  const bcrypt = require('bcrypt');
  const adminHash = await bcrypt.hash(WORKFLOW_ADMIN.password, 12);

  // Clean up any leftover data from a previously interrupted run
  await pool.query(
    `DELETE FROM listings
     WHERE owner_id IN (SELECT id FROM users WHERE email LIKE 'wf_%_jest@example.com')`
  );
  await pool.query(
    `DELETE FROM owner_requests
     WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'wf_%_jest@example.com')`
  );
  await pool.query(
    `DELETE FROM users WHERE email LIKE 'wf_%_jest@example.com'`
  );

  // Create the workflow user via the public register endpoint
  // (validates the signup flow works as a side-effect)
  const signupRes = await request(app)
    .post('/api/v1/auth/register')
    .send(WORKFLOW_USER);

  if (signupRes.statusCode !== 201) {
    throw new Error(
      `beforeAll: failed to register workflow user — got ${signupRes.statusCode}: ${JSON.stringify(signupRes.body)}`
    );
  }

  // Seed admin directly — role can't be set via the public API
  await pool.query(
    `INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'admin')`,
    [WORKFLOW_ADMIN.email, adminHash]
  );
});

afterAll(async () => {
  try {
    // FK order: listings → owner_requests → users
    await pool.query(`DELETE FROM listings       WHERE owner_id IN (SELECT id FROM users WHERE email LIKE 'wf_%_jest@example.com')`);
    await pool.query(`DELETE FROM owner_requests WHERE user_id  IN (SELECT id FROM users WHERE email LIKE 'wf_%_jest@example.com')`);
    await pool.query(`DELETE FROM users          WHERE email    LIKE 'wf_%_jest@example.com'`);
  } catch (err) {
    console.error('Clean up failed in workflow.test.js:', err.message);
  } finally {
    // Shutdown the connection pool for this specific test suite
    await pool.end();
  }
});


describe('Full Workflow Test', () => {

  // 1. User login
  test('User login', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send(WORKFLOW_USER);

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.token).not.toContain('|'); // not a pipe-string
    userToken = res.body.token;
  });

  // 2. Request to become owner
  test('User requests owner role', async () => {
    const res = await request(app)
      .post('/api/v1/auth/become-owner')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(201);
    expect(res.body.data).toBeDefined();
    requestId = res.body.data.id;
  });

  // 3. Admin login
  test('Admin login', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send(WORKFLOW_ADMIN);

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    adminToken = res.body.token;
  });

  // 4. Admin approves request
  test('Admin approves owner request', async () => {
    const res = await request(app)
      .patch(`/api/v1/admin/requests/${requestId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe('approved');
  });

  // 5. Verify owner status
  test('User owner-status shows approved', async () => {
    const res = await request(app)
      .get('/api/v1/auth/owner-status')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe('approved');
  });

  // 6. Re-login to get a fresh token with role='owner'
  // JWT is signed at login time with the role baked in at that moment.
  // The old token still carries role='user' — must re-login after approval.
  test('User re-login gets owner token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send(WORKFLOW_USER);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.role).toBe('owner');
    userToken = res.body.token; // swap old token for new owner token
  });

  // 7. Create listing as owner
  test('Owner creates listing', async () => {
    const res = await request(app)
      .post('/api/v1/owner/')            // trailing slash required to avoid redirect
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        payload: {                        // controller reads from req.body.payload
          title: 'Workflow Test Listing',
          type: 'apartment',
          city: 'Bhopal',
          area: 'MP Nagar',
          price: 1000,
        }
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.status).toBe('draft');
    listingId = res.body.data.id;
  });

  // 8. Publish listing
  test('Owner publishes listing', async () => {
    const res = await request(app)
      .patch(`/api/v1/owner/${listingId}/publish`)
      .set('Authorization', `Bearer ${userToken}`); // carries owner role

    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe('published');
  });

});