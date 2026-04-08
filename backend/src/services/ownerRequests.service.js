const AppErrors = require('../errors/AppErrors');
const { findUserById } = require('../repositories/users.repository');
const {
  submitOwnerRequestRepository,
  getPendingRequestByUserRepository,
  getPendingOwnerRequestsRepository,
  getPendingRequestsCountRepository,
  getOwnerRequestByIdRepository,
  approveOwnerRequestRepository,
  rejectOwnerRequestRepository
} = require('../repositories/ownerRequests.repository');

/**
 * Submit owner request service
 * Validates user eligibility and creates a new owner request
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Created owner request
 */
async function submitOwnerRequestService(userId) {
  // Get user details
  const user = await findUserById(userId);
  if (!user) {
    throw new AppErrors('User not found', 404);
  }

  // Check if user is already an owner
  if (user.role === 'owner') {
    throw new AppErrors('User is already an owner', 400);
  }

  // Check if user is admin
  if (user.role === 'admin') {
    throw new AppErrors('Admins cannot become owners', 400);
  }

  // Check if user already has a pending request
  const pendingRequest = await getPendingRequestByUserRepository(userId);
  if (pendingRequest) {
    throw new AppErrors('User already has a pending owner request', 400);
  }

  // Create new owner request
  const newRequest = await submitOwnerRequestRepository(userId);
  return newRequest;
}

/**
 * Get user's pending owner request
 * @param {number} userId - User ID
 * @returns {Promise<Object|null>} Pending request or null
 */
async function checkPendingRequestService(userId) {
  const pendingRequest = await getPendingRequestByUserRepository(userId);
  return {
    has_pending: pendingRequest !== null,
    request_id: pendingRequest?.id || null
  };
}

/**
 * Get all pending owner requests (admin only)
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise<Object>} List of requests with pagination metadata
 */
async function getPendingOwnerRequestsService(page = 1, limit = 20) {
  // Validate pagination
  const validPage = Math.max(1, parseInt(page, 10));
  const validLimit = Math.max(1, Math.min(100, parseInt(limit, 10)));
  const offset = (validPage - 1) * validLimit;

  // Get requests and total count
  const [requests, totalCount] = await Promise.all([
    getPendingOwnerRequestsRepository(validLimit, offset),
    getPendingRequestsCountRepository()
  ]);

  return {
    data: requests,
    meta: {
      page: validPage,
      limit: validLimit,
      totalItems: totalCount,
      totalPages: Math.ceil(totalCount / validLimit)
    }
  };
}

/**
 * Approve owner request (admin)
 * @param {number} requestId - Request ID
 * @param {number} adminId - Admin user ID
 * @returns {Promise<Object>} Updated user data
 */
async function approveOwnerRequestService(requestId, adminId) {
  // Get request details
  const request = await getOwnerRequestByIdRepository(requestId);
  if (!request) {
    throw new AppErrors('Owner request not found', 404);
  }

  if (request.status !== 'pending') {
    throw new AppErrors(`Cannot approve a ${request.status} request`, 400);
  }

  // Approve and update user role
  const updatedUser = await approveOwnerRequestRepository(requestId, adminId);
  return updatedUser;
}

/**
 * Reject owner request (admin)
 * @param {number} requestId - Request ID
 * @param {number} adminId - Admin user ID
 * @param {string} reason - Rejection reason (optional)
 * @returns {Promise<Object>} Updated owner request
 */
async function rejectOwnerRequestService(requestId, adminId, reason = null) {
  // Get request details
  const request = await getOwnerRequestByIdRepository(requestId);
  if (!request) {
    throw new AppErrors('Owner request not found', 404);
  }

  if (request.status !== 'pending') {
    throw new AppErrors(`Cannot reject a ${request.status} request`, 400);
  }

  // Reject the request
  const rejectedRequest = await rejectOwnerRequestRepository(requestId, adminId, reason);
  return rejectedRequest;
}

module.exports = {
  submitOwnerRequestService,
  checkPendingRequestService,
  getPendingOwnerRequestsService,
  approveOwnerRequestService,
  rejectOwnerRequestService
};
