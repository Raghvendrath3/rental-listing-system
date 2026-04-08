const {postUsersRepository, findUserByEmail, becomeOwner, findUserById, getUserProfile, updateUserProfile, getAllUsersRepository, getUsersCountRepository, updateUserRoleRepository, deleteUserRepository} = require('../repositories/users.repository')
const AppErrors = require('../errors/AppErrors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

function validateUser(newUser) {
  const { email, password } = newUser;

  // 1. Validate Email
  if (!email || email.trim() === '') {
    throw new AppErrors('Email is required', 400);
  }
  // Standard regex for format: user@domain.extension
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    throw new AppErrors('Invalid email format', 400);
  }

  // 2. Validate Password
  if (!password) {
    throw new AppErrors('Password is required', 400);
  }
  /**
   * Password Requirements:
   * ^(?=.*[a-z]) : At least one lowercase letter
   * (?=.*[A-Z])  : At least one uppercase letter
   * (?=.*\d)     : At least one number
   * (?=.*[\W_])  : At least one special character (symbol)
   * {8,}         : Minimum 8 characters long
   */
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  
  if (!passwordRegex.test(password)) {
    throw new AppErrors(
      'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a symbol.', 400
    );
  }

  return true; // Both are valid
}

async function passwordHash(password){
  try {
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    throw new AppErrors('Error hashing password', 500);
  }
}
async function postUsersService(newUser){
  validateUser(newUser);
  newUser.password = await passwordHash(newUser.password);
  console.log("Hashed password:", newUser);
  const createdUser = await postUsersRepository(newUser);
  return createdUser;
}

function generateJWT(user) {
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  return token;
}

async function loginService(loginDetails){
  const { email, password } = loginDetails;
  validateUser(loginDetails);
  const user = await findUserByEmail(email);
  if (!user) {
    throw new AppErrors('Invalid email or password', 401);
  }
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    throw new AppErrors('Invalid email or password', 401);
  }
  const jwtToken = generateJWT(user);
  return jwtToken + '|' + user.id + '|' + user.role; // Return token along with user info
}

async function becomeOwnerService(actor) {
  const user = await findUserById(actor.id);
  if (user.role !== 'user') {
    throw new AppErrors('User is not eligible to become an owner', 400);
  }
  // Simulate updating user role in the database
  const updatedUser = await becomeOwner(actor.id);
  return updatedUser;
}

async function getUserProfileService(userId) {
  const user = await getUserProfile(userId);
  if (!user) {
    throw new AppErrors('User not found', 404);
  }
  return user;
}

async function updateUserProfileService(userId, updateData) {
  const user = await findUserById(userId);
  if (!user) {
    throw new AppErrors('User not found', 404);
  }

  // If password is being updated, hash it
  if (updateData.password) {
    updateData.password_hash = await passwordHash(updateData.password);
    delete updateData.password;
  }

  const updatedUser = await updateUserProfile(userId, updateData);
  return updatedUser;
}

async function getAllUsersService(page = 1, limit = 20, role = null, search = null) {
  const validPage = Math.max(1, parseInt(page, 10));
  const validLimit = Math.max(1, Math.min(100, parseInt(limit, 10)));

  const [users, totalCount] = await Promise.all([
    getAllUsersRepository(validPage, validLimit, role, search),
    getUsersCountRepository(role, search)
  ]);

  return {
    data: users,
    meta: {
      page: validPage,
      limit: validLimit,
      totalItems: totalCount,
      totalPages: Math.ceil(totalCount / validLimit)
    }
  };
}

async function updateUserRoleService(userId, newRole) {
  // Validate role
  const validRoles = ['user', 'owner', 'admin'];
  if (!validRoles.includes(newRole)) {
    throw new AppErrors('Invalid role. Must be user, owner, or admin', 400);
  }

  const user = await findUserById(userId);
  if (!user) {
    throw new AppErrors('User not found', 404);
  }

  // Prevent changing admin role (optional - adjust as needed)
  if (user.role === 'admin' && newRole !== 'admin') {
    throw new AppErrors('Cannot change admin role', 400);
  }

  const updatedUser = await updateUserRoleRepository(userId, newRole);
  return updatedUser;
}

async function deleteUserService(userId) {
  const user = await findUserById(userId);
  if (!user) {
    throw new AppErrors('User not found', 404);
  }

  const deletedUser = await deleteUserRepository(userId);
  return deletedUser;
}

module.exports = {
  postUsersService,
  loginService,
  becomeOwnerService,
  getUserProfileService,
  updateUserProfileService,
  getAllUsersService,
  updateUserRoleService,
  deleteUserService
}
