import { readFile, mkdir, writeFile } from 'node:fs/promises';

// Offline source generator only: no extension runtime JavaScript or network I/O.
const root = new URL('../', import.meta.url);
const output = new URL('extensions/safari/generated/', root);
const suffixes = JSON.parse(await readFile(new URL('config/google-domains.json', root), 'utf8'));
if (suffixes.length !== 188 || new Set(suffixes).size !== suffixes.length ||
    !suffixes.every(s => /^(?:com?\.)?[a-z]{2,3}$/.test(s)) || !suffixes.includes('com')) {
  throw new Error('Unexpected official Google suffix allowlist');
}
const foldHex = value => value.replace(/[A-F]/g, c => `[${c}${c.toLowerCase()}]`);
const blankPoints = [9, 10, 11, 12, 13, 32, 160, 5760, ...Array.from({ length: 11 }, (_, i) => 8192 + i), 8232, 8233, 8239, 8287, 12288, 65279];
const blankBytes = blankPoints.map(n => [...Buffer.from(String.fromCodePoint(n))]);
// Safari's content-rule parser rejects disjunction (even though RE2 allows it).
// (A?B?...)* expresses arbitrary concatenation without the unsupported A|B.
const whitespace = `(?:\\+?${blankPoints.map(n => `(?:${foldHex(encodeURIComponent(String.fromCodePoint(n)))})?`).join('')})`;

// A finite byte trie distinguishes encoded whitespace from real query content.
// This is a regular language, not lookaround, decoding JS, or a backreference.
function hexClass(numbers) {
  const chars = [...new Set(numbers.flatMap(n => n < 10 ? [String(n)] : [n.toString(16), n.toString(16).toUpperCase()]))].sort();
  if (chars.length === 1) return chars[0];
  let result = '';
  for (let i = 0; i < chars.length;) {
    let j = i;
    while (j + 1 < chars.length && chars[j + 1].charCodeAt(0) === chars[j].charCodeAt(0) + 1) j++;
    result += j - i >= 2 ? `${chars[i]}-${chars[j]}` : chars.slice(i, j + 1).join('');
    i = j + 1;
  }
  return `[${result}]`;
}
function byteSet(bytes) {
  const groups = new Map();
  for (let high = 0; high < 16; high++) {
    const low = bytes.filter(b => b >> 4 === high).map(b => b & 15);
    if (!low.length) continue;
    const key = hexClass(low);
    groups.set(key, [...(groups.get(key) || []), high]);
  }
  return [...groups].map(([low, highs]) => `%${hexClass(highs)}${low}`);
}
function significantEncoded(sequences) {
  const heads = [...new Set(sequences.map(s => s[0]))];
  const alternatives = byteSet(Array.from({ length: 256 }, (_, i) => i).filter(b => !heads.includes(b)));
  for (const head of heads) {
    const tails = sequences.filter(s => s[0] === head).map(s => s.slice(1));
    if (!tails.some(t => !t.length)) for (const tail of significantEncoded(tails)) {
      alternatives.push(`${foldHex(`%${head.toString(16).padStart(2, '0').toUpperCase()}`)}${tail}`);
    }
  }
  return alternatives;
}
const significant = ['[^%+&#\\x09-\\x0D ]', ...significantEncoded(blankBytes)];
// Encoded parameter keys before q are conservatively skipped. The optional
// sequence repeated below is a disjunction-free union of complete non-q params.
const otherParameter = '(?:(?:[^q%&=#][^%&=#]*(?:=[^&#]*)?&)?(?:q[^%&=#][^%&=#]*(?:=[^&#]*)?&)?&?)*';
const paths = [
  '(/(?:webhp)?(?:\\?[^#]*)?(?:#.*)?)',
  ...significant.map(token => `(/search\\?${otherParameter}q=${whitespace}*${token}[^&#]*(?:&[^#]*)?(?:#.*)?)`)
];
const rules = [];
function add(hostPattern, domains, scheme, path) {
  const regexFilter = `^${scheme}://${hostPattern}${path}$`;
  if (Buffer.byteLength(regexFilter) > 2048) throw new Error('DNR regex exceeds 2KB source budget');
  rules.push({
    id: rules.length + 1,
    priority: 1,
    action: { type: 'redirect', redirect: { regexSubstitution: 'https://www.google.com\\1' } },
    condition: { regexFilter, isUrlFilterCaseSensitive: true, requestDomains: domains,
      requestMethods: ['get'], resourceTypes: ['main_frame'] }
  });
}
for (const path of paths) {
  // The canonical HTTPS authority is excluded structurally; no allow-rule races.
  add('www\\.google\\.com', ['www.google.com'], 'http', path);
  add('google\\.com', ['google.com'], 'https?', path);
  // The authority grammar and requestDomains are an intersection. Official
  // suffixes are xx, com, cat, co.xx or com.xx. A subdomain ending google.xx
  // cannot fit the optional co/com prefix, even when requestDomains allows it.
  const domains = [...suffixes.filter(s => s !== 'com'), 'con']
    .flatMap(s => [`google.${s}`, `www.google.${s}`]);
  add('(?:www\\.)?google\\.(?:co(?:m)?\\.)?[a-z][a-z][a-z]?', domains, 'https?', path);
}
const manifest = {
  manifest_version: 3,
  name: 'Google Search Redirect — optional request companion',
  version: '1.0.0',
  author: 'LIFANULTRA',
  description: 'Optional static GET main-frame normalization for exact Google search hosts. No background scripts or telemetry.',
  browser_specific_settings: { safari: { strict_min_version: '26.0' } },
  permissions: ['declarativeNetRequestWithHostAccess'],
  host_permissions: [...suffixes, 'con'].flatMap(s => [`*://google.${s}/*`, `*://www.google.${s}/*`]),
  declarative_net_request: { rule_resources: [{ id: 'normalize', enabled: true, path: 'rules/normalize.json' }] }
};
await mkdir(new URL('rules/', output), { recursive: true });
await writeFile(new URL('manifest.json', output), `${JSON.stringify(manifest, null, 2)}\n`);
await writeFile(new URL('rules/normalize.json', output), `${JSON.stringify(rules, null, 2)}\n`);
console.log(`Safari companion: ${rules.length} rules; max regex ${Math.max(...rules.map(r => Buffer.byteLength(r.condition.regexFilter)))} bytes; Safari >= 26.0`);
