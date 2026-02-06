const {pool} = require('../config/db');
const AppErrors = require('../errors/AppErrors');

async function postUsersReposetory(newUser) {
  const { email, password_hash } = newUser;
  const query = 'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING *';
  const values = [email, password_hash, 'user'];

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

module.exports = {
  postUsersRepository: postUsersReposetory,
  findUserByEmail: findUserByEmail,
  becomeOwner: becomeOwner,
  findUserById: findUserById
}