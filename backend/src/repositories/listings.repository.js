const {pool} = require('../config/db');

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
    values.push(filters.city);
  }
  if (filters.type) {
    filtersArray.push(`type = $${values.length + 1}`);
    values.push(filters.type);
  }
  if (filters.priceMin !== undefined && filters.priceMax !== undefined) {
    filtersArray.push(`price >= $${values.length + 1}`);
    values.push(filters.priceMin);
    filtersArray.push(`price <= $${values.length + 1}`);
    values.push(filters.priceMax);
  }
  if (filters.q) {
    filtersArray.push(`title ILIKE $${values.length + 1}`);
    values.push(`%${filters.q}%`);
  }

  // Build the WHERE clause once
  const whereClause = filtersArray.length > 0 ? ` WHERE ` + filtersArray.join(' AND ') : '';

  // 3. Execute Count Query
  const countResult = await pool.query(
    `SELECT COUNT(*) FROM listings${whereClause}`, 
    values
  );
  
  // 4. Execute Main Query with Pagination
  const finalQuery = `SELECT * FROM listings${whereClause} LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
  
  const listingResult = await pool.query(
    finalQuery, 
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