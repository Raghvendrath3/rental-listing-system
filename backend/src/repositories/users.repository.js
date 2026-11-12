const { query: dbQuery, withDbContext } = require('../config/db');
const AppErrors = require('../errors/AppErrors');

async function postUsersReposetory(newUser) {
  const { email, password, full_name, phone, address } = newUser;

  const query = 'INSERT INTO users (email, password_hash, role, full_name, phone, address) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
  const values = [email, password, 'user', full_name, phone, address];

  const result = await withDbContext(
    { userRole: 'registration' },
    () => dbQuery(query, values)
  );
  return result.rows[0];
}

async function findUserByEmail(email) {
  const query = 'SELECT * FROM users WHERE email = $1';
  const values = [email];
  const result = await withDbContext(
    { userRole: 'auth_lookup' },
    () => dbQuery(query, values)
  );
  return result.rows[0];
}

async function findUserById(id) {
  const query = 'SELECT * FROM users WHERE id = $1';
  const values = [id];
  const result = await dbQuery(query, values);
  return result.rows[0];
}

async function countUsers() {
  const result = await dbQuery('SELECT COUNT(*) FROM users');
  return parseInt(result.rows[0].count, 10);
}

module.exports = {
  postUsersRepository: postUsersReposetory,
  findUserByEmail: findUserByEmail,
  findUserById: findUserById,
  countUsers
}