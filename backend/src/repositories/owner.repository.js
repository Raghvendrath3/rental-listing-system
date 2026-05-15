const {pool} = require('../config/db');
const AppErrors = require('../errors/AppErrors');


async function ownerListingsRepository(ownerId){
  try {
    const query = `SELECT * FROM listings WHERE owner_id = $1`;

    const result = await pool.query(query, [ownerId]); // Fix: ownerId must be wrapped in an array — pg driver requires params as an array
    return result.rows; // Fix: return all rows, not just the first one

  } catch (error) {
    throw new AppErrors("listings not found", 404); // Fix: was missing `throw new`, error was silently swallowed
  }
}


// Function to get a listing by ID
const findById = async (id, role) => {
  let queryText = `SELECT * FROM listings WHERE id = $1`;
  const params = [id]; 

  if (role === 'user') {
    queryText += ` AND status = $2`;
    params.push('published');
  }

  const listing = await pool.query(queryText, params);

  if (listing.rows.length === 0) {
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

// function for publish listing
async function publishListing(id) {
  const result = await pool.query(
    `UPDATE listings SET status = $1, published_at = NOW() WHERE id = $2 AND status = 'draft' RETURNING *`,
    ['published', id] 
  );
  return result.rows[0];
}

//function for archiving listing 
async function archiveListing(id){
    const result = await pool.query(
    `UPDATE listings SET status = $1, archived_at = NOW() WHERE id = $2 AND status = 'published' RETURNING *`,
    ['archived', id] 
  );
  console.log(result.rows);
  return result.rows[0];
}

module.exports = {
  ownerListingsRepository,
  findById, 
  addListing, 
  updateListing, 
  deleteListing,
  publishListing,
  archiveListing
};