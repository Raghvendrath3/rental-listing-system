const {findAll, findById, addListing} = require('../repositories/listing.repository');
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
function listingService(filters) {
  filterValidation(filters);
  let listings = findAll().filter(listing => listing.isAvailable === true);
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
  if (!newListing.title || !newListing.type || !newListing.city || !newListing.area || !newListing.price || !newListing.ownerId){
    throw new AppError('Missing required listing fields', 400);
  }
  if (isNaN(newListing.price) || newListing.price < 0){
    throw new AppError('Invalid price value', 400);
  }
  if (typeof newListing.isAvailable !== 'boolean' && newListing.isAvailable !== undefined){
    throw new AppError('isAvailable must be a boolean', 400);
  }
  if (isNaN(newListing.ownerId) || newListing.ownerId <=0){
    throw new AppError('Invalid ownerId value', 400);
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

const updateListingService = (id, updatedFields) => {
  idVarification(id);
  const listing = findById(id);
  if (!listing) {
    throw new AppError('Listing does not exist', 404);
  }
  const updatedListing = {...listing, ...updatedFields};
  return updatedListing;
}

const deleteListingService = (id) => {
  idVarification(id);
  const listing = findById(id);
  if (!listing) {
    throw new AppError('Listing does not exist', 404);
  }
  return listing;
}

module.exports = { listingService, listingServiceById, postListingService, updateListingService, deleteListingService };