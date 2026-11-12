// Fails when a code file is longer than LIMIT lines. Usage: node scripts/check-file-length.mjs
// Exceptions live in scripts/file-length-grandfather.json; a listed file may shrink but never
// grow past its recorded maxLines, and an entry must be removed once the file is back under LIMIT.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const LIMIT = 600;
const CODE_EXTENSIONS = /\.(ts|tsx|js|jsx|mjs|cjs|css|sql)$/;
const IGNORED_PATHS = /(^|\/)(node_modules|generated|dist|web-build|\.expo|\.turbo|coverage)\//;
const GRANDFATHER_FILE = 'scripts/file-length-grandfather.json';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Tracked files plus new files that are not git-ignored, so the check also works before `git add`. */
function listFiles() {
  const out = execFileSync(
    'git',
    ['ls-files', '--cached', '--others', '--exclude-standard', '-z'],
    {
      cwd: root,
      encoding: 'utf8',
    },
  );
  return [...new Set(out.split('\0').filter(Boolean))];
}

function countLines(path) {
  const text = readFileSync(resolve(root, path), 'utf8');
  if (text.length === 0) return 0;
  const newlines = text.split('\n').length - 1;
  return text.endsWith('\n') ? newlines : newlines + 1;
}

function loadGrandfather() {
  const raw = JSON.parse(readFileSync(resolve(root, GRANDFATHER_FILE), 'utf8'));
  const entries = new Map();
  for (const entry of raw.files ?? []) {
    if (entries.has(entry.path))
      throw new Error(`${GRANDFATHER_FILE}: duplicate entry for ${entry.path}`);
    if (!Number.isInteger(entry.maxLines))
      throw new Error(`${GRANDFATHER_FILE}: ${entry.path} needs an integer maxLines`);
    if (!entry.reason || !entry.backlog)
      throw new Error(`${GRANDFATHER_FILE}: ${entry.path} needs a reason and a backlog story`);
    entries.set(entry.path, entry);
  }
  return entries;
}

const grandfather = loadGrandfather();
const problems = [];

for (const path of listFiles()) {
  if (!CODE_EXTENSIONS.test(path) || IGNORED_PATHS.test(path)) continue;
  if (!existsSync(resolve(root, path))) continue; // deleted in the working tree but still in the index
  const lines = countLines(path);
  const entry = grandfather.get(path);
  if (entry) {
    if (lines > entry.maxLines) {
      problems.push(
        `${path}: ${lines} lines, grandfathered at ${entry.maxLines}. Grandfathered files may shrink, never grow. Split it (${entry.backlog}).`,
      );
    } else if (lines <= LIMIT) {
      problems.push(
        `${path}: ${lines} lines, now within the ${LIMIT}-line limit. Remove its entry from ${GRANDFATHER_FILE}.`,
      );
    }
  } else if (lines > LIMIT) {
    problems.push(
      `${path}: ${lines} lines, limit is ${LIMIT}. Split it by responsibility (see CLAUDE.md, "File size").`,
    );
  }
}

for (const path of grandfather.keys()) {
  if (!existsSync(resolve(root, path))) {
    problems.push(
      `${path}: listed in ${GRANDFATHER_FILE} but the file no longer exists. Remove its entry.`,
    );
  }
}

if (problems.length > 0) {
  console.error(`File length check failed (${problems.length}):\n`);
  for (const problem of problems) console.error(`  - ${problem}`);
  console.error(`\nOnly add a file to ${GRANDFATHER_FILE} with a reason and a backlog story.`);
  process.exit(1);
}
console.log(
  `File length check passed: no code file over ${LIMIT} lines (${grandfather.size} grandfathered).`,
);
