const express = require('express');
const {getListings, getListingsById} = require('../controllers/listings.controller');
const {
  postListings, 
  updateListing, 
  deleteListing,
  publishListing,
  archiveListing
} = require('../controllers/listings.controller');
const requireAuth = require('../middlewares/requireAuth');
const requireRole = require('../middlewares/requireRole');

const router = express.Router();

router.get('/', getListings);

router.get('/:id', getListingsById);

router.post('/', requireAuth, requireRole('owner', 'admin'), postListings);

router.patch('/:id',requireAuth, requireRole('owner', 'admin'), updateListing);

router.delete('/:id',requireAuth, requireRole('owner', 'admin'), deleteListing);

router.patch('/:id/publish', requireAuth, requireRole('owner', 'admin'), publishListing);

router.patch('/:id/archive', requireAuth, requireRole('owner', 'admin'), archiveListing);

module.exports = router;