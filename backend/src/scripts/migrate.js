require('dotenv').config();
const { Pool } = require('pg');

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

async function runMigration() {
  console.log('Running database migrations...');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Add fields to users table
    console.log('Adding columns to users table...');
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS full_name TEXT,
      ADD COLUMN IF NOT EXISTS phone TEXT,
      ADD COLUMN IF NOT EXISTS address TEXT,
      ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS oauth_provider TEXT,
      ADD COLUMN IF NOT EXISTS oauth_provider_id TEXT,
      ADD COLUMN IF NOT EXISTS avatar_url TEXT;
      ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
      CREATE UNIQUE INDEX IF NOT EXISTS users_oauth_identity_unique
      ON users (oauth_provider, oauth_provider_id)
      WHERE oauth_provider IS NOT NULL AND oauth_provider_id IS NOT NULL;
      DROP POLICY IF EXISTS users_oauth_insert ON users;
      CREATE POLICY users_oauth_insert ON users
      FOR INSERT WITH CHECK (
        current_setting('app.user_role', true) = 'oauth_registration'
        AND role = 'user' AND email_verified = TRUE
        AND oauth_provider = 'google' AND oauth_provider_id IS NOT NULL
      );
      DROP POLICY IF EXISTS users_oauth_read ON users;
      CREATE POLICY users_oauth_read ON users
      FOR SELECT USING (current_setting('app.user_role', true) = 'oauth_registration');
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'oauth_identity_complete'
        ) THEN
          ALTER TABLE users ADD CONSTRAINT oauth_identity_complete CHECK (
            (oauth_provider IS NULL AND oauth_provider_id IS NULL)
            OR (oauth_provider IS NOT NULL AND oauth_provider_id IS NOT NULL)
          );
        END IF;
      END
      $$;
    `);

    // 2. Add fields to owner_requests table
    console.log('Adding columns to owner_requests table...');
    await client.query(`
      ALTER TABLE owner_requests 
      ADD COLUMN IF NOT EXISTS property_type TEXT,
      ADD COLUMN IF NOT EXISTS location TEXT,
      ADD COLUMN IF NOT EXISTS reason TEXT;
    `);

    // 3. Create inquiries table
    console.log('Creating inquiries table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS inquiries (
        id SERIAL PRIMARY KEY,
        tenant_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        listing_id INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_listings_status_city_type
      ON listings (status, city, type);
      CREATE INDEX IF NOT EXISTS idx_listings_owner_city_type
      ON listings (owner_id, city, type);
      CREATE EXTENSION IF NOT EXISTS pg_trgm;
      CREATE INDEX IF NOT EXISTS idx_listings_title_trgm
      ON listings USING GIN (title gin_trgm_ops);
    `);

    // 4. Enable Row Level Security (RLS) on inquiries table
    console.log('Enabling Row Level Security on inquiries table...');
    await client.query(`
      ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
    `);

    // 5. Create RLS Policies for inquiries table
    console.log('Creating RLS policies for inquiries...');
    // Drop existing policies if any to avoid errors
    await client.query('DROP POLICY IF EXISTS inquiries_admin_all ON inquiries;');
    await client.query('DROP POLICY IF EXISTS inquiries_tenant_insert ON inquiries;');
    await client.query('DROP POLICY IF EXISTS inquiries_tenant_read ON inquiries;');
    await client.query('DROP POLICY IF EXISTS inquiries_owner_read ON inquiries;');

    // Admin policy: admin role can perform all operations
    await client.query(`
      CREATE POLICY inquiries_admin_all ON inquiries
      USING (current_setting('app.user_role', true) = 'admin');
    `);

    // Tenant insert policy: tenant can only insert inquiries where tenant_id is their own id
    await client.query(`
      CREATE POLICY inquiries_tenant_insert ON inquiries
      FOR INSERT WITH CHECK (tenant_id = (current_setting('app.user_id', true))::integer);
    `);

    // Tenant read policy: tenant can read inquiries they created
    await client.query(`
      CREATE POLICY inquiries_tenant_read ON inquiries
      FOR SELECT USING (tenant_id = (current_setting('app.user_id', true))::integer);
    `);

    // Owner read policy: owner can read inquiries on their own listings
    await client.query(`
      CREATE POLICY inquiries_owner_read ON inquiries
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM listings 
          WHERE listings.id = inquiries.listing_id 
            AND listings.owner_id = (current_setting('app.user_id', true))::integer
        )
      );
    `);

    // 6. Grant privileges to rental_app role
    console.log('Granting privileges on inquiries to rental_app...');
    await client.query(`
      GRANT SELECT, INSERT, DELETE, UPDATE ON inquiries TO rental_app;
      GRANT SELECT, USAGE ON inquiries_id_seq TO rental_app;
    `);

    await client.query('COMMIT');
    console.log('Migrations completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
