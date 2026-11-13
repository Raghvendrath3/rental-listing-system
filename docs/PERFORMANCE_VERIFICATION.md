# Performance Verification Runbook

Run these checks in order against a production build or a staging environment.
The benchmark sends anonymous requests and does not print response bodies, tokens,
SQL text, or database credentials.

## 1. Hosting region alignment

1. In each provider console, record the deployment region for the frontend, API,
   and PostgreSQL instance. Place them in the same region where possible; use the
   provider's supported private network for API-to-database traffic.
2. Confirm the database region in its provider dashboard. PostgreSQL does not
   expose a portable region setting; `inet_server_addr()` is useful for
   connectivity diagnostics but does not reliably identify a cloud region.
3. Measure a simple baseline RTT from the machine running this runbook:

   ```powershell
   $env:FRONTEND_URL = "https://frontend.example.com"
   $env:API_URL = "https://api.example.com/api/v1"
   Measure-Command { Invoke-WebRequest "$env:FRONTEND_URL/listings" -Method Get | Out-Null }
   Measure-Command { Invoke-WebRequest "$env:API_URL/health" -Method Get | Out-Null }
   ```

   Repeat each command several times and compare median timings. If available,
   run the same checks from a host in the database region and from a distant
   region; a large RTT difference points to network placement before code.

## 2. Database query plans and pool utilization

Set `DATABASE_URL` or the individual `DB_*` values in `backend/.env`, then run:

```powershell
npm --prefix backend run verify:db
```

The script runs the public city/type/price query, title substring query, and
owner query from the repository with `EXPLAIN (ANALYZE, BUFFERS)`. It summarizes
the scan type, execution time, and shared buffer hits/reads without exposing
query text or values. Index scans are expected for selective predicates on a
large data set; a sequential scan can be optimal for a small table or a broad
filter. Compare plans on realistic staging data, not only a small local seed.

The report also shows `pg_stat_activity` counts, optional `pg_stat_statements`
aggregates, and the application's `totalCount`, `idleCount`, and `waitingCount`.
A sustained nonzero `waitingCount`, connection acquisition latency, or a pool
near its configured `DB_POOL_MAX` indicates saturation. Account for the total
pool budget across every application instance before increasing the per-instance
maximum.

## 3. Anonymous caching and invalidation

Start the production frontend and API, then set their externally reachable URLs:

```powershell
$env:FRONTEND_URL = "https://frontend.example.com"
$env:API_URL = "https://api.example.com/api/v1"
npm --prefix backend run verify:perf
```

The report compares first and repeated TTFB for the listings document and API,
including filtered URLs. Identical anonymous API queries should change from
`X-Cache: MISS` to `X-Cache: HIT`; changed filters or pagination should have
their own cache keys. The summary hit rate counts only responses with an
`X-Cache` value of `HIT` or `MISS`.

The Authorization probe must return `Cache-Control: private, no-store`. For an
optional invalidation test, provide a valid raw session JWT and an owned listing
ID. The script fetches that listing, sends a no-op update with its current
values, then checks that the next anonymous listings request misses the cache:

```powershell
$env:TEST_AUTH_TOKEN = "<raw session JWT>"
$env:TEST_LISTING_ID = "123"
npm --prefix backend run verify:perf
```

This performs a real update request; use a staging listing and a token allowed
to edit it. If the optional values are omitted, invalidation is reported as
skipped.

## 4. Payload size and request count

The performance report includes raw wire bytes for Brotli/gzip negotiation and
identity encoding, along with `Content-Encoding` and `Cache-Control`. Confirm
that compressed responses are encoded and materially smaller for representative
large payloads. Small responses may remain uncompressed below middleware
thresholds.

Review the listings repository's explicit card columns and pagination limit.
Check the browser Network panel for duplicate requests, filter requests that
are not cancelled after newer input, unexpected full-list downloads, and
unnecessary calls for page totals. The listing interface currently displays
exact counts and page totals, so verify both count and data query costs.

## 5. Frontend bundle and Core Web Vitals

Build the bundle analyzer report:

```powershell
Set-Location frontend
$env:ANALYZE = "true"
npm run build
```

Use the analyzer output under `frontend/.next/analyze/` to identify large
client chunks and confirm route-specific providers/widgets are absent from
routes that do not need them. In a browser against the production build, capture
LCP, document TTFB, the request waterfall, and JavaScript transfer/parse time
with DevTools or Lighthouse. Test both a cold start and repeat navigation.

Triage in this order:

1. High document/API TTFB with low browser JavaScript cost: check cold starts,
   hosting regions, connection acquisition, and database query plans.
2. High API `db-query` time: inspect the matching plan and shared buffer reads,
   then validate indexes and filter selectivity.
3. High `db-acquire` time or waiting connections: inspect pool saturation and
   per-instance connection budgets.
4. Good server timing but poor LCP: inspect client bundle size, image delivery,
   hydration, and render-blocking requests.
5. Large compressed payloads or excessive request count: inspect selected
   columns, pagination, repeated requests, and compression headers.
