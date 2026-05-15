const express = require('express');

const {ownerListingsController, 
  getListingsById,
  postListings, 
  updateListing,
  deleteListing,
  publishListing,
  archiveListing
} = require('../controllers/owner.controller');

const requireAuth = require('../middlewares/requireAuth');
const requireRole = require('../middlewares/requireRole');

const router = express.Router();

router.get('/owner-listings', requireAuth, requireRole('owner', 'admin'),ownerListingsController);

router.get('/:id', getListingsById);

router.post('/', requireAuth, requireRole('owner', 'admin'), postListings);

router.patch('/:id',requireAuth, requireRole('owner', 'admin'), updateListing);

router.delete('/:id',requireAuth, requireRole('owner', 'admin'), deleteListing);

router.patch('/:id/publish', requireAuth, requireRole('owner', 'admin'), publishListing);

router.patch('/:id/archive', requireAuth, requireRole('owner', 'admin'), archiveListing);

module.exports = router;