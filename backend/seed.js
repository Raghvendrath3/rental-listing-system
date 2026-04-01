require('dotenv').config(); // Load variables from .env
const { Pool } = require('pg');
const { faker } = require('@faker-js/faker');

// Use environment variables for connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // CLEAR TABLES FIRST (Directly in the script)
    console.log("Clearing existing data...");
    await client.query('TRUNCATE TABLE listings, users RESTART IDENTITY CASCADE');

    // 1. Create Users
    const userIds = [];
    for (let i = 0; i < 10; i++) {
      const res = await client.query(
        "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'user') RETURNING id",
        [faker.internet.email(), 'hashed_pass']
      );
      userIds.push(res.rows[0].id);
    }

    // 2. Promote Roles
    const ownerIds = userIds.slice(0, 3);
    const adminId = userIds[3];
    await client.query("UPDATE users SET role = 'owner' WHERE id = ANY($1)", [ownerIds]);
    await client.query("UPDATE users SET role = 'admin' WHERE id = $1", [adminId]);

    // 3. Create Listings (Matching your specific schema)
    for (const ownerId of ownerIds) {
      const status = faker.helpers.arrayElement(['draft', 'published', 'archived']);
      await client.query(
        `INSERT INTO listings (title, type, city, area, price, owner_id, status, published_at, archived_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          faker.commerce.productName(),
          faker.helpers.arrayElement(['room', 'house', 'apartment', 'pg']),
          'Jabalpur',
          faker.helpers.arrayElement(['Ranjhi', 'Vijay Nagar']),
          faker.commerce.price({ min: 500 }),
          ownerId,
          status,
          status === 'published' ? new Date() : null,
          status === 'archived' ? new Date() : null
        ]
      );
    }

    await client.query('COMMIT');
    console.log('✅ Success: Tables cleared and re-seeded!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
