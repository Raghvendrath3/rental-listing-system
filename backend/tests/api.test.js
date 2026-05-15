require('dotenv').config();
const request = require('supertest');
const app = require('../src/app');
const { connectDB, pool } = require('../src/config/db');

// -------------------------------------------------------------------
// Shared state — populated during tests and used by later ones
// -------------------------------------------------------------------
let userToken;
let ownerToken;
let adminToken;
let userId;
let ownerId;
let listingId;
let ownerRequestId;

// -------------------------------------------------------------------
// Test credentials — isolated from real data, cleaned up in afterAll
// -------------------------------------------------------------------
const TEST_USER  = { email: 'test_user_jest@example.com',  password: 'TestUser@123' };
const TEST_OWNER = { email: 'test_owner_jest@example.com', password: 'TestOwner@123' };
const TEST_ADMIN = { email: 'test_admin_jest@example.com', password: 'TestAdmin@123' };

// -------------------------------------------------------------------
// Setup / teardown
// -------------------------------------------------------------------
beforeAll(async () => {
  await connectDB();

  const bcrypt = require('bcrypt');
  const [ownerHash, adminHash] = await Promise.all([
    bcrypt.hash(TEST_OWNER.password, 12),
    bcrypt.hash(TEST_ADMIN.password, 12),
  ]);

  // Regular user created via the API (tests the signup endpoint too)
  const signupRes = await request(app)
    .post('/api/v1/auth/register')
    .send(TEST_USER);
  userId = signupRes.body.data.id;

  // Owner and admin seeded directly — role can't be set via the public API
  const ownerResult = await pool.query(
    `INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'owner') RETURNING id`,
    [TEST_OWNER.email, ownerHash]
  );
  ownerId = ownerResult.rows[0].id;

  await pool.query(
    `INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'admin')`,
    [TEST_ADMIN.email, adminHash]
  );
});

afterAll(async () => {
  try {
    // Order matters due to FK constraints: listings → owner_requests → users
    await pool.query(`DELETE FROM listings       WHERE owner_id IN (SELECT id FROM users WHERE email LIKE '%_jest@example.com')`);
    await pool.query(`DELETE FROM owner_requests WHERE user_id  IN (SELECT id FROM users WHERE email LIKE '%_jest@example.com')`);
    await pool.query(`DELETE FROM users          WHERE email    LIKE '%_jest@example.com'`);
  } catch (err) {
    console.error('Clean up failed in api.test.js:', err.message);
  } finally {
    // This file is done; shut down the connection pool
    await pool.end();
  }
});


// -------------------------------------------------------------------
// 1. Health
// -------------------------------------------------------------------
describe('Health', () => {
  test('GET /health returns 200 with uptime', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.uptime).toBeDefined();
  });
});

// -------------------------------------------------------------------
// 2. Auth — signup
// -------------------------------------------------------------------
describe('Auth — signup', () => {
  test('POST /register creates a new user and returns id + role', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'extra_jest@example.com', password: 'Extra@1234' });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.email).toBe('extra_jest@example.com');
    expect(res.body.data.role).toBe('user');
    expect(res.body.data.id).toBeDefined();
    // cleanup this extra user
    await pool.query(`DELETE FROM users WHERE email = 'extra_jest@example.com'`);
  });

  test('duplicate email returns 400 or 409', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(TEST_USER); // already registered in beforeAll
    expect([400, 409]).toContain(res.statusCode);
  });

  test('weak password returns 400', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'weak_jest@example.com', password: '123' });
    expect(res.statusCode).toBe(400);
  });

  test('invalid email format returns 400', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'notanemail', password: 'Valid@1234' });
    expect(res.statusCode).toBe(400);
  });
});

