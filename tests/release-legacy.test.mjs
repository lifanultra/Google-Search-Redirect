import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, cpSync, copyFileSync, readFileSync, writeFileSync, rmSync, chmodSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, delimiter } from 'node:path';
import { spawnSync } from 'node:child_process';

test('first migration compares the old userscript numeric version before tagging', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'release-legacy-'));
  const repo = join(tmp, 'repo'), bin = join(tmp, 'bin'), bare = join(tmp, 'remote.git');
  mkdirSync(repo); mkdirSync(bin);
  writeFileSync(join(bin, 'gh'), '#!/bin/sh\nexit 0\n'); chmodSync(join(bin, 'gh'), 0o755);
  writeFileSync(join(bin, 'npm'), '#!/bin/sh\nif [ "$1 $2" = "run check:generated" ]; then exec node scripts/build.mjs --check; fi\n[ "$1" = test ]\n'); chmodSync(join(bin, 'npm'), 0o755);
  const env = { ...process.env, PATH: `${bin}${delimiter}${process.env.PATH}`, RUNNER_TEMP: tmp, GH_TOKEN: 'offline-test', GH_REPO: 'test/repo' };
  const run = (cmd, args, options = {}) => spawnSync(cmd, args, { cwd: repo, env, encoding: 'utf8', ...options });
  const ok = (cmd, args) => { const p = run(cmd, args); assert.equal(p.status, 0, `${cmd}: ${p.stdout}\n${p.stderr}`); return p.stdout.trim(); };
  try {
    ok('git', ['init', '--bare', bare]); ok('git', ['init', '-b', 'main']);
    ok('git', ['config', 'user.name', 'Offline Test']); ok('git', ['config', 'user.email', 'offline@example.invalid']);
    ok('git', ['remote', 'add', 'origin', bare]);
    for (const path of ['scripts', 'config', 'src', '.github']) cpSync(resolve(path), join(repo, path), { recursive: true });
    copyFileSync(resolve('package.json'), join(repo, 'package.json'));
    const version = '2027.01.01.0000';
    writeFileSync(join(repo, 'config/version.json'), JSON.stringify({ version }));
    ok('node', ['scripts/build.mjs']);
    const scriptPath = join(repo, 'Google-Search-Redirect.js');
    const generated = readFileSync(scriptPath, 'utf8');
    writeFileSync(scriptPath, generated.replace(/(^\/\/ @version\s+)\S+/m, '$19999.01.01.0000'));
    rmSync(join(repo, 'config/version.json'));
    ok('git', ['add', '.']); ok('git', ['commit', '-m', 'old userscript version']);
    const legacy = ok('git', ['rev-parse', 'HEAD']);
    writeFileSync(join(repo, 'config/version.json'), JSON.stringify({ version })); ok('node', ['scripts/build.mjs']);
    ok('git', ['add', '.']); ok('git', ['commit', '-m', 'migrate version']);
    const workflow = readFileSync(join(repo, '.github/workflows/release.yml'), 'utf8').split('        run: |\n')[1].split('\n').map(line => line.startsWith('          ') ? line.slice(10) : line).join('\n');
    const release = () => run('bash', ['-c', workflow], { env: { ...env, GITHUB_SHA: ok('git', ['rev-parse', 'HEAD']) } });
    const rejected = release();
    assert.notEqual(rejected.status, 0, 'migration cannot decrease old numeric userscript version');
    assert.notEqual(run('git', ['rev-parse', '--verify', '--quiet', `refs/tags/v${version}`]).status, 0, 'rejected migration must not create a tag');
    // A normal legacy 4.0.0 to a date version is an increase.
    ok('git', ['reset', '--hard', legacy]);
    writeFileSync(scriptPath, generated.replace(/(^\/\/ @version\s+)\S+/m, '$14.0.0'));
    ok('git', ['add', '.']); ok('git', ['commit', '-m', 'legacy version 4']);
    writeFileSync(join(repo, 'config/version.json'), JSON.stringify({ version })); ok('node', ['scripts/build.mjs']);
    ok('git', ['add', '.']); ok('git', ['commit', '-m', 'migrate upward']);
    const accepted = release();
    assert.equal(accepted.status, 0, `${accepted.stdout}\n${accepted.stderr}`);
    assert.equal(ok('git', ['rev-parse', `refs/tags/v${version}^{commit}`]), ok('git', ['rev-parse', 'HEAD']));
  } finally { rmSync(tmp, { recursive: true, force: true }); }
});
