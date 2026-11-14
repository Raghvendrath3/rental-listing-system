const { cookieOptions } = require('../src/config/authCookies');

describe('auth cookie options', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalSameSite = process.env.COOKIE_SAME_SITE;

  afterEach(() => {
    if (originalNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalNodeEnv;
    }

    if (originalSameSite === undefined) {
      delete process.env.COOKIE_SAME_SITE;
    } else {
      process.env.COOKIE_SAME_SITE = originalSameSite;
    }
  });

  test('defaults to SameSite=None and Secure in production', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.COOKIE_SAME_SITE;

    expect(cookieOptions()).toMatchObject({
      sameSite: 'none',
      secure: true,
      httpOnly: true,
    });
  });

  test('defaults to SameSite=Lax outside production', () => {
    process.env.NODE_ENV = 'development';
    delete process.env.COOKIE_SAME_SITE;

    expect(cookieOptions()).toMatchObject({
      sameSite: 'lax',
      secure: false,
    });
  });
});
