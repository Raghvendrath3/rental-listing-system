const {pool} = require('../config/db');
const AppErrors = require('../errors/AppErrors');

async function postUsersReposetory(newUser) {
  const { email, password } = newUser;
  console.log("le bete",email, password);
  const query = 'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING *';
  const values = [email, password, 'user'];

  const result = await pool.query(query, values);
  return result.rows[0];
}

async function findUserByEmail(email) {
  const query = 'SELECT * FROM users WHERE email = $1';
  const values = [email];
  const result = await pool.query(query, values);
  return result.rows[0];
}

async function findUserById(id) {
  const query = 'SELECT * FROM users WHERE id = $1';
  const values = [id];
  const result = await pool.query(query, values);
  return result.rows[0];
}

async function becomeOwner(id) {
  const newRole = 'owner';
  const query = 'UPDATE users SET role = $1 WHERE id = $2 RETURNING *';
  const values = [newRole, id];
  const result = await pool.query(query, values);
  return result.rows[0];
}

async function getUserProfile(id) {
  const query = 'SELECT id, email, role, created_at FROM users WHERE id = $1';
  const values = [id];
  const result = await pool.query(query, values);
  return result.rows[0];
}

async function updateUserProfile(id, updateData) {
  const { password_hash } = updateData;
  
  if (password_hash) {
    const query = 'UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING id, email, role, created_at';
    const values = [password_hash, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }
  
  return getUserProfile(id);
}

async function getAllUsersRepository(page = 1, limit = 20, role = null, search = null) {
  const offset = (page - 1) * limit;
  let query = 'SELECT id, email, role, created_at FROM users WHERE 1=1';
  const values = [];
  let paramCount = 0;

  if (role && role !== 'all') {
    paramCount++;
    query += ` AND role = $${paramCount}`;
    values.push(role);
  }

  if (search) {
    paramCount++;
    query += ` AND email ILIKE $${paramCount}`;
    values.push(`%${search}%`);
  }

  query += ' ORDER BY created_at DESC LIMIT $' + (paramCount + 1) + ' OFFSET $' + (paramCount + 2);
  values.push(limit, offset);

  const result = await pool.query(query, values);
  return result.rows;
}

async function getUsersCountRepository(role = null, search = null) {
  let query = 'SELECT COUNT(*) as count FROM users WHERE 1=1';
  const values = [];

  if (role && role !== 'all') {
    query += ' AND role = $1';
    values.push(role);
  }

  if (search) {
    const paramIndex = role && role !== 'all' ? 2 : 1;
    query += ` AND email ILIKE $${paramIndex}`;
    values.push(`%${search}%`);
  }

  const result = await pool.query(query, values);
  return parseInt(result.rows[0].count, 10);
}

async function updateUserRoleRepository(id, newRole) {
  const query = 'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, role, created_at';
  const values = [newRole, id];
  const result = await pool.query(query, values);
  return result.rows[0];
}

async function deleteUserRepository(id) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Delete all listings for this user
    await client.query('DELETE FROM listings WHERE owner_id = $1', [id]);
    
    // Delete all owner requests for this user
    await client.query('DELETE FROM owner_requests WHERE user_id = $1', [id]);
    
    // Delete the user
    const query = 'DELETE FROM users WHERE id = $1 RETURNING id, email';
    const result = await client.query(query, [id]);
    
    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  postUsersRepository: postUsersReposetory,
  findUserByEmail: findUserByEmail,
  becomeOwner: becomeOwner,
  findUserById: findUserById,
  getUserProfile: getUserProfile,
  updateUserProfile: updateUserProfile,
  getAllUsersRepository: getAllUsersRepository,
  getUsersCountRepository: getUsersCountRepository,
  updateUserRoleRepository: updateUserRoleRepository,
  deleteUserRepository: deleteUserRepository
}
