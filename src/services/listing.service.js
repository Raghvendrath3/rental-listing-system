const {findAll, findById} = require('../repositories/listing.repository');
const AppError = require('../errors/appErrors');

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

module.exports = { listingService, listingServiceById };