const {
  findAll, 
  findById, 
  addListing, 
  updateListing, 
  deleteListing
} = require('../repositories/listing.repository');
const AppError = require('../errors/AppErrors');

// Validation for filters
function filterValidation(filters){
  if (filters.priceMin !== undefined && filters.priceMax !== undefined){
    const minPrice = filters.priceMin;
    const maxPrice = filters.priceMax;
    if(minPrice < 0 || maxPrice < 0 || maxPrice <= minPrice){
      throw new AppError("invalid minimum price amount", 400);
    }
  }
}

// Validation for pagination
function pageValidation(filters, totalPages){
  if (filters.page <= 0 || isNaN(filters.page)){
    throw new AppError("Invalid page number", 400);
  }
  if (filters.limit <= 0 || isNaN(filters.limit)){
    throw new AppError("Invalid limit value", 400);
  }
  if (filters.page > totalPages){
    throw new AppError("Page number exceeds total pages", 400);
  }
}

// Service to get listings with filters and pagination
async function listingService(filters){
  filterValidation(filters);
  const offset = (filters.page - 1) * filters.limit;

  const listings = await findAll(filters, offset);

  const total = listings.count;
  const totalPages = Math.ceil(total / filters.limit);
  pageValidation(filters, totalPages);// validate after totalPages is calculated
  const page = filters.page;

  return {
    listings: listings.rows,
    count: total,
    totalPages,
    page
  };
}

// Validation for ID
const idVarification = (id) => {
  if (isNaN(id) || id <= 0){
    throw new AppError('Invalid Listing ID', 400);
  }
}

// Service to get listing by ID
async function listingServiceById(id) {
  idVarification(id);
  const listing = await findById(id);
  if (!listing){
    throw new AppError('Listing does not exist', 404);
  }
  return listing;
}

// Validation for new listing data
function postValidation(newListing){ 
  if (!newListing.title || !newListing.type || !newListing.city || !newListing.area || !newListing.price || !newListing.owner_id){
    throw new AppError('Missing required listing fields', 400);
  }
  if (newListing.price === undefined || newListing.price === null){
    throw new AppError('Invalid price value', 400);
  }
  if (typeof newListing.is_available !== 'boolean' && newListing.is_available !== undefined){
    throw new AppError('is_available must be a boolean', 400);
  }
  if (isNaN(newListing.owner_id) || newListing.owner_id <=0){
    throw new AppError('Invalid owner_id value', 400);
  }
}

// Service to create a new listing
const postListingService = async (newListing) => {
  postValidation(newListing);
  const addedListing = await addListing(newListing);
  if(!addedListing){
    throw new AppError('Failed to add new listing', 500);
  }
  return addedListing;
}

// Service to update an existing listing
const updateListingService = async (id, updatedFields) => {
  idVarification(id);
  const listing = await findById(id);
  if (!listing) {
    throw new AppError('Listing does not exist', 404);
  }
  const updatedListing = await updateListing(id, updatedFields);
  return updatedListing;
}

// Service to delete a listing
const deleteListingService = async (id) => {
  idVarification(id);
  const listing = await findById(id);
  if (!listing) {
    throw new AppError('Listing does not exist', 404);
  }
  const deletedListing = await deleteListing(id);
  return deletedListing;
}

module.exports = { 
  listingService, 
  listingServiceById, 
  postListingService,
  updateListingService, 
  deleteListingService
};