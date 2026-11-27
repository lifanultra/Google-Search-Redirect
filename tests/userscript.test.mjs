import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';
import test from 'node:test';

// These VM payload fixtures contain strings only: URLSearchParams implements
// the append/get/getAll/has/keys/delete subset without initializing Node's
// unrelated undici HTTP/WebAssembly stack. Real FormData is covered in WebKit.
const FormData = URLSearchParams;

const artifact = process.env.SCRIPT_UNDER_TEST || 'Google-Search-Redirect.js';
const original = readFileSync(resolve(artifact), 'utf8');
export function run(href, options = {}) {
    let source = original;
    for (const [name, value] of Object.entries(options.settings || {})) {
        source = source.replace(new RegExp(`${name}: (?:true|false)`), `${name}: ${value}`);
    }
    const listeners = new Map();
    const replacements = [];
    const historyChanges = [];
    const storage = options.storage || new Map();
    const state = { google: 'preserve me' };
    const document = {
        prerendering: !!options.prerendering,
        baseURI: href,
        referrer: options.referrer || '',
        querySelector: () => options.baseTarget ? { getAttribute: () => options.baseTarget } : null,
        addEventListener(type, fn) {
            const list = listeners.get(type) || [];
            list.push(fn);
            listeners.set(type, list);
        },
    };
    const location = { href, replace(value) { replacements.push(value); } };
    const window = {
        location, document,
        history: {
            state,
            replaceState(value, unused, url) { historyChanges.push({ state: value, url }); },
        },
        sessionStorage: {
            getItem(key) { if (options.storageDenied) throw Error('denied'); return storage.get(key) || null; },
            setItem(key, value) { if (options.storageDenied) throw Error('denied'); storage.set(key, value); },
        },
    };
    window.top = options.frame ? {} : window;
    window.self = window;
    const context = vm.createContext({
        window, document, location, history: window.history, URL, URLSearchParams, console,
        performance: { getEntriesByType: () => [{ type: options.navType || 'navigate' }] },
        Date: class extends Date { static now() { return options.now ?? 10000; } },
    });
    vm.runInContext(source, context, { filename: artifact, timeout: 1000 });
    return {
        window, document, listeners, replacements, historyChanges, storage, state,
        dispatch(type, event = {}) {
            event.eventPhase = 1;
            for (const fn of listeners.get(type) || []) fn(event);
            event.eventPhase = 0;
        },
        rerun() { vm.runInContext(source, context, { timeout: 1000 }); },
    };
}
function anchor(href, extra = {}) {
    const attrs = { href, ...extra };
    return { tagName: 'A', getAttribute: key => attrs[key] ?? null,
        setAttribute(key, value) { attrs[key] = value; },
        hasAttribute: key => key in attrs,
        closest: () => null, get href() { return attrs.href; } };
}
function click(page, a, extra = {}) {
    page.dispatch('click', { target: a, composedPath: () => [a], button: 0,
        defaultPrevented: false, ...extra });
}

test('canonical HTTPS never reloads, but removes tracking using history only', () => {
    const p = run('https://www.google.com/search?q=C%2B%2B%20%E6%9D%90%E6%96%99&utm_source=test&client=safari&hl=zh-CN#top', { settings: { cleanClient: false } });
    assert.deepEqual(p.replacements, []);
    assert.equal(p.historyChanges.length, 1);
    assert.equal(p.historyChanges[0].url, 'https://www.google.com/search?q=C%2B%2B%20%E6%9D%90%E6%96%99&client=safari&hl=zh-CN#top');
    assert.equal(p.historyChanges[0].state, p.state);
});
test('canonical clean URL does not read storage or rewrite history', () => {
    const p = run('https://www.google.com/search?q=test&client=safari', { storageDenied: true, settings: { cleanClient: false } });
    assert.equal(p.historyChanges.length, 0);
    assert.equal(p.replacements.length, 0);
    assert.equal(p.listeners.get('click')?.length, 1);
});
test('optional client cleanup uses no reload and preserves all other raw fields', () => {
    const p = run('https://www.google.com/search?q=a%20b&q=%2B&%63lient=safari&sourceid=chrome&rls=en&udm=2&tbs=qdr%3Aw&start=10&safe=active&authuser=1&ie=UTF-8&x=%2f#abc', { settings: { cleanClient: true } });
    assert.equal(p.replacements.length, 0);
    assert.equal(p.historyChanges[0]?.url, 'https://www.google.com/search?q=a%20b&q=%2B&udm=2&tbs=qdr%3Aw&start=10&safe=active&authuser=1&ie=UTF-8&x=%2f#abc');
});
test('regional navigation combines canonicalization and cleanup in one replacement', () => {
    const p = run('http://google.co.jp/search?q=x%20y&utm_medium=a&tbm=isch#z');
    assert.deepEqual(p.replacements, ['https://www.google.com/search?q=x%20y&tbm=isch#z']);
    assert.deepEqual(p.historyChanges, []);
});
test('client cleanup and tracking cleanup are independent switches', () => {
    const p = run('https://www.google.com/search?q=a&utm_source=b&client=safari', { settings: { cleanTracking: false, cleanClient: true } });
    assert.equal(p.historyChanges[0]?.url, 'https://www.google.com/search?q=a&utm_source=b');
});

