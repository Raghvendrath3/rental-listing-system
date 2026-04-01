const {
  findAll, 
  findById, 
  addListing, 
  updateListing, 
  deleteListing,
  publishListing,
  archiveListing
} = require('../repositories/listings.repository');
const AppError = require('../errors/AppErrors');
const { assertOwnerOrAdmin } = require('./authorization');


/**
 * Invariants:
 * - listings.owner_id always references users.id (DB enforced)
 * - only owner or admin may modify a listing
 * - admin may modify any listing
 * - ownership checks live in service layer
 * - role checks for route access live in middleware
 */


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

// Service to create a new listing
const postListingService = async (actor, newListing) => {
  assertOwnerOrAdmin(listing, actor, 'listing');
  const addedListing = await addListing(newListing);
  if(!addedListing){
    throw new AppError('Failed to add new listing', 500);
  }
  return addedListing;
}

// Service to update an existing listing
const updateListingService = async (id, updatedFields, actor) => {
  idVarification(id);
  assertOwnerOrAdmin(listing, actor, 'listing');
  const listing = await findById(id);

  if (actor.role !== "admin" && listing.owner_id !== actor.id) {
    throw new AppError("Not your listing", 403);
  }
  if (!listing) {
    throw new AppError('Listing does not exist', 404);
  }
  const updatedListing = await updateListing(id, updatedFields);
  return updatedListing;
}

// Service to delete a listing
const deleteListingService = async (id, actor) => {
  idVarification(id);
  assertOwnerOrAdmin(listing, actor, 'listing');
  const listing = await findById(id);

  if (actor.role !== "admin" && listing.owner_id !== actor.id) {
    throw new AppError("Not your listing", 403);
  }
  if (!listing) {
    throw new AppError('Listing does not exist', 404);
  }
  const deletedListing = await deleteListing(id);
  return deletedListing;
}

function listingValidation(listing,){
  if (listing.status !== 'draft'){
    throw new AppError('Internal conflict', 409);
  }
  if (!listing.title || !listing.type || !listing.city || !listing.area || !listing.price || !listing.owner_id){
    throw new AppError('Missing required listing fields', 400);
  }
  if (listing.price === undefined || listing.price === null){
    throw new AppError('Invalid price value', 400);
  }
  if (typeof listing.is_available !== 'boolean' && listing.is_available !== undefined && listing.is_available == false){
    throw new AppError('is_available must be a boolean', 400);
  }
}

// listing existance and eligibility to get updated

function listingExistValidation(listing, actor){
  
  if (!listing){
    throw new AppError('listing did not exist', 404);
  }
  if (actor.id !== listing.owner_id && actor.role !== 'admin'){
    throw new AppError('access denied', 403);
  }
}
//publish listing service 

async function publishListingService(listingId, actor) {
  console.log("listing Id:",listingId);
  const listing = await findById(listingId, actor.role);
  console.log("Listings",listing);
  listingExistValidation(listing, actor)
  listingValidation(listing);
  const result = await publishListing(listingId);
  if (result.length == 0){
    throw new AppError('internal conflict', 409);
  }
  return result;

}

//archieve listing service 

async function archiveListingService(listingId, actor) {
  
  const listing =await findById(listingId);
  
  listingExistValidation(listing, actor);
  if (listing.status !== 'published'){
    throw new AppError('internal conflict', 409);
  }
  const result = await archiveListing(listingId);
  if (result.length == 0){
    throw new AppError('internal conflict', 409);
  }
  return result;
}

module.exports = { 
  listingService, 
  listingServiceById, 
  postListingService,
  updateListingService, 
  deleteListingService,
  publishListingService,
  archiveListingService
};