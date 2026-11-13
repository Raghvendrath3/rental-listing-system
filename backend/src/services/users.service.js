const {
  postUsersRepository,
  findUserByEmail,
  findUserById,
  findUserByOAuth,
  createOAuthUser
} = require('../repositories/users.repository')
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

function validateRegistration(newUser) {
  const { email, password, full_name, phone, address } = newUser;

  // 1. Email/password check
  validateUser({ email, password });

  // 2. Validate Full Name
  if (!full_name || typeof full_name !== 'string' || full_name.trim() === '') {
    throw new AppErrors('Full name is required', 400);
  }

  // 3. Validate Phone (Indian Mobile Number Standard)
  if (!phone || typeof phone !== 'string' || phone.trim() === '') {
    throw new AppErrors('Phone number is required', 400);
  }
  const cleanPhone = phone.replace(/[\s-]/g, '');
  const phoneRegex = /^(?:\+91|91|0)?[6-9]\d{9}$/;
  if (!phoneRegex.test(cleanPhone)) {
    throw new AppErrors('Invalid Indian phone number format. Must be a 10-digit mobile number.', 400);
  }

  // 4. Validate Address
  if (!address || typeof address !== 'string' || address.trim() === '') {
    throw new AppErrors('Address is required', 400);
  }

  return true;
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
  validateRegistration(newUser);
  newUser.email = newUser.email.trim().toLowerCase();
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

function createSessionToken(user) {
  return generateJWT(user);
}

async function loginService(loginDetails){
  const { password } = loginDetails;
  validateUser(loginDetails);
  const user = await findUserByEmail(loginDetails.email.trim().toLowerCase());
  if (!user) {
    throw new AppErrors('Invalid email or password', 401);
  }
  if (!user.password_hash) {
    throw new AppErrors('Invalid email or password', 401);
  }
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    throw new AppErrors('Invalid email or password', 401);
  }
  return { id: user.id, role: user.role };
}

function googleOAuthConfig() {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL } = process.env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_CALLBACK_URL) {
    throw new AppErrors('Google sign-in is not configured', 503);
  }
  return { clientId: GOOGLE_CLIENT_ID, clientSecret: GOOGLE_CLIENT_SECRET, callbackUrl: GOOGLE_CALLBACK_URL };
}

function getGoogleAuthorizationUrl(state) {
  const config = googleOAuthConfig();
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.callbackUrl,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account'
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

async function authenticateGoogle(code) {
  const config = googleOAuthConfig();
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.callbackUrl,
      grant_type: 'authorization_code'
    })
  });
  if (!tokenResponse.ok) {
    throw new AppErrors('Google sign-in failed', 401);
  }
  const tokens = await tokenResponse.json();
  if (typeof tokens.access_token !== 'string') {
    throw new AppErrors('Google sign-in failed', 401);
  }

  const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` }
  });
  if (!profileResponse.ok) {
    throw new AppErrors('Unable to verify Google account', 401);
  }
  const profile = await profileResponse.json();
  if (!profile.sub || !profile.email || profile.email_verified !== true) {
    throw new AppErrors('A verified Google email is required', 403);
  }

  let user = await findUserByOAuth('google', profile.sub);
  if (user) return user;

  const existingUser = await findUserByEmail(profile.email.toLowerCase());
  if (existingUser) {
    throw new AppErrors('An account already exists for this email. Sign in with your password.', 409);
  }

  try {
    user = await createOAuthUser({
      email: profile.email.toLowerCase(),
      name: profile.name,
      provider: 'google',
      providerId: profile.sub,
      avatarUrl: profile.picture || null
    });
    return user;
  } catch (error) {
    if (error.code === '23505') {
      const linkedUser = await findUserByOAuth('google', profile.sub);
      if (linkedUser) return linkedUser;
      throw new AppErrors('An account already exists for this email. Sign in with your password.', 409);
    }
    throw error;
  }
}


module.exports = {
  postUsersService,
  loginService,
  createSessionToken,
  getGoogleAuthorizationUrl,
  authenticateGoogle,
}