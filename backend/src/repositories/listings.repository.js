const { query: dbQuery } = require('../config/db');

// Function to get all listings with filters and pagination
async function findAll(filters, offset) {
  let values = [];
  const filtersArray = [];
  
  if (filters.status) {
    filtersArray.push(`status = $${values.length + 1}`);
    values.push(filters.status);
  } else if (!filters.ignoreStatus) {
    // Default behavior for standard queries (only published listings)
    filtersArray.push(`status = 'published'`);
  }

  if (filters.owner_id) {
    filtersArray.push(`owner_id = $${values.length + 1}`);
    values.push(filters.owner_id);
  }

  if (filters.city) {
    filtersArray.push(`city = $${values.length + 1}`);
    values.push(String(filters.city).trim().toLowerCase());
  }
  if (filters.type) {
    filtersArray.push(`type = $${values.length + 1}`);
    values.push(String(filters.type).trim().toLowerCase());
  }
  if (filters.priceMin !== undefined) {
    filtersArray.push(`price >= $${values.length + 1}`);
    values.push(filters.priceMin);
  }
  if (filters.priceMax !== undefined) {
    filtersArray.push(`price <= $${values.length + 1}`);
    values.push(filters.priceMax);
  }
  if (filters.q) {
    filtersArray.push(`title ILIKE $${values.length + 1}`);
    values.push(`%${filters.q}%`);
  }

  // Build the WHERE clause once
  const whereClause = filtersArray.length > 0 ? ` WHERE ` + filtersArray.join(' AND ') : '';
  const columns = filters.ignoreStatus
    ? 'id, title, type, city, area, price, is_available, owner_id, status, published_at, archived_at'
    : 'id, title, type, city, area, price, is_available';

  const countResult = await dbQuery(`SELECT COUNT(*) FROM listings${whereClause}`, values);
  // Cursor pagination should replace OFFSET as the listing dataset scales.
  const listingResult = await dbQuery(
    `SELECT ${columns} FROM listings${whereClause} ORDER BY price ASC, id ASC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
    [...values, filters.limit, offset]
  );

  return {
    rows: listingResult.rows,
    count: parseInt(countResult.rows[0].count, 10)
  };
}

module.exports = { 
  findAll
};