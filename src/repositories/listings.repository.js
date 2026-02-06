const {pool} = require('../config/db');

// Function to get all listings with filters and pagination
async function findAll(filters, offset) {
  let filterQuery = `SELECT * FROM listings`;
  let placeholder = 1;
  let values = [];

  const filtersArray = [];
  
  if (filters.city) {
    filtersArray.push(`city = $${placeholder++}`);
    values.push(filters.city);
  }
  if (filters.type) {
    filtersArray.push(`type = $${placeholder++}`);
    values.push(filters.type);
  }
  if (filters.priceMin !== undefined && filters.priceMax !== undefined) {
    filtersArray.push(`price >= $${placeholder++}`);
    filtersArray.push(`price <= $${placeholder++}`);
    values.push(filters.priceMin, filters.priceMax);
  }

  if (filtersArray.length > 0) {
    filterQuery += ' WHERE ' + filtersArray.join(' AND ');
  }

  const count = await pool.query(`SELECT COUNT(*) FROM listings` + 
    (filtersArray.length > 0 ? ' WHERE ' + filtersArray.join(' AND ') : ''), values);
  
  const finalQuery = `${filterQuery} LIMIT $${placeholder++} OFFSET $${placeholder++}`;
  
  const listing = await pool.query(finalQuery, [...values, filters.limit, offset]);
  return {
    rows: listing.rows,
    count: count.rows[0].count
  };
}

// Function to get a listing by ID
const findById = async (id) => {
  const listing = await pool.query(
    `SELECT * FROM listings WHERE id = $1`,
    [id]
  );
  if (listing.rows.length === 0){
    return null;
  }
  return listing.rows[0];
};

// Function to add a new listing
async function addListing(newListing){
  const listingToAdd = {
    title: newListing.title,
    type: newListing.type,
    city: newListing.city,
    area: newListing.area,
    price: newListing.price,
    is_available: newListing.is_available || true,
    owner_id: newListing.owner_id
  };

  const addedListing = await pool.query(
    `INSERT INTO listings (title, type, city, area, price, is_available, owner_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [listingToAdd.title, listingToAdd.type,
       listingToAdd.city, listingToAdd.area, listingToAdd.price,
       listingToAdd.is_available, listingToAdd.owner_id]
  )
  return addedListing.rows[0];
}

// Function to update an existing listing
 async function updateListing(id, updatedFields){
  const existingListing = await findById(id);

  const updateListing = await pool.query(
    `UPDATE listings SET title = $1, type = $2, city = $3, area = $4,
     price = $5, is_available = $6 WHERE id = $7 RETURNING *`,
    [
      updatedFields.title || existingListing.title,
      updatedFields.type || existingListing.type,
      updatedFields.city || existingListing.city,
      updatedFields.area || existingListing.area,
      updatedFields.price || existingListing.price,
      updatedFields.is_available !== undefined ? updatedFields.is_available : existingListing.is_available,
      id
    ]
  );
  return updateListing.rows[0];
}

// Function to delete a listing
async function deleteListing(id){
 const result = await pool.query(
    `DELETE FROM listings WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0];
}

module.exports = { 
  findAll, 
  findById, 
  addListing, 
  updateListing, 
  deleteListing
};