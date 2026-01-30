const {listingService, listingServiceById} = require('../services/listing.service');

const getListings = async (req, res, next) => {
  try {
    const filters = {
    city: req.query.city,
    type: req.query.type,
    minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
    maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined
  };
  const listings =  listingService(filters);

  res.status(200).json({
    status: 'success',
    results: listings.length,
    data: listings
  });
  } catch (error) {
    next(error);
  }
}

const getListingsById = async (req, res, next) => {
  try {
    const listingId = Number(req.params.id);
    const listings = listingServiceById(listingId);

    res.status(200).json({
      status: 'success',
      data: listings
    })
  }catch (error) {
    next(error);
  }
}


module.exports = { getListings, getListingsById };