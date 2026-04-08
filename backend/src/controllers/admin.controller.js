const { getAdminStatsService } = require('../services/admin.service');

/**
 * Get comprehensive admin statistics
 * GET /admin/stats
 */
async function getAdminStats(req, res, next) {
  try {
    const stats = await getAdminStatsService();

    res.status(200).json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAdminStats
};
