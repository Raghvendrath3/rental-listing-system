const { getAllRequestsService, approveRequestService, rejectRequestService } = require('../services/requests.service');
const { getAdminStatsService, getAllUsersService } = require('../services/admin.service');

async function getRequests(req, res, next) {
  try {
    const requests = await getAllRequestsService();
    res.status(200).json({ status: 'success', data: requests });
  } catch (error) {
    next(error);
  }
}

async function approveRequest(req, res, next) {
  try {
    const requestId = req.params.id;
    const result = await approveRequestService(requestId);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
}

async function rejectRequest(req, res, next) {
  try {
    const requestId = req.params.id;
    const result = await rejectRequestService(requestId);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
}

async function getAllUsers(req, res, next) {
  try {
    const users = await getAllUsersService();
    res.status(200).json({ status: 'success', data: users });
  } catch (error) {
    next(error);
  }
}

async function getStats(req, res, next) {
  try {
    const stats = await getAdminStatsService();
    res.status(200).json({ status: 'success', data: stats });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getRequests,
  approveRequest,
  rejectRequest,
  getAllUsers,
  getStats
};