const { countUsers } = require('../repositories/users.repository');
const { findAllUsers } = require('../repositories/admin.repository'); // Fix: was missing import
const { pool } = require('../config/db');

async function getAdminStatsService() {
  const totalUsers = await countUsers();

  const listingsCountResult = await pool.query(`
    SELECT status, COUNT(*) as count 
    FROM listings 
    GROUP BY status
  `);

  let totalListings = 0;
  let publishedListings = 0;
  let draftListings = 0;
  let archivedListings = 0;

  for (const row of listingsCountResult.rows) {
    const qty = parseInt(row.count, 10);
    totalListings += qty;
    if (row.status === 'published') publishedListings = qty;
    else if (row.status === 'draft') draftListings = qty;
    else if (row.status === 'archived') archivedListings = qty;
  }

  return {
    totalUsers,
    totalListings,
    publishedListings,
    draftListings,
    archivedListings
  };
}

async function getAllUsersService() {
  const users = await findAllUsers(); // Fix: was calling findAllUsers() without importing it
  return users;
}

module.exports = {
  getAdminStatsService,
  getAllUsersService
};