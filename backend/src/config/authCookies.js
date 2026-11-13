const SESSION_COOKIE = 'rental_session';
const OAUTH_STATE_COOKIE = 'google_oauth_state';

function cookieOptions(maxAge) {
  const sameSite = process.env.COOKIE_SAME_SITE === 'none' ? 'none' : 'lax';
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' || sameSite === 'none',
    sameSite,
    path: '/',
    maxAge
  };
}

module.exports = {
  SESSION_COOKIE,
  OAUTH_STATE_COOKIE,
  cookieOptions
};
