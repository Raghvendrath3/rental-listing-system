const {
  submitOwnerRequestService,
  checkPendingRequestService,
  getPendingOwnerRequestsService,
  approveOwnerRequestService,
  rejectOwnerRequestService
} = require('../services/ownerRequests.service');

/**
 * Submit a request to become owner
 * POST /owner-requests
 */
async function submitOwnerRequest(req, res, next) {
  try {
    const userId = req.user.id;
    const newRequest = await submitOwnerRequestService(userId);

    res.status(201).json({
      status: 'success',
      data: newRequest
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Check if user has a pending owner request
 * GET /owner-requests/check
 */
async function checkPendingRequest(req, res, next) {
  try {
    const userId = req.user.id;
    const result = await checkPendingRequestService(userId);

    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all pending owner requests (admin only)
 * GET /owner-requests
 */
async function getPendingOwnerRequests(req, res, next) {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 20;

    const result = await getPendingOwnerRequestsService(page, limit);

    res.status(200).json({
      status: 'success',
      data: result.data,
      meta: result.meta
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Approve an owner request (admin only)
 * PATCH /owner-requests/:id/approve
 */
async function approveOwnerRequest(req, res, next) {
  try {
    const requestId = req.params.id;
    const adminId = req.user.id;

    const updatedUser = await approveOwnerRequestService(requestId, adminId);

    res.status(200).json({
      status: 'success',
      message: `User with email ${updatedUser.email} has been promoted to owner.`,
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Reject an owner request (admin only)
 * PATCH /owner-requests/:id/reject
 */
async function rejectOwnerRequest(req, res, next) {
  try {
    const requestId = req.params.id;
    const adminId = req.user.id;
    const { reason } = req.body;

    const rejectedRequest = await rejectOwnerRequestService(requestId, adminId, reason);

    res.status(200).json({
      status: 'success',
      message: 'Owner request has been rejected.',
      data: rejectedRequest
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  submitOwnerRequest,
  checkPendingRequest,
  getPendingOwnerRequests,
  approveOwnerRequest,
  rejectOwnerRequest
};
