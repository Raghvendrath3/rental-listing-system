const { spawnSync } = require('node:child_process');

const result = spawnSync(
  process.execPath,
  [require.resolve('next/dist/bin/next'), 'build', '--webpack'],
  {
    env: { ...process.env, ANALYZE: 'true' },
    stdio: 'inherit'
  }
);

if (result.error) throw result.error;
process.exitCode = result.status === null ? 1 : result.status;
