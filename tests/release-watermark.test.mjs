import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, cpSync, copyFileSync, readFileSync, writeFileSync, rmSync, chmodSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, delimiter } from 'node:path';
import { spawnSync } from 'node:child_process';

// A previously published date tag is the release watermark: a new version must
// exceed it, even when the immediately preceding commit had a lower version
// (for example after a failed downgrade).
test('new version must exceed the highest existing date tag, not only the previous commit', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'release-watermark-'));
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
view) [ "$3" = "$(cat "$STATE/tag")" ] || { echo 'HTTP 404' >&2; exit 1; }; case "$*" in *assets*) echo Google-Search-Redirect.js;; *) echo '{}';; esac;;
create) printf '%s' "$3" > "$STATE/tag"; touch "$STATE/released";;
download) cp "$STATE/asset" "$RUNNER_TEMP/release-asset/Google-Search-Redirect.js";;
upload) cp "$4" "$STATE/asset";;
*) exit 2;;
esac
`;
  writeFileSync(join(bin, 'gh'), gh); chmodSync(join(bin, 'gh'), 0o755);
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
    for (const path of ['scripts', 'config', 'src', '.github']) cpSync(resolve(path), join(repo, path), { recursive: true });
    copyFileSync(resolve('package.json'), join(repo, 'package.json'));
    const commitVersion = version => {
      writeFileSync(join(repo, 'config/version.json'), JSON.stringify({ version }));
      ok('node', ['scripts/build.mjs']);
      ok('git', ['add', '.']); ok('git', ['commit', '-m', `version ${version}`]);
      return ok('git', ['rev-parse', 'HEAD']);
    };
    const script = readFileSync(join(repo, '.github/workflows/release.yml'), 'utf8')
      .split('        run: |\n')[1].split('\n').map(line => line.startsWith('          ') ? line.slice(10) : line).join('\n');

    commitVersion('2026.01.01.0001');
    ok('bash', ['-c', script]);
    // Simulate an already published, higher release plus unrelated tags.
    ok('git', ['tag', 'v2099.12.31.2359']);
    ok('git', ['tag', 'v99999.99.99.9999']); // not the release format; must be ignored
    ok('git', ['tag', 'v1.0.0']); // numeric but not date format; must be ignored
    assert.equal(readFileSync(join(state, 'tag'), 'utf8'), 'v2026.01.01.0001');

    const lower = commitVersion('2099.01.01.0000');
    const rejected = run('bash', ['-c', script]);
    assert.notEqual(rejected.status, 0, 'version below the published watermark must fail');
    assert.match(rejected.stderr, /lower than existing release tag/);
    assert.equal(ok('git', ['rev-parse', `refs/tags/v2026.01.01.0001^{commit}`]).length, 40);
    const noTag = run('git', ['rev-parse', '--verify', '--quiet', 'refs/tags/v2099.01.01.0000^{commit}']);
    assert.notEqual(noTag.status, 0, 'no tag for a rejected version');

    // A second, slightly higher but still lower-than-watermark commit must also
    // fail: the watermark is the published maximum, not the previous commit.
    commitVersion('2099.01.02.0000');
    const rejectedAgain = run('bash', ['-c', script]);
    assert.notEqual(rejectedAgain.status, 0, 'still below the watermark');
    assert.match(rejectedAgain.stderr, /lower than existing release tag/);
    assert.notEqual(lower, ok('git', ['rev-parse', 'HEAD']));
  } finally { rmSync(tmp, { recursive: true, force: true }); }
});
