BEGIN;

CREATE EXTENSION IF NOT EXISTS pg_trgm;

DROP INDEX IF EXISTS idx_listings_status_city_type;

CREATE INDEX IF NOT EXISTS idx_listings_published_city_type_price_id
ON listings (city, type, price, id)
WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_listings_title_trgm
ON listings USING GIN (title gin_trgm_ops);

COMMIT;
