import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = new URL('../extensions/safari/generated/', import.meta.url);
const build = spawnSync(process.execPath, ['scripts/build-extension.mjs'], { cwd: root, encoding: 'utf8' });
const load = name => JSON.parse(readFileSync(new URL(name, output), 'utf8'));
const manifest = build.status === 0 ? load('manifest.json') : null;
const rules = build.status === 0 ? load('rules/normalize.json') : [];
const suffixes = JSON.parse(readFileSync(new URL('../config/google-domains.json', import.meta.url)));

// Static DNR model, NOT proof of Safari/RE2 behavior. requestDomains intentionally
// includes subdomains, matching the API: only regexFilter may enforce exact hosts.
const matchers = rules.map(rule => ({ rule, domains: new Set(rule.condition.requestDomains), regex: new RegExp(rule.condition.regexFilter) }));
function redirect(url, method = 'get', type = 'main_frame') {
  const parsed = new URL(url);
  const labels = parsed.hostname.split('.');
  const ancestors = labels.map((_, i) => labels.slice(i).join('.'));
  const hits = matchers.filter(({ rule: { condition: c }, domains, regex }) => c.requestMethods.includes(method.toLowerCase()) &&
    c.resourceTypes.includes(type) && ancestors.some(d => domains.has(d)) && regex.test(url));
  assert.ok(hits.length <= 1, `overlapping rules: ${url}`);
  if (!hits.length) return null;
  const { rule, regex } = hits[0];
  return url.replace(regex, rule.action.redirect.regexSubstitution.replace(/\\([0-9])/g, '$$$1'));
}
const target = path => `https://www.google.com${path}`;

test('offline builder creates the optional extension successfully', () => {
  assert.equal(build.status, 0, build.stderr);
  assert.ok(manifest);
});

test('manifest is static, permission-scoped, GET-safe Safari 26 source', () => {
  assert.ok(manifest, 'builder must generate manifest');
  assert.equal(manifest.manifest_version, 3);
  assert.equal(manifest.author, 'LIFANULTRA');
  assert.equal(manifest.browser_specific_settings.safari.strict_min_version, '26.0');
  assert.deepEqual(manifest.permissions, ['declarativeNetRequestWithHostAccess']);
  for (const forbidden of ['background', 'content_scripts', 'web_accessible_resources', 'externally_connectable', 'update_url']) {
    assert.equal(manifest[forbidden], undefined, forbidden);
  }
  const expected = suffixes.flatMap(s => [`*://google.${s}/*`, `*://www.google.${s}/*`]);
  expected.push('*://google.con/*', '*://www.google.con/*');
  assert.deepEqual([...manifest.host_permissions].sort(), expected.sort());
  assert.deepEqual(manifest.declarative_net_request.rule_resources,
    [{ id: 'normalize', enabled: true, path: 'rules/normalize.json' }]);
});