// -------------------------------------------------------------------
// 3. Auth — login
// -------------------------------------------------------------------
describe('Auth — login', () => {
  test('user login returns a clean JWT object (not a pipe-delimited string)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send(TEST_USER);
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.token).not.toContain('|'); // Bug #11 regression check
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.role).toBe('user');
    userToken = res.body.token;
  });

  test('owner login succeeds', async () => {
    const res = await request(app).post('/api/v1/auth/login').send(TEST_OWNER);
    expect(res.statusCode).toBe(200);
    ownerToken = res.body.token;
  });

  test('admin login succeeds', async () => {
    const res = await request(app).post('/api/v1/auth/login').send(TEST_ADMIN);
    expect(res.statusCode).toBe(200);
    adminToken = res.body.token;
  });

  test('wrong password returns 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: TEST_USER.email, password: 'WrongPass@99' });
    expect(res.statusCode).toBe(401);
  });

  test('unknown email returns 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@example.com', password: 'Whatever@1' });
    expect(res.statusCode).toBe(401);
  });
});

// -------------------------------------------------------------------
// 3. Auth middleware — 401 not 500 on bad token (Bug #10 regression)
// -------------------------------------------------------------------
describe('Auth middleware', () => {
  test('missing token returns 401', async () => {
    const res = await request(app).get('/api/v1/owner/owner-listings');
    expect(res.statusCode).toBe(401);
  });

  test('invalid token returns 401 not 500', async () => {
    const res = await request(app)
      .get('/api/v1/owner/owner-listings')
      .set('Authorization', 'Bearer thisisnotavalidtoken');
    expect(res.statusCode).toBe(401); // Bug #10 regression check
    expect(res.statusCode).not.toBe(500);
  });
});

