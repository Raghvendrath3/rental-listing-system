const {pool} = require('../config/db');
const AppErrors = require('../errors/AppErrors');

async function findAllUsers() {
  const result = await pool.query('SELECT id, email, role, created_at FROM users ORDER BY created_at DESC');
  return result.rows;
}

module.exports = {
  findAllUsers
}