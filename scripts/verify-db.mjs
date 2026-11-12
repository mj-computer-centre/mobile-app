// Applies supabase/migrations to a throwaway Postgres cluster and runs supabase/tests/*.test.sql.
// Usage: node scripts/verify-db.mjs
//
// It starts its own temporary cluster (initdb + pg_ctl on a free localhost port) and deletes it
// afterwards, so it never touches your own databases or roles. Needs the Postgres 15+ client and
// server binaries; set PG_BIN to their directory when they are not on PATH (CI does this).
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const migrationsDir = join(root, 'supabase/migrations');
const testsDir = join(root, 'supabase/tests');

const bin = (name) => (process.env.PG_BIN ? join(process.env.PG_BIN, name) : name);

function freePort() {
  return new Promise((resolvePort, reject) => {
    const server = createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close(() => resolvePort(port));
    });
  });
}

function sqlFiles(dir) {
  return readdirSync(dir)
    .filter((name) => name.endsWith('.sql'))
    .sort()
    .map((name) => join(dir, name));
}

function runPsql(port, file) {
  const result = spawnSync(
    bin('psql'),
    [
      '-X',
      '-q',
      '-h',
      '127.0.0.1',
      '-p',
      String(port),
      '-U',
      'postgres',
      '-d',
      'postgres',
      '-v',
      'ON_ERROR_STOP=1',
      '-f',
      file,
    ],
    { encoding: 'utf8' },
  );
  return { ok: result.status === 0, output: `${result.stdout}${result.stderr}` };
}

const dataDir = mkdtempSync(join(tmpdir(), 'mcc-verify-db-'));
const port = await freePort();
let started = false;
let failed = false;

try {
  execFileSync(
    bin('initdb'),
    [
      '-D',
      dataDir,
      '-U',
      'postgres',
      '--auth=trust',
      '-E',
      'UTF8',
      '--no-locale',
      '--no-instructions',
    ],
    { stdio: 'ignore' },
  );
  execFileSync(
    bin('pg_ctl'),
    [
      '-D',
      dataDir,
      '-l',
      join(dataDir, 'server.log'),
      '-w',
      '-o',
      `-p ${port} -c listen_addresses=127.0.0.1 -c unix_socket_directories=''`,
      'start',
    ],
    { stdio: 'ignore' },
  );
  started = true;

  const setup = [
    join(testsDir, 'support/supabase-stubs.sql'),
    ...sqlFiles(migrationsDir),
    join(testsDir, 'support/test-helpers.sql'),
  ];
  for (const file of setup) {
    const { ok, output } = runPsql(port, file);
    if (!ok) {
      console.error(`✗ ${file.replace(`${root}/`, '')}\n${output}`);
      throw new Error('setup failed');
    }
  }
  console.log(`Applied ${sqlFiles(migrationsDir).length} migrations.`);

  let passed = 0;
  for (const file of sqlFiles(testsDir)) {
    const { ok, output } = runPsql(port, file);
    const checks = output.split('\n').filter((line) => line.includes('ok - '));
    passed += checks.length;
    const name = file.replace(`${root}/`, '');
    if (ok) {
      console.log(`✓ ${name} (${checks.length} checks)`);
    } else {
      failed = true;
      console.error(`✗ ${name}\n${output}`);
    }
  }
  // Last, because the tests expect an empty catalog: the demo seed must apply cleanly too.
  const seed = runPsql(port, join(root, 'supabase/seed.sql'));
  if (seed.ok) {
    console.log('✓ supabase/seed.sql applies');
  } else {
    failed = true;
    console.error(`✗ supabase/seed.sql\n${seed.output}`);
  }

  console.log(failed ? '\nDatabase checks failed.' : `\nDatabase checks passed: ${passed} checks.`);
} catch (error) {
  failed = true;
  if (error.code === 'ENOENT') {
    console.error('Postgres binaries not found. Install Postgres 15+ or set PG_BIN.');
  } else if (error.message !== 'setup failed') {
    console.error(error.message);
  }
} finally {
  if (started) {
    spawnSync(bin('pg_ctl'), ['-D', dataDir, '-m', 'immediate', '-w', 'stop'], { stdio: 'ignore' });
  }
  if (existsSync(dataDir)) rmSync(dataDir, { recursive: true, force: true });
}

process.exit(failed ? 1 : 0);
