-- ==============================================================================
-- PostgreSQL Database Schema for Rental Hub
-- ==============================================================================
-- Create restricted application role
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'rental_app') THEN
        CREATE ROLE rental_app;
    END IF;
END
$$;

-- Listing Status Enum
CREATE TYPE listing_status AS ENUM ('draft', 'published', 'archived');

-- Owner Request Status Enum
CREATE TYPE owner_request_status AS ENUM ('pending', 'approved', 'rejected');

-- Function to force email to lowercase
CREATE FUNCTION force_email_lowercase()
RETURNS TRIGGER AS $$
BEGIN
    NEW.email := LOWER(NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to force listing text to lowercase
CREATE FUNCTION force_listings_text_lowercase()
RETURNS TRIGGER AS $$
BEGIN
    NEW.title := LOWER(NEW.title);
    NEW.type := LOWER(NEW.type);
    NEW.city := LOWER(NEW.city);
    
    IF NEW.area IS NOT NULL THEN
        NEW.area := LOWER(NEW.area);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'owner', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    full_name TEXT,
    phone TEXT,
    address TEXT
);

-- Enable RLS on users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users RLS Policies
CREATE POLICY users_admin_read ON users
FOR SELECT USING (current_setting('app.user_role', true) = 'admin');

CREATE POLICY users_admin_update ON users
FOR UPDATE USING (current_setting('app.user_role', true) = 'admin');

CREATE POLICY users_self_read ON users
FOR SELECT USING (id = (current_setting('app.user_id', true))::integer);

CREATE POLICY users_auth_lookup ON users
FOR SELECT USING (current_setting('app.user_role', true) = 'auth_lookup');

CREATE POLICY users_registration_insert ON users
FOR INSERT WITH CHECK (
    current_setting('app.user_role', true) = 'registration'
    AND role = 'user'
);

CREATE POLICY users_registration_read ON users
FOR SELECT USING (
    current_setting('app.user_role', true) = 'registration'
    AND role = 'user'
);

-- Listings Table
CREATE TABLE listings (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('room', 'house', 'apartment', 'pg', 'villa', 'studio')),
    city TEXT NOT NULL,
    area TEXT,
    price NUMERIC NOT NULL CHECK (price > 0),
    is_available BOOLEAN DEFAULT TRUE NOT NULL,
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status listing_status DEFAULT 'draft' NOT NULL,
    published_at TIMESTAMP,
    archived_at TIMESTAMP,
    CONSTRAINT published_at_required CHECK (
        (status = 'published' AND published_at IS NOT NULL) OR status <> 'published'
    ),
    CONSTRAINT archived_at_required CHECK (
        (status = 'archived' AND archived_at IS NOT NULL) OR status <> 'archived'
    )
);

-- Enable RLS on listings
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Listings RLS Policies
CREATE POLICY listings_admin_all ON listings
USING (current_setting('app.user_role', true) = 'admin');

CREATE POLICY listings_owner_read ON listings
FOR SELECT USING (owner_id = (current_setting('app.user_id', true))::integer);

CREATE POLICY listings_owner_insert ON listings
FOR INSERT WITH CHECK (owner_id = (current_setting('app.user_id', true))::integer);

CREATE POLICY listings_owner_update ON listings
FOR UPDATE USING (owner_id = (current_setting('app.user_id', true))::integer);

CREATE POLICY listings_owner_delete ON listings
FOR DELETE USING (owner_id = (current_setting('app.user_id', true))::integer);

CREATE POLICY listings_public_read ON listings
FOR SELECT USING (status = 'published');

-- Owner Requests Table
CREATE TABLE owner_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    status owner_request_status DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    property_type TEXT,
    location TEXT,
    reason TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Enable RLS on owner_requests
ALTER TABLE owner_requests ENABLE ROW LEVEL SECURITY;

-- Owner Requests RLS Policies
CREATE POLICY requests_admin_all ON owner_requests
USING (current_setting('app.user_role', true) = 'admin');

CREATE POLICY requests_user_read ON owner_requests
FOR SELECT USING (user_id = (current_setting('app.user_id', true))::integer);

CREATE POLICY requests_user_insert ON owner_requests
FOR INSERT WITH CHECK (user_id = (current_setting('app.user_id', true))::integer);

-- Indexes
CREATE INDEX idx_owner_requests_status ON owner_requests USING btree (status);
CREATE UNIQUE INDEX unique_pending_owner_request ON owner_requests(user_id)
WHERE status = 'pending';

-- Triggers
CREATE TRIGGER trg_force_email_lowercase
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION force_email_lowercase();

CREATE TRIGGER trg_force_listings_text_lowercase
BEFORE INSERT OR UPDATE ON listings
FOR EACH ROW
EXECUTE FUNCTION force_listings_text_lowercase();

-- Inquiries Table
CREATE TABLE inquiries (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    listing_id INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on inquiries
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Inquiries RLS Policies
CREATE POLICY inquiries_admin_all ON inquiries
USING (current_setting('app.user_role', true) = 'admin');

CREATE POLICY inquiries_tenant_insert ON inquiries
FOR INSERT WITH CHECK (tenant_id = (current_setting('app.user_id', true))::integer);

CREATE POLICY inquiries_tenant_read ON inquiries
FOR SELECT USING (tenant_id = (current_setting('app.user_id', true))::integer);

CREATE POLICY inquiries_owner_read ON inquiries
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM listings
        WHERE listings.id = inquiries.listing_id
          AND listings.owner_id = (current_setting('app.user_id', true))::integer
    )
);

-- Grants
GRANT SELECT, INSERT, DELETE, UPDATE ON listings TO rental_app;
GRANT SELECT, USAGE ON listings_id_seq TO rental_app;
GRANT SELECT, INSERT, DELETE, UPDATE ON owner_requests TO rental_app;
GRANT SELECT, USAGE ON owner_requests_id_seq TO rental_app;
GRANT SELECT, INSERT, UPDATE ON users TO rental_app;
GRANT SELECT, USAGE ON users_id_seq TO rental_app;
GRANT SELECT, INSERT, DELETE, UPDATE ON inquiries TO rental_app;
GRANT SELECT, USAGE ON inquiries_id_seq TO rental_app;
