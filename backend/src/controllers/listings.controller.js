const {
  listingService
} = require('../services/listings.service');

// Getting all listings with pagination and filters
const getListings = async (req, res, next) => {
  try {
    const filters = {
      q: req.query.q,
      city: req.query.city,
      type: req.query.type,
      priceMin: req.query.priceMin ? Number(req.query.priceMin) : undefined,
      priceMax: req.query.priceMax ? Number(req.query.priceMax) : undefined,
      page: req.query.page || 1,
      limit: req.query.limit || 10
    };
    const listings = await listingService(filters);
    return res.status(200).json({
      status: 'success',
      meta: {
        page: listings.page,
        limit: Number(filters.limit),
        totalItems: listings.count,
        totalPages: listings.totalPages,
      },
      data: listings.listings
    });
  } catch (error) {
    next(error);
  }
}


const { listingServiceById } = require('../services/owner.services');

const getListingById = async (req, res, next) => {
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