test('rules are bounded, anchored, explicit GET main-frame only and RE2-shaped', () => {
  assert.ok(rules.length > 0 && rules.length <= 128);
  const ids = new Set();
  for (const rule of rules) {
    assert.ok(!ids.has(rule.id)); ids.add(rule.id);
    assert.equal(rule.action.type, 'redirect');
    assert.equal(rule.action.redirect.regexSubstitution, 'https://www.google.com\\1');
    assert.deepEqual(rule.condition.requestMethods, ['get']);
    assert.deepEqual(rule.condition.resourceTypes, ['main_frame']);
    assert.equal(rule.condition.isUrlFilterCaseSensitive, true);
    const regex = rule.condition.regexFilter;
    assert.ok(Buffer.byteLength(regex) <= 2048, `${rule.id}: ${Buffer.byteLength(regex)}`);
    assert.ok(!regex.includes('|') && !/\\[sSdDwW]/.test(regex), 'Safari content-rule parser rejects disjunction and built-in classes');
    assert.ok(regex.startsWith('^') && regex.endsWith('$'));
    assert.ok(!/\(\?[=!<]|\\[1-9]|\\[pPkK]|\(\?>/.test(regex), regex);
    assert.equal(rule.action.redirect.transform, undefined, 'query must not be rewritten');
  }
});

test('all 188 official suffixes and exact con hosts normalize safe paths', () => {
  assert.equal(suffixes.length, 188);
  for (const suffix of [...suffixes, 'con']) for (const host of [`google.${suffix}`, `www.google.${suffix}`]) {
    for (const scheme of ['http', 'https']) for (const path of ['/', '/?client=safari#home', '/webhp?authuser=1', '/search?q=C%2B%2B&client=safari#frag']) {
      const input = `${scheme}://${host}${path}`;
      assert.equal(redirect(input), host === 'www.google.com' && scheme === 'https' ? null : target(path), input);
    }
  }
});

test('query bytes, unknown params, repeated params and fragments survive exactly', () => {
  for (const path of [
    '/search?client=safari&q=%E4%B8%AD%E6%96%87&authuser=2&x=%2f%2F&x=1#%E4%B8%AD',
    '/search?&&safe=active&q=++hello++&q=second&sourceid=chrome&client=keep#x?y',
    '/search?q=%20%09A&foo=bar#q=changed', '/search?qq=value&q=yes', '/webhp?client=safari&utm_source=x#search',
    '/?q=&client=safari#', '/search?q=%E2%82%AC', '/search?q=%2520', '/search?q=C++'
  ]) assert.equal(redirect(`https://google.co.uk${path}`), target(path), path);
});

test('search requires a first literal q with nonblank decoded content', () => {
  const blank = ['', '+', '%20', '%09%0a%0D', '%C2%A0', '%E1%9A%80', '%E2%80%80', '%E2%80%A8', '%E2%81%9F', '%E3%80%80', '%EF%BB%BF', '+%20%C2%A0'];
  for (const q of blank) {
    assert.equal(redirect(`https://google.fr/search?q=${q}`), null, q);
    assert.equal(redirect(`https://google.fr/search?q=${q}&q=second`), null, `first q: ${q}`);
  }
  for (const path of ['/search', '/search?', '/search?query=abc', '/search?Q=abc', '/search?q&x=1&q=later', '/search?%71=abc', '/search?%71=&q=later', '/search?x=%26q=abc', '/search#q=abc']) {
    assert.equal(redirect(`https://google.fr${path}`), null, path);
  }
});

test('non-search services, lookalikes, subdomains and authority tricks are untouched', () => {
  const unsafe = [
    'https://google.con.evil.test/', 'https://www.google.co.uk.evil.test/',
    'https://evilgoogle.com/', 'https://google.zz/', 'https://google.comm/',
    'https://mail.google.com/', 'https://accounts.google.com/', 'https://maps.google.fr/',
    'https://foo.google.con/', 'https://foo.www.google.fr/', 'https://www.google.fr./',
    'https://user:pass@google.fr/', 'https://google.fr@evil.test/',
    'https://google.fr:444/', 'http://google.fr:8080/', 'ftp://google.fr/',
    'https://google.fr/url?q=hello', 'https://google.fr/maps?q=hello',
    'https://google.fr/searching?q=hello', 'https://google.fr/search/?q=hello',
    'https://google.fr/SEARCH?q=hello', 'https://google.fr/Webhp',
    'https://google.fr/webhp/extra', 'https://google.fr//?q=hello',
    'https://google.fr/%73earch?q=hello', 'https://google.fr/?next=https://evil.test/'
  ];
  for (const input of unsafe.slice(0, -1)) assert.equal(redirect(input), null, input);
  assert.equal(redirect(unsafe.at(-1)), target('/?next=https://evil.test/'));
});

test('inherited requestDomains cannot admit nested Google-looking subdomains', () => {
  for (const suffix of [...suffixes, 'con']) {
    for (const prefix of ['google.', 'www.google.', 'google.co.', 'google.com.', 'foo.www.']) {
      assert.equal(redirect(`https://${prefix}google.${suffix}/search?q=ok`), null);
    }
  }
});

test('POST, HEAD and subresources never redirect, including a valid query string', () => {
  for (const method of ['post', 'head', 'put', 'delete', 'options', 'patch']) {
    assert.equal(redirect('https://google.con/search?q=valid', method), null, method);
    assert.equal(redirect('https://google.fr/', method), null, method);
  }
  for (const type of ['sub_frame', 'xmlhttprequest', 'script', 'image', 'other']) {
    assert.equal(redirect('https://google.fr/search?q=valid', 'get', type), null, type);
  }
});

test('every redirected destination is a fixed point', () => {
  for (const host of new Set(rules.flatMap(rule => rule.condition.requestDomains))) {
    for (const path of ['/', '/webhp?client=keep', '/search?q=ok#fragment']) {
      const output = redirect(`http://${host}${path}`);
      if (output) assert.equal(redirect(output), null, output);
    }
  }
});

test('build output is deterministic and documentation explains installation limits', () => {
  assert.ok(manifest);
  const before = ['manifest.json', 'rules/normalize.json'].map(n => readFileSync(new URL(n, output), 'utf8'));
  const again = spawnSync(process.execPath, ['scripts/build-extension.mjs'], { cwd: root, encoding: 'utf8' });
  assert.equal(again.status, 0, again.stderr);
  assert.deepEqual(['manifest.json', 'rules/normalize.json'].map(n => readFileSync(new URL(n, output), 'utf8')), before);
  assert.ok(!existsSync(new URL('background.js', output)));
  const readme = readFileSync(new URL('../extensions/safari/README.md', import.meta.url), 'utf8');
  for (const term of ['26', 'Xcode', 'DNS', 'google.con', 'POST', 'fragment', 'RE2', 'node scripts/build-extension.mjs']) assert.ok(readme.includes(term), term);
});
