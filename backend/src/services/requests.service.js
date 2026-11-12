const requestsRepository = require('../repositories/requests.repository');
const AppError = require('../errors/AppErrors');
const { findUserById } = require('../repositories/users.repository');

async function submitOwnerRequestService(actor, details) {
  // Check if they are already an owner/admin
  if (actor.role !== 'user') {
    throw new AppError('Only standard users can request to become an owner', 400);
  }

  // Validate request details
  const { property_type, location, reason } = details || {};
  if (!property_type || typeof property_type !== 'string' || property_type.trim() === '') {
    throw new AppError('Property type is required', 400);
  }
  if (!location || typeof location !== 'string' || location.trim() === '') {
    throw new AppError('Location is required', 400);
  }
  if (!reason || typeof reason !== 'string' || reason.trim() === '') {
    throw new AppError('Reason is required', 400);
  }

  // Check if there is already a pending request
  const pendingRequest = await requestsRepository.getRequestByUserId(actor.id, 'pending');
  if (pendingRequest) {
    throw new AppError('You already have a pending owner request', 409);
  }

  const result = await requestsRepository.createRequest(actor.id, { property_type, location, reason });
  return result;
}

async function getAllRequestsService() {
  const requests = await requestsRepository.getAllRequests();
  return requests;
}

async function approveRequestService(requestId) {
  return requestsRepository.updateRequestStatus(requestId, 'approved');
}

async function rejectRequestService(requestId) {
  return requestsRepository.updateRequestStatus(requestId, 'rejected');
}

// Function to fetch status for profile page
async function getUserOwnerRequestStatus(userId) {
  const request = await requestsRepository.getRequestByUserId(userId);
  if (!request) return { status: 'none' };
  return { status: request.status, created_at: request.created_at };
}

module.exports = {
  submitOwnerRequestService,
  getAllRequestsService,
  approveRequestService,
  rejectRequestService,
  getUserOwnerRequestStatus
};
