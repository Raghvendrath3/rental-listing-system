const {postUsersRepository, findUserByEmail, becomeOwner, findUserById} = require('../repositories/users.repository')
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
    const hashedPassword = await bcrypt.hashSync(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    throw new AppErrors('Error hashing password', 500);
  }
}

async function postUsersService(newUser){
    validateUser(newUser);
    newUser.password = await passwordHash(newUser.password);
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
  return jwtToken;
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

module.exports = {
  postUsersService,
  loginService,
  becomeOwnerService
}