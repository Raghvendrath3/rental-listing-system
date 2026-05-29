const AppError = require("../errors/AppErrors");
const {
  ownerListingsRepository, 
  findById, 
  addListing, 
  updateListing, 
  deleteListing,
  publishListing,
  archiveListing} = require("../repositories/owner.repository");
const { listingService } = require('./listings.service');
const { assertOwnerOrAdmin } = require('./authorization'); // Fix: was called in updateListingService/deleteListingService but never imported

async function getOwnerListingsService(ownerId) {
  try {
    const result = await ownerListingsRepository(ownerId);

    return {
      status: "success",
      result: result ?? []
    };

  } catch (error) {
    throw new AppError("Failed to fetch owner listings", 404);
  }
}

// Service to get listings for an owner
async function ownerListingService(filters, ownerId) {
  filters.owner_id = ownerId;
  filters.ignoreStatus = true; // Owner can see draft, published, archived
  return listingService(filters);
}

// Service to get all listings for an admin
async function adminListingService(filters) {
  filters.ignoreStatus = true; // Admin can see all listings
  return listingService(filters);
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
  const addedListing = await addListing(newListing);
  if(!addedListing){
    throw new AppError('Failed to add new listing', 500);
  }
  return addedListing;
}

// Service to update an existing listing
const updateListingService = async (id, updatedFields, actor) => {
  idVarification(id);
  const listing = await findById(id);

  if (!listing) {
    throw new AppError('Listing does not exist', 404);
  }

  assertOwnerOrAdmin(listing, actor, 'listing'); // This already throws 403 if not owner or admin — no need to check again below

  const updatedListing = await updateListing(id, updatedFields);
  return updatedListing;
}

// Service to delete a listing
const deleteListingService = async (id, actor) => {
  idVarification(id);
  const listing = await findById(id);

  if (!listing) {
    throw new AppError('Listing does not exist', 404);
  }

  assertOwnerOrAdmin(listing, actor, 'listing'); // This already throws 403 if not owner or admin — no need to check again below

  const deletedListing = await deleteListing(id);
  return deletedListing;
}

function listingValidation(listing) {
  if (listing.status !== 'draft') {
    throw new AppError('Internal conflict', 409);
  }
  if (!listing.title || !listing.type || !listing.city || !listing.area || !listing.price || !listing.owner_id) {
    throw new AppError('Missing required listing fields', 400);
  }
  if (listing.price === undefined || listing.price === null) {
    throw new AppError('Invalid price value', 400);
  }
  // Fix: original condition was `typeof !== 'boolean' && is_available == false` — logically impossible to trigger
  // because if is_available is false (boolean), the first check already short-circuits to false.
  // Correct intent: throw only if is_available is defined AND is not a boolean at all.
  if (listing.is_available !== undefined && typeof listing.is_available !== 'boolean') {
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
  const listing = await findById(listingId, actor.role);
  listingExistValidation(listing, actor);
  listingValidation(listing);
  const result = await publishListing(listingId);
  if (!result) { // Fix: repository returns rows[0] (a single object or undefined), not an array — result.length would throw TypeError on undefined
    throw new AppError('internal conflict', 409);
  }
  return result;
}

//archive listing service 

async function archiveListingService(listingId, actor) {
  const listing = await findById(listingId);
  listingExistValidation(listing, actor);
  if (listing.status !== 'published') {
    throw new AppError('internal conflict', 409);
  }
  const result = await archiveListing(listingId);
  if (!result) { // Fix: same as above — repository returns rows[0], not an array
    throw new AppError('internal conflict', 409);
  }
  return result;
}

module.exports = {
  getOwnerListingsService,
  ownerListingService,
  adminListingService, 
  listingServiceById, 
  postListingService,
  updateListingService, 
  deleteListingService,
  publishListingService,
  archiveListingService
};