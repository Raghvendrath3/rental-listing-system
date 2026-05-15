const requestsRepository = require('../repositories/requests.repository');
const AppError = require('../errors/AppErrors');
const { findUserById } = require('../repositories/users.repository');

async function submitOwnerRequestService(actor) {
  // Check if they are already an owner/admin
  if (actor.role !== 'user') {
    throw new AppError('Only standard users can request to become an owner', 400);
  }

  // Check if there is already a pending request
  const pendingRequest = await requestsRepository.getRequestByUserId(actor.id, 'pending');
  if (pendingRequest) {
    throw new AppError('You already have a pending owner request', 409);
  }

  const result = await requestsRepository.createRequest(actor.id);
  return result;
}

async function getAllRequestsService() {
  const requests = await requestsRepository.getAllRequests();
  return requests;
}

async function approveRequestService(requestId) {
  const request = await requestsRepository.getRequestById(requestId);
  if (!request) {
    throw new AppError('Request not found', 404);
  }
  if (request.status !== 'pending') {
    throw new AppError(`Request is already ${request.status}`, 400);
  }

  const updatedRequest = await requestsRepository.updateRequestStatus(requestId, 'approved');
  return updatedRequest;
}

async function rejectRequestService(requestId) {
  const request = await requestsRepository.getRequestById(requestId);
  if (!request) {
    throw new AppError('Request not found', 404);
  }
  if (request.status !== 'pending') {
    throw new AppError(`Request is already ${request.status}`, 400);
  }

  const updatedRequest = await requestsRepository.updateRequestStatus(requestId, 'rejected');
  return updatedRequest;
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
