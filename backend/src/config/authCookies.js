const SESSION_COOKIE = 'rental_session';
const OAUTH_STATE_COOKIE = 'google_oauth_state';

function cookieOptions(maxAge) {
  const raw = (process.env.COOKIE_SAME_SITE || 'lax').trim().toLowerCase();
  const sameSite = ['none', 'lax', 'strict'].includes(raw) ? raw : 'lax';
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' || sameSite === 'none',
    sameSite,
    path: '/',
    ...(maxAge !== undefined && { maxAge }),
  };
}

module.exports = {
  SESSION_COOKIE,
  OAUTH_STATE_COOKIE,
  cookieOptions
};
