const {
  listingService
} = require('../services/listings.service');
const {
  createCacheKey,
  getPublicListings,
  setPublicListings
} = require('../services/publicListingsCache');

// Getting all listings with pagination and filters
const getListings = async (req, res, next) => {
  const isAnonymous = !req.get('Authorization') && !req.get('Cookie');
  res.vary('Authorization');
  res.vary('Cookie');
  res.set(
    'Cache-Control',
    isAnonymous ? 'public, s-maxage=30, stale-while-revalidate=120' : 'private, no-store'
  );

  try {
    const filters = {
      q: req.query.q ? String(req.query.q).trim().toLowerCase() : undefined,
      city: req.query.city ? String(req.query.city).trim().toLowerCase() : undefined,
      type: req.query.type ? String(req.query.type).trim().toLowerCase() : undefined,
      priceMin: req.query.priceMin !== undefined ? Number(req.query.priceMin) : undefined,
      priceMax: req.query.priceMax !== undefined ? Number(req.query.priceMax) : undefined,
      page: req.query.page ?? 1,
      limit: req.query.limit ?? 10
    };
    const cacheKey = createCacheKey(filters);
    if (isAnonymous) {
      const cachedResponse = getPublicListings(cacheKey);
      if (cachedResponse) return res.status(200).json(cachedResponse);
    }

    const listings = await listingService(filters);
    const response = {
      status: 'success',
      meta: {
        page: listings.page,
        limit: Number(filters.limit),
        totalItems: listings.count,
        totalPages: listings.totalPages,
      },
      data: listings.listings
    };
    if (isAnonymous) setPublicListings(cacheKey, response);
    return res.status(200).json(response);
  } catch (error) {
    res.set('Cache-Control', 'private, no-store');
    next(error);
  }
}


const { listingServiceById } = require('../services/owner.services');

const getListingById = async (req, res, next) => {
  res.set('Cache-Control', 'private, no-store');
  res.vary('Authorization');
  res.vary('Cookie');
  try {
    const listingId = Number(req.params.id);
    const actor = {
      id: req.user.id,
      role: req.user.role
    };
    const listing = await listingServiceById(listingId, actor);

    if (!listing) {
      return res.status(404).json({
        status: 'fail',
        message: 'No listing found with that ID'
      });
    }

    res.status(200).json({
      status: 'success',
      data: listing
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  getListings,
  getListingById
};