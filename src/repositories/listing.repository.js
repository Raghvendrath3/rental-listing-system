const {pool} = require('../config/db');

const findAll = async () => {
  const listing = await pool.query(
    `SELECT * FROM listings`
  );
  return listing.rows;
};

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

 async function updateListing(id, updatedFields){
  const existingListing = await findById(id);

  const updateListing = await pool.query(
    `UPDATE listings SET title = $1, type = $2, city = $3, area = $4,
     price = $5, is_available = $6, owner_id = $7 WHERE id = $8 RETURNING *`,
    [
      updatedFields.title || existingListing.title,
      updatedFields.type || existingListing.type,
      updatedFields.city || existingListing.city,
      updatedFields.area || existingListing.area,
      updatedFields.price || existingListing.price,
      updatedFields.is_available !== undefined ? updatedFields.is_available : existingListing.is_available,
      updatedFields.owner_id || existingListing.owner_id,
      id
    ]
  );
  return updateListing.rows[0];
}

function deleteListing(id){
 return pool.query(
    `DELETE FROM listings WHERE id = $1 RETURNING *`,
    [id]
  );
}

module.exports = { findAll, findById, addListing, updateListing, deleteListing };