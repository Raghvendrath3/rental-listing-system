const AppErrors = require('../errors/AppErrors');
const { pool } = require('../config/db');

/**
 * Get comprehensive admin statistics
 * Returns metrics about users, listings, and owner requests
 */
async function getAdminStatsService() {
  try {
    // Fetch all statistics in parallel
    const [
      userStats,
      listingStats,
      ownerRequestStats,
      usersByRole
    ] = await Promise.all([
      getUserStats(),
      getListingStats(),
      getOwnerRequestStats(),
      getUsersByRoleStats()
    ]);

    return {
      totalUsers: userStats.totalUsers,
      totalListings: listingStats.totalListings,
      publishedListings: listingStats.publishedListings,
      draftListings: listingStats.draftListings,
      archivedListings: listingStats.archivedListings,
      pendingOwnerRequests: ownerRequestStats.pendingRequests,
      approvedOwnerRequests: ownerRequestStats.approvedRequests,
      rejectedOwnerRequests: ownerRequestStats.rejectedRequests,
      usersByRole: usersByRole
    };
  } catch (error) {
    throw new AppErrors('Error fetching admin statistics', 500);
  }
}

/**
 * Get user statistics
 */
async function getUserStats() {
  const query = 'SELECT COUNT(*) as count FROM users';
  const result = await pool.query(query);
  return {
    totalUsers: parseInt(result.rows[0].count, 10)
  };
}

/**
 * Get listing statistics
 */
async function getListingStats() {
  const query = `
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN status = 'published' THEN 1 END) as published,
      COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft,
      COUNT(CASE WHEN status = 'archived' THEN 1 END) as archived
    FROM listings
  `;
  const result = await pool.query(query);
  const row = result.rows[0];

  return {
    totalListings: parseInt(row.total, 10),
    publishedListings: parseInt(row.published, 10),
    draftListings: parseInt(row.draft, 10),
    archivedListings: parseInt(row.archived, 10)
  };
}

/**
 * Get owner request statistics
 */
async function getOwnerRequestStats() {
  const query = `
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
      COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
      COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected
    FROM owner_requests
  `;
  const result = await pool.query(query);
  const row = result.rows[0];

  return {
    pendingRequests: parseInt(row.pending, 10),
    approvedRequests: parseInt(row.approved, 10),
    rejectedRequests: parseInt(row.rejected, 10)
  };
}

/**
 * Get user count by role
 */
async function getUsersByRoleStats() {
  const query = `
    SELECT 
      role,
      COUNT(*) as count
    FROM users
    GROUP BY role
  `;
  const result = await pool.query(query);

  // Initialize with 0 counts
  const stats = {
    user: 0,
    owner: 0,
    admin: 0
  };

  // Fill in actual counts
  result.rows.forEach((row) => {
    stats[row.role] = parseInt(row.count, 10);
  });

  return stats;
}

module.exports = {
  getAdminStatsService
};
