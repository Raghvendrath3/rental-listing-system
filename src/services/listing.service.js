const {findAll, findById, addListing, updateListing, deleteListing} = require('../repositories/listing.repository');
const AppError = require('../errors/AppErrors');

function filterValidation(filters) {
  if (filters.minPrice !== undefined && (isNaN(filters.minPrice) || filters.minPrice < 0)) {
    throw new AppError('Invalid minPrice value', 400);
  }
  if (filters.maxPrice !== undefined && (isNaN(filters.maxPrice) || filters.maxPrice < 0)) {
    throw new AppError('Invalid maxPrice value', 400);
  }
  if (filters.maxPrice < filters.minPrice) {
    throw new AppError('maxPrice cannot be less than minPrice', 400);
  }
}
async function listingService(filters) {
  const lists = await findAll(); 
  filterValidation(filters);
  let listings = lists.filter(listing => listing.is_available === true);
  if (filters.city) {
    listings = listings.filter(listing => listing.city === filters.city);
  }
  if (filters.type) {
    listings = listings.filter(listing => listing.type === filters.type);
  }
  if (filters.minPrice !== undefined) {
    listings = listings.filter(listing => listing.price >= filters.minPrice);
  }
  if (filters.maxPrice !== undefined) {
    listings = listings.filter(listing => listing.price <= filters.maxPrice);
  }
  return listings;
}

const idVarification = (id) => {
  if (isNaN(id) || id <= 0){
    throw new AppError('Invalid Listing ID', 400);
  }
}
function listingServiceById(id) {
  idVarification(id);
  const listing = findById(id);
  if (!listing){
    throw new AppError('Listing does not exist', 404);
  }
  return listing;
}

function postValidation(newListing){
  if (!newListing.title || !newListing.type || !newListing.city || !newListing.area || !newListing.price || !newListing.owner_id){
    throw new AppError('Missing required listing fields', 400);
  }
  if (isNaN(newListing.price) || newListing.price < 0){
    throw new AppError('Invalid price value', 400);
  }
  if (typeof newListing.is_available !== 'boolean' && newListing.is_available !== undefined){
    throw new AppError('is_available must be a boolean', 400);
  }
  if (isNaN(newListing.owner_id) || newListing.owner_id <=0){
    throw new AppError('Invalid owner_id value', 400);
  }
}


const postListingService = (newListing) => {
  postValidation(newListing);
  const addedListing = addListing(newListing);
  if(!addedListing){
    throw new AppError('Failed to add new listing', 500);
  }
  return addedListing;
}

const updateListingService = async (id, updatedFields) => {
  idVarification(id);
  const listing = await findById(id);
  if (!listing) {
    throw new AppError('Listing does not exist', 404);
  }
  const updatedListing = await updateListing(id, updatedFields);
  return updatedListing;
}

const deleteListingService = async (id) => {
  idVarification(id);
  const listing = await findById(id);
  if (!listing) {
    throw new AppError('Listing does not exist', 404);
  }
  const deletedListing = await deleteListing(id);
  return deletedListing;
}

module.exports = { listingService, listingServiceById, postListingService, updateListingService, deleteListingService };