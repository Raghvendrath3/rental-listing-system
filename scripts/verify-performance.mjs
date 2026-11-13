import http from 'node:http';
import https from 'node:https';
import { performance } from 'node:perf_hooks';

const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/+$/, '');
const API_URL = (process.env.API_URL || 'http://localhost:5000/api/v1').replace(/\/+$/, '');
const VERIFY_CITY = process.env.VERIFY_CITY || 'boston';
const VERIFY_TYPE = process.env.VERIFY_TYPE || 'apartment';
const VERIFY_SEARCH_TERM = process.env.VERIFY_SEARCH_TERM || 'rental';
const issues = [];

function ms(value) {
  return Number(value).toFixed(1);
}

function safeHeader(value) {
  return String(value || 'not provided').replace(/[\r\n|]/g, ' ').trim();
}

function urlWithParams(base, params) {
  const url = new URL(base);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') url.searchParams.set(key, String(value));
  }
  return url.toString();
}

async function timedFetch(url, options = {}) {
  const startedAt = performance.now();
  const response = await fetch(url, {
    ...options,
    signal: options.signal || AbortSignal.timeout(15000)
  });
  const ttfbMs = performance.now() - startedAt;
  const body = await response.arrayBuffer();
  return {
    url,
    status: response.status,
    ttfbMs,
    bodyBytes: body.byteLength,
    headers: response.headers
  };
}

function rawResponse(url, acceptEncoding, redirectCount = 0) {
  if (redirectCount > 5) return Promise.reject(new Error('Too many response redirects'));
  const target = new URL(url);
  const transport = target.protocol === 'https:' ? https : http;

  return new Promise((resolve, reject) => {
    const request = transport.request(target, {
      method: 'GET',
      headers: { 'Accept-Encoding': acceptEncoding }
    }, response => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        response.resume();
        response.on('end', () => {
          resolve(rawResponse(new URL(response.headers.location, target).toString(), acceptEncoding, redirectCount + 1));
        });
        return;
      }

      let bytes = 0;
      response.on('data', chunk => { bytes += chunk.length; });
      response.on('end', () => resolve({
        status: response.statusCode,
        bytes,
        contentEncoding: response.headers['content-encoding'] || 'identity',
        cacheControl: response.headers['cache-control'] || 'not provided'
      }));
    });

    request.setTimeout(15000, () => request.destroy(new Error('Request timed out')));
    request.on('error', reject);
    request.end();
  });
}

function parseServerTiming(header) {
  const timings = {};
  for (const item of (header || '').split(',')) {
    const metric = item.trim();
    const name = metric.split(';', 1)[0];
    const duration = metric.match(/(?:^|;)\s*dur=([\d.]+)/i);
    if (name && duration) timings[name] = Number(duration[1]);
  }
  return timings;
}

function documentUrl(params = {}) {
  return urlWithParams(`${FRONTEND_URL}/listings`, params);
}

function apiUrl(params = {}) {
  return urlWithParams(`${API_URL}/listings`, params);
}

function renderTable(headers, rows) {
  console.log(`| ${headers.join(' | ')} |`);
  console.log(`| ${headers.map(() => '---').join(' | ')} |`);
  for (const row of rows) console.log(`| ${row.map(safeHeader).join(' | ')} |`);
  console.log('');
}

