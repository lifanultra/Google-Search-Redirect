import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// A deliberately limited model of the metadata and structured @match paths in
// wBlock 9aef8131b26e8b99ce470a9b999155b53946a1f8, NOT its Swift parser.
// It accepts only the exact-host, /* patterns this project intends to emit.
const source = readFileSync(new URL('../Google-Search-Redirect.js', import.meta.url), 'utf8');
const suffixes = JSON.parse(readFileSync(new URL('../config/google-domains.json', import.meta.url), 'utf8'));
const canonical = 'https://raw.githubusercontent.com/lifanultra/Google-Search-Redirect/refs/heads/main/Google-Search-Redirect.js';
function metadata(text) {
    const result = new Map();
    let inside = false, closed = false;
    for (const raw of text.split(/\r?\n/)) {
        const line = raw.trim();
        if (line.startsWith('// ==UserScript==')) { inside = true; continue; }
        if (line.startsWith('// ==/UserScript==')) { closed = true; break; }
        if (!inside || !line.startsWith('// @')) continue;
        const match = line.slice(3).trim().match(/^(\S+)(?:\s+(.*))?$/);
        if (!match) continue;
        const key = match[1].toLowerCase();
        result.set(key, [...(result.get(key) || []), (match[2] || '').trim()]);
    }
    assert.ok(inside && closed, 'complete metadata block required');
    return result;
}
function accepts(pattern, input) {
    const parts = /^(\*|http|https):\/\/([a-z0-9.]+)\/\*$/.exec(pattern);
    assert.ok(parts, `unsupported or too broad pattern: ${pattern}`);
    const url = new URL(input);
    return (parts[1] === '*' ? ['http:', 'https:'].includes(url.protocol) : url.protocol === parts[1] + ':') && url.hostname === parts[2];
}
function validate(text) {
    const m = metadata(text);
    assert.deepEqual(m.get('@run-at'), ['document-start']);
    assert.deepEqual(m.get('@grant'), ['none']);
    assert.deepEqual(m.get('@noframes'), ['']);
    assert.deepEqual(m.get('@downloadurl'), [canonical]);
    assert.deepEqual(m.get('@updateurl'), [canonical]);
    for (const key of ['@require', '@resource', '@include', '@exclude', '@exclude-match', '@inject-into']) assert.ok(!m.has(key), key);
    const expected = suffixes.flatMap(s => [`*://google.${s}/*`, ...(s === 'com' ? ['http://www.google.com/*', 'https://www.google.com/*'] : [`*://www.google.${s}/*`])]);
    assert.deepEqual(m.get('@match'), expected);
    return m.get('@match');
}

test('generated metadata preserves wBlock-compatible, narrowly scoped directives', () => {
    const patterns = validate(source);
    for (const suffix of suffixes) for (const prefix of ['', 'www.']) for (const protocol of ['http', 'https']) {
        const url = `${protocol}://${prefix}google.${suffix}/search?q=a#fragment`;
        assert.ok(patterns.some(p => accepts(p, url)), url);
    }
    for (const url of ['https://accounts.google.com/', 'https://maps.google.com/', 'https://mail.google.com/', 'https://google.com.evil.test/', 'https://evilgoogle.com/', 'https://google.con/', 'ftp://google.com/']) {
        assert.ok(!patterns.some(p => accepts(p, url)), url);
    }
});

test('guard detects broken metadata and accidental scope expansion', () => {
    for (const broken of [
        source.replace('@run-at       document-start', '@run-at       document-end'),
        source.replace('@grant        none', '@grant        GM_setValue'),
        source.replace('@match        *://google.ad/*', '@match        *://*/*'),
        source.replace('@downloadURL  ' + canonical, '@downloadURL  https://example.invalid/script.js'),
        source.replace('// ==/UserScript==', '// @require https://example.invalid/lib.js\n// ==/UserScript=='),
    ]) assert.throws(() => validate(broken));
    assert.equal(accepts('*://google.com/*', 'https://google.com/search?q=x#foo'), true);
    assert.equal(accepts('*://google.com/*', 'https://x.google.com/'), false);
    assert.equal(accepts('*://google.com/*', 'ftp://google.com/'), false);
});