test('only allowed hosts/paths/contexts are touched', () => {
    const urls = [
        'https://google.com.evil.test/search?q=x', 'https://notgoogle.com/search?q=x',
        'https://accounts.google.com/search?q=x', 'https://www.google.com/maps?q=x&utm_source=b',
        'https://www.google.co.jp/url?q=https://example.com', 'https://www.google.co.jp/sorry/index?q=x',
        'https://user:secret@google.co.jp/search?q=x', 'https://google.co.jp:8443/search?q=x',
        'ftp://google.co.jp/search?q=x', 'https://google.con/search?q=x',
        'https://google.co.jp/search?client=safari', 'https://google.co.jp/search?q=',
        'https://google.co.jp/search?foo=q%3Dx',
    ];
    for (const url of urls) {
        const p = run(url);
        assert.equal(p.replacements.length + p.historyChanges.length + p.listeners.size, 0, url);
    }
    assert.equal(run('https://google.co.jp/search?q=x', { frame: true }).listeners.size, 0);
});

test('different rapid searches are never stopped by a global attempt count', () => {
    const storage = new Map();
    for (let i = 0; i < 12; i++) {
        assert.equal(run(`https://google.co.jp/search?q=${i}`, { storage, now: 10000 + i }).replacements.length, 1);
    }
});
test('repeat bounce ignores changing telemetry but retains functional distinctions', () => {
    const storage = new Map();
    assert.equal(run('https://google.co.jp/search?q=a&ei=1', { storage }).replacements.length, 1);
    assert.equal(run('https://google.co.jp/search?q=a&ei=2', { storage }).replacements.length, 0);
    assert.equal(run('https://google.co.jp/search?q=a&ei=2&udm=2', { storage }).replacements.length, 1);
    assert.equal(run('https://google.co.jp/search?q=a', { storage, now: 140000 }).replacements.length, 1);
});
test('storage denial stops forced cross-origin navigation but not future event handling', () => {
    const p = run('https://google.co.jp/search?q=x', { storageDenied: true });
    assert.equal(p.replacements.length, 0);
    assert.equal(p.listeners.get('click')?.length, 1);
});
test('history traversal never forces navigation or modifies the restored entry', () => {
    const p = run('https://google.co.jp/search?q=x&utm_source=a', { navType: 'back_forward' });
    assert.equal(p.replacements.length + p.historyChanges.length, 0);
    assert.equal(p.listeners.get('click')?.length, 1);
});
test('prerender does no work until activation, which runs once', () => {
    const p = run('https://google.co.jp/search?q=x', { prerendering: true });
    assert.equal(p.replacements.length, 0);
    p.document.prerendering = false;
    p.dispatch('prerenderingchange');
    assert.equal(p.replacements.length, 1);
    p.dispatch('prerenderingchange');
    p.rerun();
    assert.equal(p.replacements.length, 1);
    assert.equal(p.listeners.get('click')?.length, 1);
});
test('delegated links fix subsequent Google search requests without owning navigation', () => {
    const p = run('https://www.google.com/search?q=x');
    const a = anchor('https://google.co.jp/search?q=next&utm_source=x&client=safari');
    click(p, a, { ctrlKey: true });
    assert.equal(a.href, 'https://www.google.com/search?q=next');
    assert.equal(p.replacements.length, 0);
    const typo = anchor('https://Google.con/search?q=test');
    click(p, typo);
    assert.equal(typo.href, 'https://www.google.com/search?q=test');
    const nested = { tagName: 'SPAN', closest: () => a };
    p.dispatch('click', { target: nested, button: 0, composedPath: () => [nested, a] });
    const middle = anchor('https://google.de/search?q=z');
    p.dispatch('auxclick', { target: middle, button: 1, composedPath: () => [middle] });
    assert.equal(middle.href, 'https://www.google.com/search?q=z');
});
test('links respect opt-out, other protocols/services, download and pre-cancelled events', () => {
    const p = run('https://www.google.com/search?q=x');
    for (const href of ['javascript:alert(1)', 'https://evil.test/?q=x', 'https://google.de/maps?q=x']) {
        const a = anchor(href); click(p, a); assert.equal(a.href, href);
    }
    const d = anchor('https://google.de/search?q=x', { download: '' });
    click(p, d); assert.equal(d.href, 'https://google.de/search?q=x');
    const a = anchor('https://google.de/search?q=x');
    click(p, a, { defaultPrevented: true }); assert.equal(a.href, 'https://google.de/search?q=x');
    const p2 = run('https://www.google.com/search?q=x', { settings: { fixLinkTypos: false } });
    const typo = anchor('https://google.con/search?q=x'); click(p2, typo);
    assert.equal(typo.href, 'https://google.con/search?q=x');
});
function form(action, controls = [], attrs = {}) {
    const data = { action, method: 'get', ...attrs };
    return { tagName: 'FORM', elements: controls,
        getAttribute: key => data[key] ?? null,
        setAttribute(key, value) { data[key] = value; },
        hasAttribute: key => key in data,
        get action() { return data.action; },
    };
}
function input(name, value = 'x', extra = {}) {
    return { tagName: 'INPUT', type: 'hidden', name, value, disabled: false, ...extra };
}
test('native GET payload is cleaned without modifying target or controls', () => {
    const p = run('https://www.google.com/search?q=x');
    const q = input('q', 'C++'); const utm = input('utm_source'); const client = input('client', 'safari');
    const f = form('https://google.co.jp/search', [q, utm, client]);
    p.dispatch('submit', { target: f });
    assert.equal(f.action, 'https://google.co.jp/search');
    assert.equal(q.disabled, false); assert.equal(utm.disabled, false); assert.equal(client.disabled, false);
    const data = new FormData();
    data.append('q', 'C++'); data.append('utm_source', 'test'); data.append('client', 'safari');
    p.dispatch('formdata', { target: f, formData: data });
    assert.equal(f.action, 'https://google.co.jp/search');
    assert.equal(data.get('q'), 'C++'); assert.equal(data.has('utm_source'), false);
    assert.equal(data.has('client'), false);
    assert.equal(q.value, 'C++'); assert.equal(p.replacements.length, 0);
});
test('POST, non-self forms and unsupported submitter overrides stay untouched', () => {
    const p = run('https://www.google.com/search?q=x');
    for (const attrs of [{ method: 'post' }, { target: '_blank' }]) {
        const f = form('https://google.de/search', [input('q')], attrs);
        p.dispatch('submit', { target: f }); assert.equal(f.action, 'https://google.de/search');
    }
    const f = form('https://google.de/search', [input('q')]);
    const submitter = { getAttribute: key => key === 'formmethod' ? 'post' : null, hasAttribute: key => key === 'formmethod' };
    p.dispatch('submit', { target: f, submitter });
    assert.equal(f.action, 'https://google.de/search');
});
test('queryless GET forms without a successful nonempty q remain untouched', () => {
    const p = run('https://www.google.com/');
    for (const controls of [[], [input('q', '')], [input('q', 'x', { disabled: true })]]) {
        const f = form('https://google.de/search', controls);
        p.dispatch('submit', { target: f }); assert.equal(f.action, 'https://google.de/search');
    }
});
test('install is idempotent', () => {
    const p = run('https://www.google.com/search?q=x');
    p.rerun();
    assert.equal(p.listeners.get('click')?.length, 1);
    assert.equal(p.listeners.get('submit')?.length, 1);
});
test('generated metadata includes canonical HTTPS without all-web permissions', () => {
    assert.match(original, /@match\s+https:\/\/www\.google\.com\/\*/);
    assert.doesNotMatch(original, /@match\s+\*:\/\/\*\/\*/);
    assert.match(original, /@run-at\s+document-start/);
    assert.doesNotMatch(original, /@require\s|@connect\s/);
    const canonical = 'https://raw.githubusercontent.com/lifanultra/Google-Search-Redirect/refs/heads/main/Google-Search-Redirect.js';
    assert.match(original, /@author\s+LIFANULTRA\n/);
    assert.equal(original.match(/@downloadURL\s+(\S+)/)?.[1], canonical);
    assert.equal(original.match(/@updateURL\s+(\S+)/)?.[1], canonical);
});
test('disabling address cleanup never falls back to a page reload', () => {
    const p = run('https://www.google.com/search?q=x&utm_source=a', { settings: { cleanAddressBar: false } });
    assert.equal(p.replacements.length + p.historyChanges.length, 0);
});
test('raw malformed/duplicate query fields survive removal of only selected keys', () => {
    const p = run('https://www.google.com/search?q=C%2B%2B&q=a+b&bad=%E0%A4%A&%ZZ=x&utm_source=a&&custom=%2f%2F#q=x');
    assert.equal(p.historyChanges[0]?.url, 'https://www.google.com/search?q=C%2B%2B&q=a+b&bad=%E0%A4%A&%ZZ=x&&custom=%2f%2F#q=x');
});
test('corrupt and overlarge loop records cannot disable ordinary distinct searches', () => {
    for (const raw of ['{broken', '{}', '[["abc",9999999]]', 'x'.repeat(9000)]) {
        const storage = new Map([['lifanultra.google-search-redirect.v4', raw]]);
        const p = run('https://google.de/search?q=x', { storage });
        assert.equal(p.replacements.length, 1);
        assert.ok((storage.get('lifanultra.google-search-redirect.v4') || '').length < 8192);
    }
});
test('FormData from an unapproved or subsequently changed POST form is not filtered', () => {
    const p = run('https://www.google.com/');
    const f = form('https://google.de/search', [input('q')]);
    const data = new FormData(); data.append('q', 'x'); data.append('utm_source', 'a');
    p.dispatch('formdata', { target: f, formData: data }); assert.equal(data.has('utm_source'), true);
    p.dispatch('submit', { target: f }); f.setAttribute('method', 'post');
    p.dispatch('formdata', { target: f, formData: data }); assert.equal(data.has('utm_source'), true);
});
test('forms inheriting a non-self base target remain unchanged', () => {
    const p = run('https://www.google.com/', { baseTarget: '_blank' });
    const f = form('https://google.de/search', [input('q')]);
    p.dispatch('submit', { target: f });
    assert.equal(f.action, 'https://google.de/search');
});
test('GET action is not changed during submit dispatch or an early FormData inspection', () => {
    const p = run('https://www.google.com/');
    const f = form('https://google.de/search', [input('q')]);
    const early = new FormData(); early.append('q', 'x'); early.append('utm_source', 'a');
    p.document.addEventListener('submit', () => {
        assert.equal(f.action, 'https://google.de/search');
        p.dispatch('formdata', { target: f, formData: early });
        assert.equal(f.action, 'https://google.de/search');
        assert.equal(early.has('utm_source'), true);
    });
    p.dispatch('submit', { target: f });
    const final = new FormData(); final.append('q', 'x'); final.append('utm_source', 'a');
    p.dispatch('formdata', { target: f, formData: final });
    assert.equal(f.action, 'https://google.de/search');
    assert.equal(final.has('utm_source'), false);
});
test('later cancellation, method/target changes and submitter overrides never rewrite action', () => {
    for (const change of ['post', 'target', 'cancel', 'submitter']) {
        const p = run('https://www.google.com/');
        const f = form('https://google.de/search', [input('q')]);
        let override = false;
        const submitter = { hasAttribute: () => override };
        const event = { target: f, submitter };
        p.document.addEventListener('submit', e => {
            if (change === 'post') f.setAttribute('method', 'post');
            if (change === 'target') f.setAttribute('target', '_blank');
            if (change === 'cancel') e.defaultPrevented = true;
            if (change === 'submitter') override = true;
        });
        p.dispatch('submit', event);
        const data = new FormData(); data.append('q', 'x'); data.append('utm_source', 'a');
        p.dispatch('formdata', { target: f, formData: data });
        assert.equal(f.action, 'https://google.de/search', change);
        assert.equal(data.has('utm_source'), true, change);
    }
});
test('slow bounces, telemetry drift, query ordering and fragment drift are suppressed', () => {
    const storage = new Map();
    assert.equal(run('https://google.de/search?hl=en&q=same&gs_lp=1&sca_esv=1#one', { storage, now: 10000 }).replacements.length, 1);
    assert.equal(run('https://google.de/search?sca_esv=2&q=same&hl=en&gs_lp=2#two', { storage, now: 13100 }).replacements.length, 0);
    assert.equal(run('https://google.de/search?q=same&hl=en&gs_lp=3', { storage, now: 41000 }).replacements.length, 0);
    assert.equal(run('https://google.de/search?q=same&hl=zh-CN', { storage, now: 42000 }).replacements.length, 1);
});
test('known Google result wrappers resolve locally once without over-decoding target URLs', () => {
    const p = run('https://www.google.com/search?q=x');
    const target = 'https://example.test/page?q=C%2B%2B&url=https%3A%2F%2Fkeep.test%2F#part';
    const a = anchor('https://www.google.co.jp/url?sa=t&url=' + encodeURIComponent(target));
    click(p, a); assert.equal(a.href, target); assert.equal(p.replacements.length, 0);
    const inner = 'https://google.de/url?q=' + encodeURIComponent(target);
    const nested = anchor('https://google.com/url?url=' + encodeURIComponent(inner));
    click(p, nested); assert.equal(nested.href, target);
});
test('result unwrapping skips ambiguous, unsafe, excessive and opted-out targets', () => {
    const p = run('https://www.google.com/search?q=x');
    for (const query of ['q=javascript%3Aalert(1)', 'q=https%3A%2F%2Fu%3Ap%40evil.test',
        'q=https%3A%2F%2Fa.test&url=https%3A%2F%2Fb.test', 'q=https%3A%2F%2Fa.test&q=https%3A%2F%2Fb.test']) {
        const a = anchor('https://www.google.com/url?' + query); click(p, a);
        assert.equal(a.href, 'https://www.google.com/url?' + query);
    }
    const p2 = run('https://www.google.com/search?q=x', { settings: { directResultLinks: false } });
    const a = anchor('https://www.google.com/url?q=https%3A%2F%2Fexample.test%2F');
    click(p2, a); assert.equal(a.href, 'https://www.google.com/url?q=https%3A%2F%2Fexample.test%2F');
});
test('context menu prepares eligible search links without cancelling native UI', () => {
    const p = run('https://www.google.com/search?q=x');
    const a = anchor('https://google.con/search?q=next');
    p.dispatch('contextmenu', { target: a, button: 2, composedPath: () => [a] });
    assert.equal(a.href, 'https://www.google.com/search?q=next');
    assert.equal(p.replacements.length, 0);
});
test('functional Google compatibility parameters survive default cleanup', () => {
    const url = 'https://www.google.com/search?q=x&gws_rd=cr&ie=gbk&oe=gbk&hl=zh-CN&gl=US&safe=active&authuser=2';
    const p = run(url); assert.equal(p.historyChanges.length + p.replacements.length, 0);
});
test('references are footer-only and contain all seven user-specified ScriptCat sources', () => {
    const offset = original.indexOf('参考文献 / References');
    assert.ok(offset > original.lastIndexOf('})();'));
    const before = original.slice(0, offset);
    const footer = original.slice(offset);
    assert.doesNotMatch(before, /scriptcat\.org|githubusercontent\.com\/(?:ClearURLs|Smile4ever|tunggian|AdguardTeam)\//);
    for (const id of [1706, 5392, 8937, 5462, 3053, 3211, 2567]) assert.ok(footer.includes(`/scripts/code/${id}/`), String(id));
    assert.ok(original.trimEnd().endsWith('*/'));
});
test('challenge, consent and account flows never install listeners or issue navigation', () => {
    for (const url of [
        'https://www.google.com/sorry/index?continue=https%3A%2F%2Fwww.google.com%2Fsearch%3Fq%3Dx',
        'https://google.co.jp/sorry/?q=x', 'https://ipv4.google.com/sorry/index?q=x',
        'https://consent.google.com/m?continue=x', 'https://accounts.google.com/signin?continue=x',
        'https://www.google.com/recaptcha/api2/anchor?q=x',
    ]) {
        const p = run(url);
        assert.equal(p.listeners.size + p.replacements.length + p.historyChanges.length, 0, url);
    }
});
test('excessive nested wrappers and external business url parameters are never guessed', () => {
    const p = run('https://www.google.com/search?q=x');
    let href = 'https://example.test/?url=https%3A%2F%2Fkeep.test';
    for (let i = 0; i < 5; i++) href = 'https://www.google.com/url?q=' + encodeURIComponent(href);
    const a = anchor(href); click(p, a); assert.equal(a.href, href);
    const external = anchor('https://example.test/?url=https%3A%2F%2Fkeep.test');
    click(p, external); assert.equal(external.href, 'https://example.test/?url=https%3A%2F%2Fkeep.test');
});
test('all 188 official suffixes agree between runtime and exact metadata', () => {
    const suffixes = JSON.parse(readFileSync(resolve('config/google-domains.json'), 'utf8'));
    assert.equal(suffixes.length, 188);
    for (const suffix of suffixes) for (const host of [`google.${suffix}`, `www.google.${suffix}`]) {
        const href = `https://${host}/search?q=C%2B%2B&client=safari&gws_rd=cr`;
        const p = run(href);
        const expected = 'https://www.google.com/search?q=C%2B%2B&gws_rd=cr';
        assert.deepEqual(p.replacements, host === 'www.google.com' ? [] : [expected], host);
        const pattern = host === 'www.google.com' ? 'https://www.google.com/*' : `*://${host}/*`;
        assert.ok(original.includes(`// @match        ${pattern}`), pattern);
    }
});

test('client cleanup defaults on and can be explicitly disabled', () => {
    const url = 'https://www.google.com/search?q=x&client=safari&sourceid=chrome&rls=en&hl=zh-CN';
    const normal = run(url);
    assert.equal(normal.historyChanges[0]?.url, 'https://www.google.com/search?q=x&hl=zh-CN');
    assert.equal(normal.replacements.length, 0);
    const disabled = run(url, { settings: { cleanClient: false } });
    assert.equal(disabled.historyChanges.length + disabled.replacements.length, 0);
});

test('SafeRedirect research preserves strict Google host and path boundaries', () => {
    const p = run('https://www.google.com/search?q=x');
    for (const href of ['https://google.cn.evil.example/search?q=x',
        'https://google.cn@evil.example/search?q=x',
        'https://wwwXgoogle.cn/search?q=x',
        'https://maps.google.cn/search?q=x']) {
        const a = anchor(href); click(p, a); assert.equal(a.href, href);
    }
    const a = anchor('https://www.google.cn/search?q=C%2B%2B&client=safari&hl=zh-CN');
    click(p, a);
    assert.equal(a.href, 'https://www.google.com/search?q=C%2B%2B&hl=zh-CN');
});

test('homepages without search terms drop all query parameters and fragments', () => {
    for (const input of [
        'https://www.google.com.hk/?authuser=1',
        'https://www.google.com.hk/?client=safari&authuser=1',
        'https://www.google.com.hk/?hl=zh-CN&foo=bar#home',
        'https://www.google.com.hk/webhp?authuser=1',
        'https://www.google.com.hk/?q=&authuser=1',
    ]) assert.deepEqual(run(input).replacements, ['https://www.google.com/']);
    const canonical = run('https://www.google.com/?authuser=1&client=safari#home');
    assert.deepEqual(canonical.replacements, []);
    assert.equal(canonical.historyChanges[0].url, 'https://www.google.com/');
    const search = run('https://www.google.com.hk/?q=C%2B%2B&authuser=1&hl=zh-CN');
    assert.deepEqual(search.replacements, ['https://www.google.com/?q=C%2B%2B&authuser=1&hl=zh-CN']);
});
