import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, copyFileSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve('.');
const workflowPath = '.github/workflows/release.yml';
const versionPath = 'config/version.json';
const read = path => readFileSync(resolve(root, path), 'utf8');

test('release configuration and workflow constrain publication to main without rewriting it', () => {
  const version = JSON.parse(read(versionPath)).version;
  assert.match(version, /^\d{4}\.\d{2}\.\d{2}\.\d{4}$/);
  const yml = read(workflowPath);
  assert.match(yml, /push:\s*\n\s*branches:\s*\[main\]/);
  assert.match(yml, /contents:\s*write/);
  assert.match(yml, /fetch-depth:\s*0/);
  assert.match(yml, /cancel-in-progress:\s*false/);
  assert.doesNotMatch(yml, /git log -1 --format=%H HEAD -- config\/version\.json/);
  assert.match(yml, /release_commit=\$\(git rev-parse HEAD\)/);
  assert.match(yml, /\$\{GITHUB_SHA:\?\}/);
  assert.doesNotMatch(yml, /git checkout --detach/);
  assert.match(yml, /refs\/tags\/\$\{?tag\}?/);
  assert.match(yml, /\$release_commit/);
  assert.match(yml, /gh release create "\$tag"/);
  assert.match(yml, /--verify-tag/);
  assert.match(yml, /--generate-notes/);
  assert.match(yml, /Google-Search-Redirect\.js/);
  assert.match(yml, /cmp /);
  assert.doesNotMatch(yml, /git (?:commit|push\s+(?:--force|-f)|tag\s+-f)/);
  assert.doesNotMatch(yml, /\$\{\{\s*github\.event\./);
});

test('build uses the one stable version source and validates calendar and time', () => {
  const dir = mkdtempSync(join(tmpdir(), 'gsr-release-'));
  try {
    for (const sub of ['scripts', 'config', 'src']) mkdirSync(join(dir, sub));
    for (const path of ['scripts/build.mjs', 'config/google-domains.json', 'src/redirect.js', 'src/references.txt']) copyFileSync(join(root, path), join(dir, path));
    const run = version => {
      writeFileSync(join(dir, versionPath), JSON.stringify({ version }));
      return spawnSync(process.execPath, [join(dir, 'scripts/build.mjs')], { encoding: 'utf8' });
    };
    for (const invalid of ['2026.2.01.1200', '2026.02.29.1200', '2026.13.01.1200', '2026.01.01.2400', '2026.01.01.1260', '2026.01.01.0000x', '2026.01.01.1200\n', 2026]) {
      assert.notEqual(run(invalid).status, 0, String(invalid));
    }
    assert.equal(run('2028.02.29.0001').status, 0);
    const first = readFileSync(join(dir, 'Google-Search-Redirect.js'), 'utf8');
    assert.match(first, /^\/\/ @version\s+2028\.02\.29\.0001$/m);
    assert.equal(run('2028.02.29.0001').status, 0);
    assert.equal(readFileSync(join(dir, 'Google-Search-Redirect.js'), 'utf8'), first);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
