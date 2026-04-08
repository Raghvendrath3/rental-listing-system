const { pool } = require('../config/db');
const AppErrors = require('../errors/AppErrors');

/**
 * Submit a new owner request
 * @param {number} userId - User ID requesting to become owner
 * @returns {Promise<Object>} Created owner request
 */
async function submitOwnerRequestRepository(userId) {
  const query = `
    INSERT INTO owner_requests (user_id, status, requested_at)
    VALUES ($1, $2, CURRENT_TIMESTAMP)
    RETURNING id, user_id, status, requested_at
  `;
  const values = [userId, 'pending'];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new AppErrors('Error creating owner request', 500);
  }
}

/**
 * Check if user has a pending owner request
 * @param {number} userId - User ID
 * @returns {Promise<Object|null>} Pending owner request or null
 */
async function getPendingRequestByUserRepository(userId) {
  const query = `
    SELECT id, user_id, status, requested_at
    FROM owner_requests
    WHERE user_id = $1 AND status = 'pending'
    LIMIT 1
  `;
  const values = [userId];

  try {
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  } catch (error) {
    throw new AppErrors('Error fetching pending request', 500);
  }
}

/**
 * Get all pending owner requests with user details (admin only)
 * @param {number} limit - Items per page
 * @param {number} offset - Pagination offset
 * @returns {Promise<Array>} List of pending requests with user emails
 */
async function getPendingOwnerRequestsRepository(limit = 20, offset = 0) {
  const query = `
    SELECT 
      or.id,
      or.user_id,
      u.email,
      or.status,
      or.requested_at
    FROM owner_requests or
    JOIN users u ON or.user_id = u.id
    WHERE or.status = 'pending'
    ORDER BY or.requested_at DESC
    LIMIT $1 OFFSET $2
  `;
  const values = [limit, offset];

  try {
    const result = await pool.query(query, values);
    return result.rows;
  } catch (error) {
    throw new AppErrors('Error fetching pending requests', 500);
  }
}

/**
 * Get total count of pending owner requests
 * @returns {Promise<number>} Count of pending requests
 */
async function getPendingRequestsCountRepository() {
  const query = `
    SELECT COUNT(*) as count
    FROM owner_requests
    WHERE status = 'pending'
  `;

  try {
    const result = await pool.query(query);
    return parseInt(result.rows[0].count, 10);
  } catch (error) {
    throw new AppErrors('Error fetching request count', 500);
  }
}

/**
 * Get owner request by ID
 * @param {number} requestId - Request ID
 * @returns {Promise<Object>} Owner request details
 */
async function getOwnerRequestByIdRepository(requestId) {
  const query = `
    SELECT 
      or.id,
      or.user_id,
      or.status,
      or.requested_at,
      or.reviewed_at,
      or.reviewed_by,
      or.rejection_reason,
      u.email
    FROM owner_requests or
    JOIN users u ON or.user_id = u.id
    WHERE or.id = $1
  `;
  const values = [requestId];

  try {
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  } catch (error) {
    throw new AppErrors('Error fetching owner request', 500);
  }
}

/**
 * Approve owner request (updates request status and user role in transaction)
 * @param {number} requestId - Request ID
 * @param {number} adminId - Admin user ID approving the request
 * @returns {Promise<Object>} Updated user data
 */
async function approveOwnerRequestRepository(requestId, adminId) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Get the owner request
    const requestQuery = `
      SELECT user_id FROM owner_requests WHERE id = $1 AND status = 'pending'
    `;
    const requestResult = await client.query(requestQuery, [requestId]);

    if (requestResult.rows.length === 0) {
      throw new AppErrors('Owner request not found or already processed', 404);
    }

    const userId = requestResult.rows[0].user_id;

    // Update owner_requests status to approved
    const updateRequestQuery = `
      UPDATE owner_requests
      SET status = 'approved', reviewed_at = CURRENT_TIMESTAMP, reviewed_by = $1
      WHERE id = $2
      RETURNING id, status
    `;
    await client.query(updateRequestQuery, [adminId, requestId]);

    // Update user role to owner
    const updateUserQuery = `
      UPDATE users
      SET role = 'owner'
      WHERE id = $1
      RETURNING id, email, role, created_at
    `;
    const userResult = await client.query(updateUserQuery, [userId]);

    await client.query('COMMIT');

    return userResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    if (error instanceof AppErrors) {
      throw error;
    }
    throw new AppErrors('Error approving owner request', 500);
  } finally {
    client.release();
  }
}

/**
 * Reject owner request
 * @param {number} requestId - Request ID
 * @param {number} adminId - Admin user ID rejecting the request
 * @param {string} reason - Rejection reason (optional)
 * @returns {Promise<Object>} Updated owner request
 */
async function rejectOwnerRequestRepository(requestId, adminId, reason = null) {
  const query = `
    UPDATE owner_requests
    SET status = 'rejected', reviewed_at = CURRENT_TIMESTAMP, reviewed_by = $1, rejection_reason = $2
    WHERE id = $3 AND status = 'pending'
    RETURNING id, user_id, status, rejection_reason
  `;
  const values = [adminId, reason, requestId];

  try {
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      throw new AppErrors('Owner request not found or already processed', 404);
    }
    return result.rows[0];
  } catch (error) {
    if (error instanceof AppErrors) {
      throw error;
    }
    throw new AppErrors('Error rejecting owner request', 500);
  }
}

module.exports = {
  submitOwnerRequestRepository,
  getPendingRequestByUserRepository,
  getPendingOwnerRequestsRepository,
  getPendingRequestsCountRepository,
  getOwnerRequestByIdRepository,
  approveOwnerRequestRepository,
  rejectOwnerRequestRepository
};
