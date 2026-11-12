const express = require('express');
const { getListings, getListingById } = require('../controllers/listings.controller');
const requireAuth = require('../middlewares/requireAuth');
const requireRole = require('../middlewares/requireRole');

const router = express.Router();

router.get('/', getListings);
router.get('/:id', requireAuth, requireRole('user', 'owner', 'admin'), getListingById);

module.exports = router;