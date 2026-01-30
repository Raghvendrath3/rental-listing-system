const express = require('express');
const {getListings, getListingsById} = require('../controllers/listing.controller');
const {postListings, updateListing, deleteListing} = require('../controllers/listing.controller');

const router = express.Router();

router.get('/', getListings);

router.get('/:id', getListingsById);

router.post('/', postListings);

router.put('/:id', updateListing);

router.delete('/:id', deleteListing);

module.exports = router;