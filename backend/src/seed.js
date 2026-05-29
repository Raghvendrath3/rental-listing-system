/**
 * RentalHub - Demo Seed Script
 * -----------------------------------------------
 * Populates the database with realistic demo data.
 * Passwords are hashed with bcryptjs at salt rounds = 12.
 *
 * Prerequisites:
 *   npm install bcryptjs pg dotenv
 *
 * Usage:
 *   node seed.js
 *
 * Configure your DB connection via environment variables
 * (or a .env file in the same directory):
 *   DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
 *
 * ⚠️  This script TRUNCATES users, owner_requests, and listings
 *     before inserting — run only against a dev/demo database.
 * -----------------------------------------------
 */
require('dotenv').config(); 
// or if using ES modules: import 'dotenv/config';

const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const path    = require('path');

// ── Load .env if present ───────────────────────────────────────────────────
try {
  require('dotenv').config();
} catch (_) {
  // dotenv optional — fall through to defaults
}

// ── DB connection ──────────────────────────────────────────────────────────
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// ── Salt rounds ────────────────────────────────────────────────────────────
const SALT_ROUNDS = 12;

// ─────────────────────────────────────────────────────────────────────────────
// DEMO CREDENTIALS  (printed at the end of the script)
// ─────────────────────────────────────────────────────────────────────────────
const USERS = [
  // ── Admin (already exists — we upsert by updating the password to be sure) ──
  {
    email:    'admin@rentalhub.com',
    password: 'AdminPassword123!',
    role:     'admin',
    label:    'Admin',
  },

  // ── Owner ──
  {
    email:    'priya.owner@rentalhub.com',
    password: 'OwnerDemo@2026',
    role:     'owner',
    label:    'Owner',
  },

  // ── Regular user ──
  {
    email:    'ravi.user@rentalhub.com',
    password: 'UserDemo@2026',
    role:     'user',
    label:    'User',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// LISTINGS  (all owned by the owner above)
// All text is already lowercase to match the DB trigger behaviour.
// price is an integer > 0.
// ─────────────────────────────────────────────────────────────────────────────
const LISTINGS_SEED = [
  // ── Published listings (visible in public browse) ─────────────────────────
  {
    title:        '2bhk furnished flat in koramangala',
    type:         'apartment',
    city:         'bangalore',
    area:         'koramangala',
    price:        22000,
    is_available: true,
    status:       'published',
  },
  {
    title:        'spacious studio near indiranagar metro',
    type:         'studio',
    city:         'bangalore',
    area:         'indiranagar',
    price:        15000,
    is_available: true,
    status:       'published',
  },
  {
    title:        'cozy pg for working professionals',
    type:         'pg',
    city:         'bangalore',
    area:         'hsr layout',
    price:        9500,
    is_available: true,
    status:       'published',
  },
  {
    title:        '3bhk independent house with garden',
    type:         'house',
    city:         'bangalore',
    area:         'whitefield',
    price:        35000,
    is_available: true,
    status:       'published',
  },
  {
    title:        'single room with ac near btm layout',
    type:         'room',
    city:         'bangalore',
    area:         'btm layout',
    price:        8000,
    is_available: false,
    status:       'published',
  },
  {
    title:        'premium villa with pool in sarjapur',
    type:         'villa',
    city:         'bangalore',
    area:         'sarjapur road',
    price:        85000,
    is_available: true,
    status:       'published',
  },
  {
    title:        '1bhk apartment near electronic city',
    type:         'apartment',
    city:         'bangalore',
    area:         'electronic city',
    price:        12000,
    is_available: true,
    status:       'published',
  },

  // ── Draft listings (owner dashboard only) ────────────────────────────────
  {
    title:        'modern studio in jp nagar',
    type:         'studio',
    city:         'bangalore',
    area:         'jp nagar',
    price:        14000,
    is_available: true,
    status:       'draft',
  },
  {
    title:        '2bhk flat near marathahalli',
    type:         'apartment',
    city:         'bangalore',
    area:         'marathahalli',
    price:        18500,
    is_available: true,
    status:       'draft',
  },

  // ── Archived listing ──────────────────────────────────────────────────────
  {
    title:        'old room near bellandur',
    type:         'room',
    city:         'bangalore',
    area:         'bellandur',
    price:        7000,
    is_available: false,
    status:       'archived',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function log(msg)  { console.log(`  ✔  ${msg}`); }
function warn(msg) { console.warn(`  ⚠  ${msg}`); }
function header(msg) { console.log(`\n── ${msg} ──────────────────────────────`); }

async function hashPassword(plain) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
async function seed() {
  const client = await pool.connect();

  try {
    console.log('\n╔══════════════════════════════════════════════════╗');
    console.log('║        RentalHub  —  Demo Seed Script            ║');
    console.log('╚══════════════════════════════════════════════════╝');

    // ── 1. Hash all passwords up-front ──────────────────────────────────────
    header('Hashing passwords (salt rounds = 12)');
    const hashed = [];
    for (const u of USERS) {
      const hash = await hashPassword(u.password);
      hashed.push({ ...u, hash });
      log(`Hashed password for ${u.email}`);
    }

    // ── 2. Truncate in dependency order ─────────────────────────────────────
    header('Clearing existing demo data');
    await client.query('BEGIN');

    await client.query('TRUNCATE listings RESTART IDENTITY CASCADE');
    log('Truncated listings');

    await client.query('TRUNCATE owner_requests RESTART IDENTITY CASCADE');
    log('Truncated owner_requests');

    // For users: delete non-admin rows only, then upsert admin
    // (in case your schema has FK references outside our seed)
    await client.query(`DELETE FROM users WHERE email != 'admin@rentalhub.com'`);
    log('Removed non-admin users');

    // ── 3. Upsert / insert users ─────────────────────────────────────────────
    header('Inserting users');
    const insertedUsers = {};

    for (const u of hashed) {
      if (u.role === 'admin') {
        // Admin already exists — update password hash + ensure role is admin
        const res = await client.query(
          `UPDATE users
              SET password_hash = $1,
                  role          = 'admin'
            WHERE email = $2
           RETURNING id, email, role`,
          [u.hash, u.email]
        );
        if (res.rowCount === 0) {
          // Shouldn't happen, but insert as fallback
          const ins = await client.query(
            `INSERT INTO users (email, password_hash, role)
             VALUES ($1, $2, 'admin')
             RETURNING id, email, role`,
            [u.email, u.hash]
          );
          insertedUsers[u.role] = ins.rows[0];
          log(`Inserted admin: ${u.email}`);
        } else {
          insertedUsers[u.role] = res.rows[0];
          log(`Updated admin: ${u.email} (id=${res.rows[0].id})`);
        }
      } else {
        const res = await client.query(
          `INSERT INTO users (email, password_hash, role)
           VALUES ($1, $2, $3)
           RETURNING id, email, role`,
          [u.email, u.hash, u.role]
        );
        insertedUsers[u.role] = res.rows[0];
        log(`Inserted ${u.role}: ${u.email} (id=${res.rows[0].id})`);
      }
    }

    // ── 4. Owner request for the owner user ──────────────────────────────────
    header('Creating owner_request for owner user');
    const ownerId = insertedUsers['owner'].id;
    await client.query(
      `INSERT INTO owner_requests (user_id, status)
       VALUES ($1, 'approved')`,
      [ownerId]
    );
    log(`Owner request inserted for user_id=${ownerId} (status=approved)`);

    // Owner request for regular user (pending — to show something in admin panel)
    const userId = insertedUsers['user'].id;
    await client.query(
      `INSERT INTO owner_requests (user_id, status)
       VALUES ($1, 'pending')`,
      [userId]
    );
    log(`Pending owner request inserted for user_id=${userId} (status=pending)`);

    // ── 5. Insert listings ────────────────────────────────────────────────────
    header('Inserting listings');
    let publishedCount = 0, draftCount = 0, archivedCount = 0;

    for (const l of LISTINGS_SEED) {
      const now = new Date().toISOString();
      const published_at = l.status === 'published' ? now : null;
      const archived_at  = l.status === 'archived'  ? now : null;

      await client.query(
        `INSERT INTO listings
           (title, type, city, area, price, is_available, owner_id, status, published_at, archived_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          l.title, l.type, l.city, l.area,
          l.price, l.is_available,
          ownerId,
          l.status, published_at, archived_at,
        ]
      );

      if (l.status === 'published') publishedCount++;
      else if (l.status === 'draft') draftCount++;
      else archivedCount++;

      log(`[${l.status.toUpperCase().padEnd(9)}] ${l.title}`);
    }

    await client.query('COMMIT');

    // ─────────────────────────────────────────────────────────────────────────
    // SUMMARY
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║                    SEED COMPLETE  ✅                         ║');
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log('║  DEMO CREDENTIALS                                            ║');
    console.log('╠══════════════════════════════════════════════════════════════╣');

    const creds = [
      { label: '👤 Admin',  email: 'admin@rentalhub.com',       password: 'AdminPassword123!',  role: 'admin' },
      { label: '🏠 Owner',  email: 'priya.owner@rentalhub.com', password: 'OwnerDemo@2026',      role: 'owner' },
      { label: '🙋 User',   email: 'ravi.user@rentalhub.com',   password: 'UserDemo@2026',       role: 'user'  },
    ];

    for (const c of creds) {
      console.log(`║  ${c.label.padEnd(10)}                                               ║`);
      console.log(`║    Email    : ${c.email.padEnd(46)}║`);
      console.log(`║    Password : ${c.password.padEnd(46)}║`);
      console.log(`║    Role     : ${c.role.padEnd(46)}║`);
      console.log('║                                                              ║');
    }

    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log('║  LISTINGS INSERTED                                           ║');
    console.log(`║    Published : ${String(publishedCount).padEnd(46)}║`);
    console.log(`║    Draft     : ${String(draftCount).padEnd(46)}║`);
    console.log(`║    Archived  : ${String(archivedCount).padEnd(46)}║`);
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log('║  OWNER REQUESTS                                              ║');
    console.log('║    priya.owner  — approved  (owner role active)              ║');
    console.log('║    ravi.user    — pending   (visible in admin panel)         ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n❌ Seed failed — transaction rolled back.');
    console.error('   Error:', err.message);

    if (err.message.includes('relation') && err.message.includes('does not exist')) {
      console.error('\n   Hint: make sure you have run your schema migrations before seeding.');
    }
    if (err.message.includes('password_hash')) {
      console.error('\n   Hint: your users table might use "password" instead of "password_hash" —');
      console.error('   update the INSERT/UPDATE queries in this script to match your column name.');
    }

    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
