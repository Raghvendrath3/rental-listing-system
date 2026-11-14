const csrfProtection = require('../src/middlewares/csrfProtection');

function createRequest({ origin, requestedWith, fetchSite = 'cross-site' } = {}) {
  const headers = {
    origin,
    'x-requested-with': requestedWith,
    'sec-fetch-site': fetchSite,
  };

  return {
    method: 'POST',
    cookies: { rental_session: 'session-token' },
    app: { locals: { allowedOrigins: new Set(['https://frontend.example.com']) } },
    get: (name) => headers[name.toLowerCase()],
  };
}

describe('CSRF protection for cross-site requests', () => {
  test('allows a session request from an allowed origin with the custom header', () => {
    const req = createRequest({
      origin: 'https://frontend.example.com',
      requestedWith: 'XMLHttpRequest',
    });
    const next = jest.fn();

    csrfProtection(req, {}, next);

    expect(next).toHaveBeenCalledWith();
  });

  test('rejects a cross-site session request without a trusted origin', () => {
    const req = createRequest({ requestedWith: 'XMLHttpRequest' });
    const next = jest.fn();

    csrfProtection(req, {}, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Cross-site request denied',
      statusCode: 403,
    }));
  });
});
