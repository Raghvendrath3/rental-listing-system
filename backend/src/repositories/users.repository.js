const { query: dbQuery, withDbContext } = require('../config/db');
const AppErrors = require('../errors/AppErrors');

async function postUsersReposetory(newUser) {
  const { email, password, full_name, phone, address } = newUser;

  const query = `INSERT INTO users
    (email, password_hash, role, full_name, phone, address, email_verified)
    VALUES ($1, $2, $3, $4, $5, $6, FALSE) RETURNING *`;
  const values = [email, password, 'user', full_name, phone, address];

  const result = await withDbContext(
    { userRole: 'registration' },
    () => dbQuery(query, values)
  );
  return result.rows[0];
}

async function findUserByEmail(email) {
  const query = 'SELECT * FROM users WHERE LOWER(email) = $1';
  const values = [email];
  const result = await withDbContext(
    { userRole: 'auth_lookup' },
    () => dbQuery(query, values)
  );
  return result.rows[0];
}

async function findUserByOAuth(provider, providerId) {
  const result = await withDbContext(
    { userRole: 'auth_lookup' },
    () => dbQuery(
      'SELECT * FROM users WHERE oauth_provider = $1 AND oauth_provider_id = $2',
      [provider, providerId]
    )
  );
  return result.rows[0];
}

async function createOAuthUser(profile) {
  const result = await withDbContext(
    { userRole: 'oauth_registration' },
    () => dbQuery(
      `INSERT INTO users
        (email, password_hash, role, full_name, email_verified, oauth_provider, oauth_provider_id, avatar_url)
       VALUES ($1, NULL, 'user', $2, TRUE, $3, $4, $5)
       RETURNING *`,
      [profile.email, profile.name || profile.email, profile.provider, profile.providerId, profile.avatarUrl]
    )
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
  findUserByOAuth,
  createOAuthUser,
  findUserById: findUserById,
  countUsers
}