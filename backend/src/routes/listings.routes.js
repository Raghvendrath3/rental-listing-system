const express = require('express');
const { getListings } = require('../controllers/listings.controller'); // Fix: only getListings exists in listings.controller — the other functions (getListingsById, postListings, updateListing, deleteListing, publishListing, archiveListing) don't exist here, they live in owner.controller and are already registered under /api/v1/owner

const router = express.Router();

router.get('/', getListings);

module.exports = router;