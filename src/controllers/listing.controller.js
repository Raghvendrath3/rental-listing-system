const {
  listingService, 
  listingServiceById, 
  postListingService, 
  updateListingService, 
  deleteListingService
} = require('../services/listing.service');

// Getting all listings with pagination and filters
const getListings = async (req, res, next) => {
  try {
    const filters = {
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

// Getting a listing by ID
const getListingsById = async (req, res, next) => {
  try {
    const listingId = Number(req.params.id);
    const listings = await listingServiceById(listingId);

     // Check if listings is null, undefined, or an empty array
    if (!listings || (Array.isArray(listings) && listings.length === 0)) {
      return res.status(404).json({
        status: 'fail',
        message: 'No listings found matching your criteria'
      });
    }

    res.status(200).json({
      status: 'success',
      data: listings
    })
  }catch (error) {
    next(error);
  }
}

// Creating a new listing
const postListings = async (req, res, next) => {
  try {
    const newListing = {
      title: req.body.title,
      type: req.body.type,
      city: req.body.city,
      area: req.body.area,
      price: req.body.price,
      is_available: req.body.is_available || true,
      owner_id: req.body.owner_id
    };
    const listings = await postListingService(newListing);
    res.status(201).json({
      status: 'success',
      data: listings
    });
  } catch (error) {
    next(error);
  }
}

// Updating an existing listing
const updateListing = async (req, res, next) => {
  try {
    const listingId = Number(req.params.id);
    const updatedFields = {
      title: req.body.title,
      type: req.body.type,
      city: req.body.city,
      price: req.body.price,
      area: req.body.area,
      is_available: req.body.is_available
    }
    const updatedListing = await updateListingService(listingId, updatedFields);

    res.status(200).json({
      status: 'success',
      data: updatedListing
    });
  } catch (error) {
    next(error);
  }
}

// Deleting a listing
const deleteListing = async (req, res, next) => {
  try {
    const listingId = Number(req.params.id);
    const deletedListing = await deleteListingService(listingId);

    res.status(200).json({
      status: 'success',
      data: deletedListing
    });
  } catch (error) {
    next(error);
  }
}


module.exports = { 
  getListings, 
  getListingsById, 
  postListings, 
  updateListing, 
  deleteListing
};