const { query: dbQuery, withTransaction } = require('../config/db');
const AppError = require('../errors/AppErrors');

async function createRequest(userId, details) {
  const { property_type, location, reason } = details || {};
  const query = 'INSERT INTO owner_requests (user_id, status, property_type, location, reason) VALUES ($1, $2, $3, $4, $5) RETURNING *';
  const values = [userId, 'pending', property_type, location, reason];
  const result = await dbQuery(query, values);
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
  const result = await dbQuery(query, values);
  return result.rows[0];
}

async function getAllRequests() {
  const query = `
    SELECT r.id, r.user_id, r.status, r.created_at, u.email, r.property_type, r.location, r.reason
    FROM owner_requests r
    JOIN users u ON r.user_id = u.id
    ORDER BY r.created_at DESC
  `;
  const result = await dbQuery(query);
  return result.rows;
}

async function updateRequestStatus(id, status) {
  return withTransaction(async client => {
    const currentResult = await client.query(
      'SELECT * FROM owner_requests WHERE id = $1 FOR UPDATE',
      [id]
    );
    const currentRequest = currentResult.rows[0];
    if (!currentRequest) {
      throw new AppError('Request not found', 404);
    }
    if (currentRequest.status !== 'pending') {
      throw new AppError(`Request is already ${currentRequest.status}`, 400);
    }

    const updateReqQuery = `UPDATE owner_requests
      SET status = $1
      WHERE id = $2 AND status = 'pending'
      RETURNING *`;
    const reqResult = await client.query(updateReqQuery, [status, id]);
    const requestRow = reqResult.rows[0];
    if (!requestRow) {
      throw new AppError('Request is no longer pending', 409);
    }

    if (status === 'approved') {
      const updateUserQuery = 'UPDATE users SET role = $1 WHERE id = $2';
      await client.query(updateUserQuery, ['owner', requestRow.user_id]);
    }
    return requestRow;
  });
}

module.exports = {
  createRequest,
  getRequestByUserId,
  getAllRequests,
  updateRequestStatus
};
