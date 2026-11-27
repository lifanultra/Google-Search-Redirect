import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, cpSync, copyFileSync, readFileSync, writeFileSync, rmSync, chmodSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, delimiter } from 'node:path';
import { spawnSync } from 'node:child_process';

test('release workflow is repeatable offline, ignores later docs commits and refuses conflicting tags', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'release-integration-'));
  const repo = join(tmp, 'repo'), bare = join(tmp, 'remote.git'), bin = join(tmp, 'bin'), state = join(tmp, 'state');
  mkdirSync(repo); mkdirSync(bin); mkdirSync(state);
  const gh = `#!/bin/sh
set -eu
[ -n "\${GH_TOKEN:-}" ] || exit 2
[ -n "\${GH_REPO:-}" ] || exit 2
printf '%s\\n' "$*" >> "$STATE/log"
if [ "$1" = api ]; then
  [ -f "$STATE/released" ] || { echo 'HTTP 404' >&2; exit 1; }
  [ "$2" = "repos/$GH_REPO/releases/tags/$(cat "$STATE/tag")" ] || { echo 'HTTP 404' >&2; exit 1; }
  echo '{}'; exit 0
fi
[ "$1" = release ] || exit 2
case "$2" in
view)
  [ -f "$STATE/released" ] || { echo 'HTTP 404' >&2; exit 1; }
  [ "$3" = "$(cat "$STATE/tag")" ] || { echo 'HTTP 404' >&2; exit 1; }
  case "$*" in *assets*) [ ! -f "$STATE/asset" ] || echo Google-Search-Redirect.js;; *) echo '{}';; esac;;
create)
  [ ! -f "$STATE/released" ] || exit 1
  printf '%s' "$3" > "$STATE/tag"
  cp "$4" "$STATE/asset"
  touch "$STATE/released";;
download) cp "$STATE/asset" "$RUNNER_TEMP/release-asset/Google-Search-Redirect.js";;
upload) cp "$4" "$STATE/asset";;
*) exit 2;;
esac
`;
  writeFileSync(join(bin, 'gh'), gh); chmodSync(join(bin, 'gh'), 0o755);
  // Avoid recursively invoking this integration test; still verify the artifact.
  writeFileSync(join(bin, 'npm'), '#!/bin/sh\nif [ "$1 $2" = "run check:generated" ]; then exec node scripts/build.mjs --check; fi\n[ "$1" = test ]\n');
  chmodSync(join(bin, 'npm'), 0o755);
  const env = { ...process.env, PATH: `${bin}${delimiter}${process.env.PATH}`, STATE: state, RUNNER_TEMP: tmp, GH_TOKEN: 'offline-test', GH_REPO: 'test/repo' };
  const run = (cmd, args, options = {}) => {
    const sha = cmd === 'bash' ? spawnSync('git', ['rev-parse', 'HEAD'], { cwd: repo, env, encoding: 'utf8' }).stdout.trim() : '';
    return spawnSync(cmd, args, { cwd: repo, env: sha ? { ...env, GITHUB_SHA: sha } : env, encoding: 'utf8', ...options });
  };
  const ok = (cmd, args, options) => { const p = run(cmd, args, options); assert.equal(p.status, 0, `${cmd}: ${p.stdout}\n${p.stderr}`); return p.stdout.trim(); };
  try {
    ok('git', ['init', '--bare', bare]); ok('git', ['init', '-b', 'main']);
    ok('git', ['config', 'user.name', 'Offline Test']); ok('git', ['config', 'user.email', 'offline@example.invalid']);
    ok('git', ['remote', 'add', 'origin', bare]);
    for (const path of ['scripts', 'config', 'src', 'tests', '.github']) cpSync(resolve(path), join(repo, path), { recursive: true });
    copyFileSync(resolve('package.json'), join(repo, 'package.json'));
    ok('node', ['scripts/build.mjs']);
    ok('git', ['add', '.']); ok('git', ['commit', '-m', 'version release']);
    const firstCommit = ok('git', ['rev-parse', 'HEAD']);
    const yml = readFileSync(join(repo, '.github/workflows/release.yml'), 'utf8');
    const script = yml.split('        run: |\n')[1].split('\n').map(line => line.startsWith('          ') ? line.slice(10) : line).join('\n');
    const wrongSha = run('bash', ['-c', script], { env: { ...env, GITHUB_SHA: '0'.repeat(40) } });
    assert.notEqual(wrongSha.status, 0);
    assert.match(wrongSha.stderr, /does not match the push event SHA/);
    ok('bash', ['-c', script]);
    const version = JSON.parse(readFileSync(join(repo, 'config/version.json'), 'utf8')).version;
    assert.equal(ok('git', ['rev-parse', `refs/tags/v${version}^{commit}`]), firstCommit);
    const asset = readFileSync(join(state, 'asset'));
    ok('bash', ['-c', script]);
    assert.deepEqual(readFileSync(join(state, 'asset')), asset);
    writeFileSync(join(repo, 'docs-only.txt'), 'docs'); ok('git', ['add', '.']); ok('git', ['commit', '-m', 'docs only']);
    const docsCommit = ok('git', ['rev-parse', 'HEAD']);
    ok('bash', ['-c', script]);
    assert.equal(ok('git', ['rev-parse', 'HEAD']), docsCommit, 'must validate event HEAD, not checkout a prior commit');
    assert.equal(ok('git', ['rev-parse', `refs/tags/v${version}^{commit}`]), firstCommit, 'docs-only push must not move tag');
    assert.deepEqual(readFileSync(join(state, 'asset')), asset);
    // Regenerate changed userscript content without bumping its version.
    const src = join(repo, 'src/redirect.js');
    writeFileSync(src, readFileSync(src, 'utf8') + '\n// changed code\n');
    ok('node', ['scripts/build.mjs']); ok('git', ['add', '.']); ok('git', ['commit', '-m', 'script changed without version']);
    const changedCommit = ok('git', ['rev-parse', 'HEAD']);
    const unchangedVersion = run('bash', ['-c', script]);
    assert.notEqual(unchangedVersion.status, 0, 'changed userscript with unchanged version must fail');
    assert.match(unchangedVersion.stderr, /version|Version/);
    assert.equal(ok('git', ['rev-parse', 'HEAD']), changedCommit);
    assert.deepEqual(readFileSync(join(state, 'asset')), asset);
    ok('git', ['reset', '--hard', docsCommit]);
    const next = '2099.12.31.2359';
    ok('git', ['tag', `v${next}`, firstCommit]);
    writeFileSync(join(repo, 'config/version.json'), JSON.stringify({ version: next }));
    ok('node', ['scripts/build.mjs']); ok('git', ['add', '.']); ok('git', ['commit', '-m', 'conflicting version']);
    const conflict = run('bash', ['-c', script]);
    assert.notEqual(conflict.status, 0); assert.match(conflict.stderr, /Version conflict/);
    assert.deepEqual(readFileSync(join(state, 'asset')), asset);
    assert.equal(readFileSync(join(state, 'log'), 'utf8').split('\n').filter(s => s.startsWith('release create ')).length, 1);
    // Removing the version file and recreating it must not hide a higher
    // historical first-parent version from the monotonicity check.
    const versionCommit = ok('git', ['rev-parse', 'HEAD']);
    ok('git', ['rm', 'config/version.json']); ok('git', ['commit', '-m', 'remove version']);
    const rollback = '2028.01.01.0001';
    writeFileSync(join(repo, 'config/version.json'), JSON.stringify({ version: rollback }));
    ok('node', ['scripts/build.mjs']); ok('git', ['add', '.']); ok('git', ['commit', '-m', 'recreate older version']);
    const rollbackRun = run('bash', ['-c', script]);
    assert.notEqual(rollbackRun.status, 0, 'recreated older version must fail');
    assert.notEqual(run('git', ['rev-parse', '--verify', '--quiet', `refs/tags/v${rollback}`]).status, 0, 'rollback must not create a tag');
    ok('git', ['reset', '--hard', versionCommit]);
    // Detect a changed-then-reverted userscript hidden behind a later docs
    // commit; comparing HEAD only to its parent would miss the changed commit.
    const originalSrc = readFileSync(src, 'utf8');
    writeFileSync(src, originalSrc + '\n// transient change\n');
    ok('node', ['scripts/build.mjs']); ok('git', ['add', '.']); ok('git', ['commit', '-m', 'transient script change']);
    writeFileSync(src, originalSrc); ok('node', ['scripts/build.mjs']);
    ok('git', ['add', '.']); ok('git', ['commit', '-m', 'revert script change']);
    writeFileSync(join(repo, 'after-revert.txt'), 'docs'); ok('git', ['add', '.']); ok('git', ['commit', '-m', 'docs after revert']);
    const changedThenReverted = run('bash', ['-c', script]);
    assert.notEqual(changedThenReverted.status, 0);
    assert.match(changedThenReverted.stderr, /userscript changed without a version increase/);
    ok('git', ['reset', '--hard', versionCommit]);
    // The version was introduced earlier in this multi-commit push. If all
    // intervening userscript bytes match, tag the event HEAD, not that commit.
    ok('git', ['tag', '-d', `v${next}`]);
    writeFileSync(join(repo, 'later.txt'), 'later'); ok('git', ['add', '.']); ok('git', ['commit', '-m', 'later docs']);
    const laterCommit = ok('git', ['rev-parse', 'HEAD']);
    rmSync(join(state, 'released')); rmSync(join(state, 'asset'));
    ok('bash', ['-c', script]);
    assert.equal(ok('git', ['rev-parse', `refs/tags/v${next}^{commit}`]), laterCommit);
    ok('git', ['tag', '-d', `v${next}`]); ok('git', ['push', 'origin', `:refs/tags/v${next}`]);
    // A new version merged from a side branch must tag the actual main merge,
    // not the side-branch commit where the version file was last edited.
    ok('git', ['reset', '--hard', docsCommit]);
    ok('git', ['checkout', '-b', 'side']);
    writeFileSync(join(repo, 'config/version.json'), JSON.stringify({ version: next }));
    ok('node', ['scripts/build.mjs']); ok('git', ['add', '.']); ok('git', ['commit', '-m', 'side version']);
    const sideCommit = ok('git', ['rev-parse', 'HEAD']);
    ok('git', ['checkout', 'main']);
    writeFileSync(join(repo, 'main-only.txt'), 'main'); ok('git', ['add', '.']); ok('git', ['commit', '-m', 'main docs']);
    ok('git', ['merge', '--no-ff', 'side', '-m', 'merge version']);
    const mergeCommit = ok('git', ['rev-parse', 'HEAD']);
    assert.notEqual(mergeCommit, sideCommit);
    rmSync(join(state, 'released')); rmSync(join(state, 'asset'));
    ok('bash', ['-c', script]);
    assert.equal(ok('git', ['rev-parse', `refs/tags/v${next}^{commit}`]), mergeCommit);
    assert.equal(ok('git', ['rev-parse', 'HEAD']), mergeCommit);
  } finally { rmSync(tmp, { recursive: true, force: true }); }
});