async function verifyInvalidation(token) {
  const listingId = process.env.TEST_LISTING_ID;
  if (!listingId) {
    return { result: 'SKIPPED', detail: 'Set TEST_LISTING_ID with TEST_AUTH_TOKEN to enable' };
  }

  try {
    await timedFetch(apiUrl({ page: 1, limit: 10 }));
    const sessionToken = token.replace(/^rental_session=/, '');
    const cookie = `rental_session=${sessionToken}`;
    const detailsResponse = await fetch(`${API_URL}/owner/${encodeURIComponent(listingId)}`, {
      headers: { Cookie: cookie },
      signal: AbortSignal.timeout(15000)
    });
    if (!detailsResponse.ok) {
      return { result: 'FAILED', detail: `Owner detail request returned ${detailsResponse.status}` };
    }

    const listingResponse = await detailsResponse.json();
    const listing = listingResponse.data;
    if (!listing || !listing.id) {
      return { result: 'FAILED', detail: 'Owner detail response had no listing data' };
    }

    const mutationResponse = await fetch(`${API_URL}/owner/${encodeURIComponent(listingId)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie,
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({
        title: listing.title,
        type: listing.type,
        city: listing.city,
        area: listing.area,
        price: listing.price,
        is_available: listing.is_available
      }),
      signal: AbortSignal.timeout(15000)
    });
    if (!mutationResponse.ok) {
      return { result: 'FAILED', detail: `No-op listing update returned ${mutationResponse.status}` };
    }

    const afterMutation = await timedFetch(apiUrl({ page: 1, limit: 10 }));
    const cacheState = afterMutation.headers.get('x-cache') || 'not provided';
    const passed = cacheState.toUpperCase() === 'MISS';
    if (!passed) issues.push('Public listing cache did not report a miss after the test mutation');
    return {
      result: passed ? 'PASS' : 'FAILED',
      detail: `Post-mutation X-Cache: ${cacheState}`
    };
  } catch (error) {
    issues.push('Optional cache invalidation check failed');
    return { result: 'FAILED', detail: error.message };
  }
}

async function main() {
  const filteredParams = {
    city: VERIFY_CITY,
    type: VERIFY_TYPE,
    priceMin: process.env.VERIFY_PRICE_MIN || 1000,
    priceMax: process.env.VERIFY_PRICE_MAX || 100000,
    q: VERIFY_SEARCH_TERM,
    page: 1,
    limit: 10
  };
  const targets = [
    { label: 'Listings document (default)', url: documentUrl({ page: 1, limit: 10 }) },
    { label: 'Listings document (filtered)', url: documentUrl(filteredParams) },
    { label: 'Listings API (default)', url: apiUrl({ page: 1, limit: 10 }) },
    { label: 'Listings API (filtered)', url: apiUrl(filteredParams) }
  ];

  const ttfbRows = [];
  const timingRows = [];
  for (const target of targets) {
    const cold = await timedFetch(target.url);
    const warm = await timedFetch(target.url);
    ttfbRows.push([
      target.label,
      ms(cold.ttfbMs),
      ms(warm.ttfbMs),
      `${cold.status}/${warm.status}`,
      warm.headers.get('x-cache') || 'n/a'
    ]);

    if (target.label.startsWith('Listings API')) {
      const timing = parseServerTiming(warm.headers.get('server-timing'));
      timingRows.push([
        target.label,
        timing['db-acquire'] === undefined ? 'n/a' : ms(timing['db-acquire']),
        timing['db-query'] === undefined ? 'n/a' : ms(timing['db-query']),
        timing.app === undefined ? 'n/a' : ms(timing.app),
        safeHeader(warm.headers.get('cache-control'))
      ]);
    }
  }

  console.log('# Performance verification');
  console.log(`\nFrontend: ${FRONTEND_URL}\nAPI: ${API_URL}\n`);
  console.log('## Cold vs. warm TTFB (milliseconds)');
  renderTable(['Request', 'First TTFB', 'Repeat TTFB', 'Status first/repeat', 'Repeat X-Cache'], ttfbRows);
  console.log('## API Server-Timing and cache policy');
  renderTable(['Request', 'DB acquire ms', 'DB query ms', 'App ms', 'Cache-Control'], timingRows);

  const probeParams = [
    { page: 1, limit: 10 },
    { page: 1, limit: 10 },
    { page: 1, limit: 9 },
    { page: 1, limit: 9 },
    { city: VERIFY_CITY, page: 1, limit: 10 },
    { city: VERIFY_CITY, page: 1, limit: 10 },
    { city: VERIFY_CITY, type: VERIFY_TYPE, page: 1, limit: 10 },
    { city: VERIFY_CITY, type: VERIFY_TYPE, page: 1, limit: 10 }
  ];
  const probeResults = [];
  for (let index = 0; index < probeParams.length; index += 1) {
    const response = await timedFetch(apiUrl(probeParams[index]));
    probeResults.push(response);
  }

  const knownCacheResults = probeResults
    .map(result => (result.headers.get('x-cache') || '').toUpperCase())
    .filter(value => value === 'HIT' || value === 'MISS');
  const hitCount = knownCacheResults.filter(value => value === 'HIT').length;
  const cacheHitRate = knownCacheResults.length
    ? `${hitCount}/${knownCacheResults.length} (${ms(hitCount * 100 / knownCacheResults.length)}%)`
    : 'unavailable (X-Cache not provided)';
  const cacheRows = probeResults.map((result, index) => [
    index + 1,
    new URL(result.url).search.slice(1) || '(default)',
    result.headers.get('x-cache') || 'not provided',
    result.status
  ]);
  console.log('## Anonymous cache probes');
  console.log(`Hit rate: ${cacheHitRate}\n`);
  renderTable(['Probe', 'Query key', 'X-Cache', 'Status'], cacheRows);

  const token = process.env.TEST_AUTH_TOKEN || '';
  const authorization = token
    ? (/^Bearer\s/i.test(token) ? token : `Bearer ${token}`)
    : 'Bearer performance-verification';
  const authenticatedResponse = await timedFetch(apiUrl({ page: 1, limit: 10 }), {
    headers: { Authorization: authorization }
  });
  const authCacheControl = authenticatedResponse.headers.get('cache-control') || '';
  const authPolicyPassed = /private/i.test(authCacheControl) && /no-store/i.test(authCacheControl);
  if (!authPolicyPassed) issues.push('Authenticated API request did not return private, no-store');
  console.log('## Cache isolation');
  renderTable(
    ['Check', 'Status', 'Cache-Control'],
    [['Authorization request', authPolicyPassed ? 'PASS' : 'FAIL', authCacheControl || 'not provided']]
  );

  const invalidation = token
    ? await verifyInvalidation(token)
    : { result: 'SKIPPED', detail: 'TEST_AUTH_TOKEN was not provided' };
  if (invalidation.result === 'FAILED') issues.push('Cache invalidation verification failed');
  renderTable(['Mutation invalidation', 'Result', 'Detail'], [[
    'Listing no-op update',
    invalidation.result,
    invalidation.detail
  ]]);

  const payloadTargets = [
    { label: 'Listings page', url: documentUrl({ page: 1, limit: 10 }) },
    { label: 'Listings API filtered', url: apiUrl(filteredParams) }
  ];
  const payloadRows = [];
  for (const target of payloadTargets) {
    const [compressed, identity] = await Promise.all([
      rawResponse(target.url, 'br, gzip'),
      rawResponse(target.url, 'identity')
    ]);
    payloadRows.push([
      target.label,
      compressed.bytes,
      compressed.contentEncoding,
      identity.bytes,
      compressed.cacheControl
    ]);
  }
  console.log('## Wire payload and compression');
  renderTable(
    ['Response', 'Compressed bytes', 'Content-Encoding', 'Identity bytes', 'Cache-Control'],
    payloadRows
  );

  const compressionExpected = payloadRows.some(row => row[2] !== 'identity');
  if (!compressionExpected) issues.push('No compressed Content-Encoding observed on benchmark responses');
  if (issues.length) {
    console.log(`Verification issues: ${issues.join('; ')}`);
    process.exitCode = 1;
  }
}

main().catch(error => {
  console.error(`Performance verification failed: ${error.message}`);
  process.exitCode = 1;
});
