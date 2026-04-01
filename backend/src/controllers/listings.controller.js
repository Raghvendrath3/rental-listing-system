const {
  listingService, 
  listingServiceById, 
  postListingService, 
  updateListingService, 
  deleteListingService,
  publishListingService,
  archiveListingService
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
    const actor = {
      id: req.user.id,
      role: req.user.role
    };
    const payload = req.body.payload;
    const newListing = {
      title: payload.title,
      type: payload.type,
      city: payload.city,
      area: payload.area,
      price: payload.price,
      is_available: payload.is_available || true,
      owner_id: actor.id
    };
    const listings = await postListingService(actor, newListing);
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
    const actor = {
      id: req.user.id,
      role: req.user.role
    }
    const listingId = Number(req.params.id);
    const updatedFields = {
      title: req.body.title,
      type: req.body.type,
      city: req.body.city,
      price: req.body.price,
      area: req.body.area,
      is_available: req.body.is_available
    }
    const updatedListing = await updateListingService(listingId, updatedFields, actor);

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
    const actor = {
      id: req.user.id,
      role: req.user.role
    }
    const listingId = Number(req.params.id);
    const deletedListing = await deleteListingService(listingId, actor);

    res.status(200).json({
      status: 'success',
      data: deletedListing
    });
  } catch (error) {
    next(error);
  }
}

// publish listing controller

async function publishListing(req, res, next){
  try {
    const actor = {
      id: req.user.id,
      role: req.user.role
    }
    const listingId = Number(req.params.id);
    const publishListing = await publishListingService(listingId, actor);

    res.status(200).json({
      status: 'success',
      data: publishListing
    });
  } catch (error) {
    next(error);
  }
}

//archieve listing controller

async function archiveListing(req, res, next){
  try {
    const actor = {
      id: req.user.id,
      role: req.user.role
    }
    const listingId = Number(req.params.id);
    const archiveListing = await archiveListingService(listingId, actor);

    res.status(200).json({
      status: 'success',
      data: archiveListing
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
  deleteListing,
  publishListing,
  archiveListing
};