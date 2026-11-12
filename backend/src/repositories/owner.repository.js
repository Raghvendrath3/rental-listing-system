const { query: dbQuery } = require('../config/db');


// Function to get a listing by ID
const findById = async (id, role = 'user', actorId) => {
  let queryText = `
    SELECT l.*, u.full_name AS owner_name
    FROM listings l
    LEFT JOIN users u ON l.owner_id = u.id
    WHERE l.id = $1
  `;
  const params = [id]; 

  if (role === 'user') {
    queryText += ` AND l.status = $2`;
    params.push('published');
  } else if (role === 'owner') {
    queryText += ` AND l.owner_id = $2`;
    params.push(actorId);
  } else if (role !== 'admin') {
    return null;
  }

  const listing = await dbQuery(queryText, params);

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
    is_available: newListing.is_available ?? true,
    owner_id: newListing.owner_id
  };

  const addedListing = await dbQuery(
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
  const existingListing = await findById(id, 'admin');

  const updateListing = await dbQuery(
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
 const result = await dbQuery(
    `DELETE FROM listings WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0];
}

// function for publish listing
async function publishListing(id) {
  const result = await dbQuery(
    `UPDATE listings SET status = $1, published_at = NOW() WHERE id = $2 AND status = 'draft' RETURNING *`,
    ['published', id] 
  );
  return result.rows[0];
}

//function for archiving listing 
async function archiveListing(id){
    const result = await dbQuery(
    `UPDATE listings SET status = $1, archived_at = NOW() WHERE id = $2 AND status = 'published' RETURNING *`,
    ['archived', id] 
  );
  console.log(result.rows);
  return result.rows[0];
}

module.exports = {
  findById, 
  addListing, 
  updateListing, 
  deleteListing,
  publishListing,
  archiveListing
};