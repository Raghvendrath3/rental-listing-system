require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const { pool, getPoolMetrics } = require('../src/config/db');

function planSummary(rows) {
  const text = rows.map(row => row['QUERY PLAN']).join('\n');
  const scans = [...new Set(
    text.match(/(?:Index Only Scan using \S+|Index Scan using \S+|Bitmap Index Scan on \S+|Seq Scan on \S+)/g) || []
  )];
  const execution = text.match(/Execution Time:\s*([\d.]+)\s*ms/i);
  const executionPlan = text.split(/\n\s*Planning:/i)[0];
  const buffers = executionPlan.match(/Buffers: shared hit=(\d+)(?: read=(\d+))?/i);
  return {
    scans: scans.length ? scans.join('; ') : 'Not identified',
    executionMs: execution ? Number(execution[1]) : null,
    sharedHit: buffers ? Number(buffers[1]) : 0,
    sharedRead: buffers && buffers[2] ? Number(buffers[2]) : 0
  };
}

async function explain(client, label, sql, values) {
  const result = await client.query(`EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) ${sql}`, values);
  return { label, ...planSummary(result.rows) };
}

async function main() {
  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');
    await client.query(
      `SELECT set_config('app.user_id', '0', true),
              set_config('app.user_role', 'admin', true)`
    );

    const sampleResult = await client.query(
      `SELECT city, type, price, owner_id, title
       FROM listings
       WHERE status = 'published'
       ORDER BY id
       LIMIT 1`
    );
    const ownerResult = await client.query(
      `SELECT owner_id
       FROM listings
       WHERE owner_id IS NOT NULL
       ORDER BY id
       LIMIT 1`
    );

    const sample = sampleResult.rows[0];
    const city = process.env.VERIFY_CITY || (sample && sample.city) || 'boston';
    const type = process.env.VERIFY_TYPE || (sample && sample.type) || 'apartment';
    const floor = Number(process.env.VERIFY_PRICE_MIN) || 1000;
    const ceiling = Number(process.env.VERIFY_PRICE_MAX) || 100000;
    const titleTerm = process.env.VERIFY_SEARCH_TERM
      || (sample && String(sample.title).trim().split(/\s+/)[0])
      || 'rental';
    const ownerId = ownerResult.rows[0] && ownerResult.rows[0].owner_id;

    const plans = [];
    plans.push(await explain(
      client,
      'Published city/type/price range',
      `SELECT id, title, type, city, area, price, is_available
       FROM listings
       WHERE status = 'published'
         AND city = $1 AND type = $2 AND price >= $3 AND price <= $4
       ORDER BY price ASC, id ASC
       LIMIT 10 OFFSET 0`,
      [city, type, floor, ceiling]
    ));
    plans.push(await explain(
      client,
      'Published title substring search',
      `SELECT id, title, type, city, area, price, is_available
       FROM listings
       WHERE status = 'published' AND title ILIKE $1
       ORDER BY price ASC, id ASC
       LIMIT 10 OFFSET 0`,
      [`%${titleTerm}%`]
    ));

    if (ownerId !== undefined) {
      plans.push(await explain(
        client,
        'Owner listing query',
        `SELECT id, title, type, city, area, price, is_available, owner_id, status, published_at, archived_at
         FROM listings
         WHERE owner_id = $1
         ORDER BY price ASC, id ASC
         LIMIT 10 OFFSET 0`,
        [ownerId]
      ));
    }

    const activityResult = await client.query(
      `SELECT COALESCE(state, 'unknown') AS state, COUNT(*)::integer AS connections
       FROM pg_stat_activity
       WHERE datname = current_database()
       GROUP BY COALESCE(state, 'unknown')
       ORDER BY state`
    );

    let statementStats = [];
    let statementStatsStatus = 'pg_stat_statements is not enabled or is not accessible';
    try {
      const statsResult = await client.query(
        `SELECT calls::bigint AS calls,
                ROUND(total_exec_time::numeric, 2) AS total_ms,
                ROUND(mean_exec_time::numeric, 2) AS mean_ms
         FROM pg_stat_statements
         WHERE query ILIKE '%listings%'
         ORDER BY total_exec_time DESC
         LIMIT 5`
      );
      statementStats = statsResult.rows;
      statementStatsStatus = statementStats.length
        ? 'Available (query text omitted)'
        : 'Available; no matching statements recorded';
    } catch (error) {
      if (error.code !== '42P01' && error.code !== '42501') throw error;
    }

    await client.query('ROLLBACK');
    client.release();
    client = null;

    console.log('# PostgreSQL listing query verification\n');
    console.log('| Query | Plan scan | Execution ms | Shared buffers hit | Shared buffers read |');
    console.log('| --- | --- | ---: | ---: | ---: |');
    for (const plan of plans) {
      console.log(`| ${plan.label} | ${plan.scans} | ${plan.executionMs ?? 'n/a'} | ${plan.sharedHit} | ${plan.sharedRead} |`);
    }
    console.log('\n## Live database connections\n');
    console.log('| State | Connections |');
    console.log('| --- | ---: |');
    for (const row of activityResult.rows) {
      console.log(`| ${row.state} | ${row.connections} |`);
    }
    console.log('\n## Application pool snapshot\n');
    const metrics = getPoolMetrics();
    console.log(`| totalCount | idleCount | waitingCount |`);
    console.log(`| ---: | ---: | ---: |`);
    console.log(`| ${metrics.totalCount} | ${metrics.idleCount} | ${metrics.waitingCount} |`);
    console.log(`\npg_stat_statements: ${statementStatsStatus}`);
    if (statementStats.length) {
      console.log('\n| Calls | Total ms | Mean ms |');
      console.log('| ---: | ---: | ---: |');
      for (const row of statementStats) {
        console.log(`| ${row.calls} | ${row.total_ms} | ${row.mean_ms} |`);
      }
    }
  } catch (error) {
    if (client) await client.query('ROLLBACK').catch(() => {});
    console.error(`Database verification failed: ${error.code || error.message}`);
    process.exitCode = 1;
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

main();
