const crypto = require('crypto');
const { postUsersService, loginService, createSessionToken, getGoogleAuthorizationUrl, authenticateGoogle } = require('../services/users.service');
const { findUserById } = require('../repositories/users.repository');
const { submitOwnerRequestService, getUserOwnerRequestStatus } = require('../services/requests.service');
const { SESSION_COOKIE, OAUTH_STATE_COOKIE, cookieOptions } = require('../config/authCookies');

function setSessionCookie(res, user) {
  res.cookie(SESSION_COOKIE, createSessionToken(user), cookieOptions(60 * 60 * 1000));
}

function getFrontendLoginUrl(errorCode) {
  const loginUrl = new URL('/login', process.env.FRONTEND_URL || 'http://localhost:3000');
  if (errorCode) loginUrl.searchParams.set('oauth_error', errorCode);
  return loginUrl.toString();
}

function getOAuthErrorCode(error) {
  if (error.statusCode === 409) return 'account_exists';
  if (error.statusCode === 503) return 'unavailable';
  if (error.statusCode === 403) return 'unverified_email';
  if (error.statusCode === 401) return 'provider';
  return 'failed';
}

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    full_name: user.full_name,
    avatar_url: user.avatar_url
  };
}

async function postUsers(req, res, next) {
  try {
    const newUser = {
      email: req.body.email,
      password: req.body.password,
      full_name: req.body.full_name,
      phone: req.body.phone,
      address: req.body.address,
    };
    const user = await postUsersService(newUser);
    setSessionCookie(res, user);
    res.status(201).json({ status: 'success', data: publicUser(user) });
  } catch (error) {
    // Fix: PostgreSQL unique violation (code 23505) was bubbling as unhandled 500
    if (error.code === '23505') {
      return res.status(409).json({ status: 'fail', message: 'Email already in use' });
    }
    next(error);
  }
}

async function userLogin(req, res, next) {
  const loginDetails = {
    email: req.body.email,
    password: req.body.password
  };
  try {
    const user = await loginService(loginDetails);
    setSessionCookie(res, user);
    res.status(200).json({
      status: 'success',
      data: user
    });
  } catch (error) {
    next(error);
  }
}

async function getCurrentUser(req, res, next) {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(401).json({ status: 'fail', message: 'Session is no longer valid' });
    }
    return res.status(200).json({ status: 'success', data: publicUser(user) });
  } catch (error) {
    next(error);
  }
}

function logout(req, res) {
  const options = cookieOptions();
  delete options.maxAge;
  res.clearCookie(SESSION_COOKIE, options);
  res.status(200).json({ status: 'success' });
}

function googleLogin(req, res, next) {
  try {
    const state = crypto.randomBytes(32).toString('hex');
    const authorizationUrl = getGoogleAuthorizationUrl(state);
    res.cookie(OAUTH_STATE_COOKIE, state, cookieOptions(10 * 60 * 1000));
    res.redirect(authorizationUrl);
  } catch (error) {
    if (error.statusCode === 503) {
      return res.redirect(getFrontendLoginUrl('unavailable'));
    }
    next(error);
  }
}

async function googleCallback(req, res) {
  const stateCookie = req.cookies && req.cookies[OAUTH_STATE_COOKIE];
  const stateQuery = req.query.state;
  const clearStateOptions = cookieOptions();
  delete clearStateOptions.maxAge;
  res.clearCookie(OAUTH_STATE_COOKIE, clearStateOptions);

  if (typeof stateCookie !== 'string' || typeof stateQuery !== 'string'
    || stateCookie.length !== stateQuery.length
    || !crypto.timingSafeEqual(Buffer.from(stateCookie), Buffer.from(stateQuery))) {
    return res.redirect(getFrontendLoginUrl('state'));
  }
  if (req.query.error || typeof req.query.code !== 'string') {
    return res.redirect(getFrontendLoginUrl('denied'));
  }

  try {
    const user = await authenticateGoogle(req.query.code);
    setSessionCookie(res, user);
    const listingsUrl = new URL('/listings', process.env.FRONTEND_URL || 'http://localhost:3000');
    return res.redirect(listingsUrl.toString());
  } catch (error) {
    if (!error.isOperational) {
      console.error('Unexpected Google OAuth callback failure:', error);
    }
    return res.redirect(getFrontendLoginUrl(getOAuthErrorCode(error)));
  }
}

async function becomeOwner(req, res, next) {
  try {
    const actor = {
      id: req.user.id,
      role: req.user.role
    };
    const details = {
      property_type: req.body.property_type,
      location: req.body.location,
      reason: req.body.reason
    };
    const result = await submitOwnerRequestService(actor, details);
    res.status(201).json({
      status: 'success',
      message: 'Owner request submitted successfully.',
      data: result
    });
  } catch (error) {
    next(error);
  }
}

async function getOwnerStatus(req, res, next) {
  try {
    const result = await getUserOwnerRequestStatus(req.user.id);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  postUsers,
  userLogin,
  getCurrentUser,
  logout,
  googleLogin,
  googleCallback,
  becomeOwner,
  getOwnerStatus
};