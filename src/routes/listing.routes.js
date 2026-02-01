const express = require('express');
const {getListings, getListingsById, getEachListings} = require('../controllers/listing.controller');
const {postListings, updateListing, deleteListing} = require('../controllers/listing.controller');

const router = express.Router();

router.get('/', getEachListings);

router.get('/:id', getListingsById);

router.post('/', postListings);

router.patch('/:id', updateListing);

router.delete('/:id', deleteListing);

module.exports = router;