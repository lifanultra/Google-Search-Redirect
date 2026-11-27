// Real DOM integration fixture: no request is sent to Google.
(() => {
    const checks = [];
    function check(name, fn) {
        if (checks.length >= (window.__maxChecks ?? Infinity)) return;
        document.querySelector('pre').textContent = 'Running: ' + name;
        try { fn(); checks.push({ name, passed: true }); }
        catch (error) { checks.push({ name, passed: false, error: String(error) }); }
    }
    function equal(actual, expected) {
        if (actual !== expected) throw Error(`Expected ${JSON.stringify(expected)}; got ${JSON.stringify(actual)}`);
    }
    function page(href = 'https://www.google.com/search?q=test', settings = {}) {
        const doc = document.implementation.createHTMLDocument('fixture');
        const base = doc.createElement('base'); base.href = href; doc.head.append(base);
        const navigations = [], changes = [];
        const store = new Map();
        const state = { preserved: true };
        const win = {
            location: { href, replace: value => navigations.push(value) },
            history: { state, replaceState: (value, unused, url) => changes.push({ state: value, url }) },
            sessionStorage: { getItem: key => store.get(key), setItem: (key, value) => store.set(key, value) },
        };
        win.self = win; win.top = win;
        let source = window.__userscript;
        for (const [key, value] of Object.entries(settings)) {
            source = source.replace(new RegExp(`${key}: (?:true|false)`), `${key}: ${value}`);
        }
        new Function('window', 'document', 'performance', source)(win, doc, { getEntriesByType: () => [{ type: 'navigate' }] });
        return { doc, win, navigations, changes, state };
    }
    function submit(p, html) {
        p.doc.body.innerHTML = html;
        const form = p.doc.querySelector('form');
        form.dispatchEvent(new SubmitEvent('submit', { bubbles: true, cancelable: true }));
        return { form, data: new FormData(form) };
    }
    check('canonical raw URL cleanup preserves state without navigation', () => {
        const p = page('https://www.google.com/search?q=C%2B%2B%20%E4%B8%AD%E6%96%87&utm_source=a&client=safari#top');
        equal(p.navigations.length, 0); equal(p.changes.length, 1);
        equal(p.changes[0].url, 'https://www.google.com/search?q=C%2B%2B%20%E4%B8%AD%E6%96%87&client=safari#top');
        equal(p.changes[0].state, p.state);
    });
    check('native bubbling click handles nested anchor without cancelling', () => {
        const p = page();
        p.doc.body.innerHTML = '<a href="https://google.de/search?q=x&utm_source=y" target="_blank"><span>search</span></a>';
        const event = new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true });
        p.doc.querySelector('span').dispatchEvent(event);
        equal(p.doc.querySelector('a').href, 'https://www.google.com/search?q=x');
        equal(event.defaultPrevented, false); equal(p.navigations.length, 0);
    });
    check('native GET FormData removes tracking without changing controls', () => {
        const p = page();
        const { form, data } = submit(p, '<form action="https://google.de/search"><input name="q" value="C++"><input name="utm_source" value="a"><input name="client" value="safari"></form>');
        equal(form.action, 'https://google.de/search'); equal(data.get('q'), 'C++');
        equal(data.has('utm_source'), false); equal(data.get('client'), 'safari');
        equal(form.elements.utm_source.disabled, false); equal(form.elements.utm_source.value, 'a');
        // A later independent FormData construction is not globally filtered.
        equal(new FormData(form).get('utm_source'), 'a');
    });
    check('client opt-in affects serialized payload only', () => {
        const p = page(undefined, { cleanClient: true });
        const { data } = submit(p, '<form action="https://google.con/search"><textarea name="q">中文 + &amp;</textarea><input name="client" value="safari"><input name="tbs" value="qdr:w"></form>');
        equal(data.get('q'), '中文 + &'); equal(data.has('client'), false); equal(data.get('tbs'), 'qdr:w');
    });
    check('POST submission and its FormData remain untouched', () => {
        const p = page();
        const { form, data } = submit(p, '<form method="post" action="https://google.de/search?client=safari"><input name="q" value="x"><input name="utm_source" value="a"></form>');
        equal(form.action, 'https://google.de/search?client=safari'); equal(data.get('utm_source'), 'a');
    });
    check('disabled fieldset query does not authorize a GET form rewrite', () => {
        const p = page();
        const { form } = submit(p, '<form action="https://google.de/search"><fieldset disabled><input name="q" value="x"></fieldset></form>');
        equal(form.action, 'https://google.de/search');
    });
    check('unsafe lookalike hosts are never normalized', () => {
        const p = page(); p.doc.body.innerHTML = '<a href="https://google.com.evil.test/search?q=x">x</a>';
        p.doc.querySelector('a').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        equal(p.doc.querySelector('a').href, 'https://google.com.evil.test/search?q=x');
    });
    check('submit-handler FormData inspections do not consume final native cleanup', () => {
        const p = page();
        p.doc.body.innerHTML = '<form action="https://google.de/search"><input name="q" value="x"><input name="utm_source" value="a"></form>';
        const f = p.doc.querySelector('form');
        f.addEventListener('submit', () => {
            equal(new FormData(f).get('utm_source'), 'a');
            equal(new FormData(f).get('utm_source'), 'a');
            equal(f.action, 'https://google.de/search');
        });
        f.dispatchEvent(new SubmitEvent('submit', { bubbles: true, cancelable: true }));
        const final = new FormData(f);
        equal(final.has('utm_source'), false); equal(f.action, 'https://google.de/search');
    });
    check('a later submit handler changing GET to POST never inherits a rewritten action', () => {
        const p = page();
        p.doc.body.innerHTML = '<form action="https://google.de/search"><input name="q" value="x"><input name="utm_source" value="a"></form>';
        const f = p.doc.querySelector('form');
        f.addEventListener('submit', () => { f.method = 'post'; });
        f.dispatchEvent(new SubmitEvent('submit', { bubbles: true, cancelable: true }));
        equal(new FormData(f).get('utm_source'), 'a'); equal(f.action, 'https://google.de/search');
    });
    check('native context menu prepares a typo search link without cancelling', () => {
        const p = page();
        p.doc.body.innerHTML = '<a href="https://google.con/search?q=x">x</a>';
        const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2 });
        p.doc.querySelector('a').dispatchEvent(event);
        equal(p.doc.querySelector('a').href, 'https://www.google.com/search?q=x');
        equal(event.defaultPrevented, false);
    });
    check('known result wrappers preserve the external target query encoding', () => {
        const p = page(); const a = p.doc.createElement('a');
        const target = 'https://example.test/?q=C%2B%2B&url=https%3A%2F%2Fkeep.test';
        a.href = 'https://google.co.jp/url?q=' + encodeURIComponent(target); p.doc.body.append(a);
        // The fixture, not the product, cancels native activation after capture:
        // a correctness check must never attempt a real external navigation.
        let cancelledByProduct = null;
        a.addEventListener('click', event => {
            cancelledByProduct = event.defaultPrevented;
            event.preventDefault();
        });
        a.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        equal(cancelledByProduct, false);
        equal(a.href, target); equal(p.navigations.length, 0);
    });
    window.browserResults = { passed: checks.filter(x => x.passed).length, failed: checks.filter(x => !x.passed).length, checks };
    document.querySelector('pre').textContent = JSON.stringify(window.browserResults, null, 2);
})();
