const { pool } = require('../config/db');

async function createRequest(userId) {
  const query = 'INSERT INTO owner_requests (user_id, status) VALUES ($1, $2) RETURNING *';
  const values = [userId, 'pending'];
  const result = await pool.query(query, values);
  return result.rows[0];
}

async function getRequestByUserId(userId, status) {
  let query = 'SELECT * FROM owner_requests WHERE user_id = $1';
  let values = [userId];
  if (status) {
    query += ' AND status = $2';
    values.push(status);
  }
  query += ' ORDER BY created_at DESC LIMIT 1';
  const result = await pool.query(query, values);
  return result.rows[0];
}

async function getAllRequests() {
  const query = `
    SELECT r.id, r.user_id, r.status, r.created_at, u.email 
    FROM owner_requests r
    JOIN users u ON r.user_id = u.id
    ORDER BY r.created_at DESC
  `;
  const result = await pool.query(query);
  return result.rows;
}

async function getRequestById(id) {
  const query = 'SELECT * FROM owner_requests WHERE id = $1';
  const values = [id];
  const result = await pool.query(query, values);
  return result.rows[0];
}

async function updateRequestStatus(id, status) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Update the request status
    const updateReqQuery = 'UPDATE owner_requests SET status = $1 WHERE id = $2 RETURNING *';
    const reqResult = await client.query(updateReqQuery, [status, id]);
    const requestRow = reqResult.rows[0];

    // If approved, update user role
    if (status === 'approved' && requestRow) {
      const updateUserQuery = 'UPDATE users SET role = $1 WHERE id = $2';
      await client.query(updateUserQuery, ['owner', requestRow.user_id]);
    }
    
    await client.query('COMMIT');
    return requestRow;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  createRequest,
  getRequestByUserId,
  getAllRequests,
  getRequestById,
  updateRequestStatus
};
