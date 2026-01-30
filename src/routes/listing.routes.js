const express = require('express');
const {getListings, getListingsById} = require('../controllers/listing.controller');

const router = express.Router();

router.get('/', getListings);

router.get('/:id', getListingsById);

module.exports = router;