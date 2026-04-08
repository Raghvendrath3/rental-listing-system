const express = require('express');
const {
  submitOwnerRequest,
  checkPendingRequest,
  getPendingOwnerRequests,
  approveOwnerRequest,
  rejectOwnerRequest
} = require('../controllers/ownerRequests.controller');
const requireAuth = require('../middlewares/requireAuth');
const requireRole = require('../middlewares/requireRole');

const router = express.Router();

// Submit owner request (authenticated users only)
router.post('/', requireAuth, submitOwnerRequest);

// Check user's pending request status (authenticated users) - MUST come before GET /
router.get('/check', requireAuth, checkPendingRequest);

// Get all pending owner requests (admin only)
router.get('/', requireAuth, requireRole('admin'), getPendingOwnerRequests);

// Approve owner request (admin only)
router.patch('/:id/approve', requireAuth, requireRole('admin'), approveOwnerRequest);

// Reject owner request (admin only)
router.patch('/:id/reject', requireAuth, requireRole('admin'), rejectOwnerRequest);

module.exports = router;
