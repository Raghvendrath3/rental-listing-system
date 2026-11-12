const { query: dbQuery } = require('../config/db');

async function createInquiry(tenantId, listingId, message) {
  const query = `
    INSERT INTO inquiries (tenant_id, listing_id, message)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  const result = await dbQuery(query, [tenantId, listingId, message]);
  return result.rows[0];
}

async function findInquiriesByTenantId(tenantId) {
  const query = `
    SELECT i.*, l.title AS listing_title
    FROM inquiries i
    JOIN listings l ON i.listing_id = l.id
    WHERE i.tenant_id = $1
    ORDER BY i.created_at DESC
  `;
  const result = await dbQuery(query, [tenantId]);
  return result.rows;
}

async function findInquiriesByOwnerId(ownerId) {
  const query = `
    SELECT i.*, l.title AS listing_title, u.full_name AS tenant_name, u.email AS tenant_email, u.phone AS tenant_phone
    FROM inquiries i
    JOIN listings l ON i.listing_id = l.id
    JOIN users u ON i.tenant_id = u.id
    WHERE l.owner_id = $1
    ORDER BY i.created_at DESC
  `;
  const result = await dbQuery(query, [ownerId]);
  return result.rows;
}

module.exports = {
  createInquiry,
  findInquiriesByTenantId,
  findInquiriesByOwnerId
};