// -------------------------------------------------------------------
// 4. Public listings
// -------------------------------------------------------------------
describe('Public listings', () => {
  test('GET /listings returns 200', async () => {
    const res = await request(app).get('/api/v1/listings?page=1&limit=5');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('only published listings are returned', async () => {
    const res = await request(app).get('/api/v1/listings');
    expect(res.statusCode).toBe(200);
    res.body.data.forEach(l => expect(l.status).toBe('published'));
  });

  test('invalid page number returns 400', async () => {
    const res = await request(app).get('/api/v1/listings?page=-1');
    expect(res.statusCode).toBe(400);
  });
});

// -------------------------------------------------------------------
// 5. Owner request flow — user submits, admin approves
// -------------------------------------------------------------------
describe('Owner request flow', () => {
  test('user can submit a become-owner request', async () => {
    const res = await request(app)
      .post('/api/v1/auth/become-owner')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(201);
    expect(res.body.data.status).toBe('pending');
    ownerRequestId = res.body.data.id;
  });

  test('user cannot submit a second request while one is pending', async () => {
    const res = await request(app)
      .post('/api/v1/auth/become-owner')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(409);
  });

  test('user can check their owner-status', async () => {
    const res = await request(app)
      .get('/api/v1/auth/owner-status')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe('pending');
  });

  test('non-admin cannot see requests list', async () => {
    const res = await request(app)
      .get('/api/v1/admin/requests')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(403);
  });

  test('admin can see the pending request', async () => {
    const res = await request(app)
      .get('/api/v1/admin/requests')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    const found = res.body.data.find(r => r.id === ownerRequestId);
    expect(found).toBeDefined();
    expect(found.status).toBe('pending');
  });

  test('admin can approve the request', async () => {
    const res = await request(app)
      .patch(`/api/v1/admin/requests/${ownerRequestId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe('approved');
  });

  test('approving the same request again returns 400', async () => {
    const res = await request(app)
      .patch(`/api/v1/admin/requests/${ownerRequestId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(400);
  });
});

// -------------------------------------------------------------------
// 6. Listing CRUD (as seeded owner)
// -------------------------------------------------------------------
describe('Listing CRUD', () => {
  test('owner can create a listing', async () => {
    const res = await request(app)
      .post('/api/v1/owner/')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ payload: {
        title: 'Jest Test Flat',
        type: 'apartment',
        city: 'Bhopal',
        area: 'Arera Colony',
        price: 15000
      }});
    expect(res.statusCode).toBe(201);
    expect(res.body.data.title).toBe('Jest Test Flat');
    expect(res.body.data.status).toBe('draft');
    listingId = res.body.data.id;
  });

  test('user (non-owner) cannot create a listing', async () => {
    const res = await request(app)
      .post('/api/v1/owner/')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ payload: { title: 'Sneaky', type: 'apartment', city: 'Bhopal', area: 'MP Nagar', price: 5000 }});
    expect(res.statusCode).toBe(403);
  });

  test('owner can update their listing', async () => {
    const res = await request(app)
      .patch(`/api/v1/owner/${listingId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ price: 18000 });
    expect(res.statusCode).toBe(200);
    expect(Number(res.body.data.price)).toBe(18000); // PostgreSQL returns numeric columns as strings — cast to compare
  });

  test('owner can get their listings', async () => {
    const res = await request(app)
      .get('/api/v1/owner/owner-listings')
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(res.statusCode).toBe(200);
  });

  test('get listing by id', async () => {
    const res = await request(app).get(`/api/v1/owner/${listingId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.id).toBe(listingId);
  });

  test('non-existent listing returns 404', async () => {
    const res = await request(app).get('/api/v1/owner/999999');
    expect(res.statusCode).toBe(404);
  });
});

// -------------------------------------------------------------------
// 7. Listing lifecycle — draft → published → archived
// -------------------------------------------------------------------
describe('Listing lifecycle', () => {
  test('owner can publish a draft listing', async () => {
    const res = await request(app)
      .patch(`/api/v1/owner/${listingId}/publish`)
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe('published');
  });

  test('cannot publish an already-published listing', async () => {
    const res = await request(app)
      .patch(`/api/v1/owner/${listingId}/publish`)
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(res.statusCode).toBe(409);
  });

  test('published listing appears in public GET /listings', async () => {
    const res = await request(app).get('/api/v1/listings');
    expect(res.statusCode).toBe(200);
    const found = res.body.data.find(l => l.id === listingId);
    expect(found).toBeDefined();
  });

  test('owner can archive a published listing', async () => {
    const res = await request(app)
      .patch(`/api/v1/owner/${listingId}/archive`)
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe('archived');
  });

  test('archived listing no longer appears in public GET /listings', async () => {
    const res = await request(app).get('/api/v1/listings');
    expect(res.statusCode).toBe(200);
    const found = res.body.data.find(l => l.id === listingId);
    expect(found).toBeUndefined();
  });

  test('cannot archive an already-archived listing', async () => {
    const res = await request(app)
      .patch(`/api/v1/owner/${listingId}/archive`)
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(res.statusCode).toBe(409);
  });
});

// -------------------------------------------------------------------
// 8. Admin routes
// -------------------------------------------------------------------
describe('Admin routes', () => {
  test('admin can get platform stats', async () => {
    const res = await request(app)
      .get('/api/v1/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.totalUsers).toBeDefined();
    expect(res.body.data.totalListings).toBeDefined();
  });

  test('admin can get all users', async () => {
    const res = await request(app)
      .get('/api/v1/admin/admin')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('non-admin cannot access stats', async () => {
    const res = await request(app)
      .get('/api/v1/admin/stats')
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(res.statusCode).toBe(403);
  });
});

// -------------------------------------------------------------------
// 9. Delete listing
// -------------------------------------------------------------------
describe('Listing delete', () => {
  test('owner can delete their own listing', async () => {
    const res = await request(app)
      .delete(`/api/v1/owner/${listingId}`)
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(res.statusCode).toBe(200);
  });

  test('deleted listing returns 404', async () => {
    const res = await request(app).get(`/api/v1/owner/${listingId}`);
    expect(res.statusCode).toBe(404);
  });
});