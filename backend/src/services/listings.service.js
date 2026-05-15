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

// Validates page and limit values — called BEFORE DB access so invalid
// values never reach the query (negative OFFSET would cause a DB error -> 500)
function paginationInputValidation(filters) {
  if (filters.page < 1 || isNaN(filters.page)) {
    throw new AppError("Invalid page number", 400);
  }
  if (filters.limit < 1 || isNaN(filters.limit) || filters.limit > 100) {
    throw new AppError("Invalid limit value", 400);
  }
}

// Validates page against total pages — called AFTER DB count is known.
// Skipped when DB is empty (totalPages === 0) so a valid request against
// an empty table doesn't get rejected.
function paginationBoundsValidation(filters, totalPages) {
  if (totalPages > 0 && filters.page > totalPages) {
    throw new AppError("Page number exceeds total pages", 400);
  }
}

// Service to get listings with filters and pagination
async function listingService(filters){
  // Query params arrive as strings — coerce to numbers before any comparison
  filters.page  = Number(filters.page);
  filters.limit = Number(filters.limit);

  // Validate inputs BEFORE computing offset or hitting the DB
  paginationInputValidation(filters);
  filterValidation(filters);

  const offset = (filters.page - 1) * filters.limit;
  const listings = await findAll(filters, offset);

  const total = listings.count;
  const totalPages = Math.ceil(total / filters.limit);

  // Now that we know totalPages, check the upper bound
  paginationBoundsValidation(filters, totalPages);

  return {
    listings: listings.rows,
    count: total,
    totalPages,
    page: filters.page
  };
}

module.exports = { 
  listingService
};