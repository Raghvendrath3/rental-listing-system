const CACHE_TTL_MS = 30 * 1000;
const MAX_CACHE_ENTRIES = 500;
const entries = new Map();

function createCacheKey(filters) {
  return JSON.stringify({
    q: filters.q ? String(filters.q).trim().toLowerCase() : '',
    city: filters.city ? String(filters.city).trim().toLowerCase() : '',
    type: filters.type ? String(filters.type).trim().toLowerCase() : '',
    priceMin: filters.priceMin ?? null,
    priceMax: filters.priceMax ?? null,
    page: Number(filters.page),
    limit: Number(filters.limit)
  });
}

function getPublicListings(key) {
  const entry = entries.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt <= Date.now()) {
    entries.delete(key);
    return undefined;
  }
  entries.delete(key);
  entries.set(key, entry);
  return entry.value;
}

function setPublicListings(key, value) {
  entries.delete(key);
  entries.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
  while (entries.size > MAX_CACHE_ENTRIES) {
    entries.delete(entries.keys().next().value);
  }
}

function invalidatePublicListings() {
  entries.clear();
}

module.exports = {
  createCacheKey,
  getPublicListings,
  setPublicListings,
  invalidatePublicListings
};
