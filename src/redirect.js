// Runtime template. Generated distributions include the metadata and domain inventory.
(() => {
    'use strict';

    // Edit these switches in your installed script if desired. No remote settings.
    const SETTINGS = Object.freeze({
        cleanTracking: true, // utm_* only; not a general tracking blocker
        cleanClient: true, // remove client, sourceid, rls; set false to preserve
        cleanAddressBar: true, // same-origin history update, NEVER a reload
        fixLinkTypos: true, // exact google.con links, NOT address-bar DNS failures
        directResultLinks: true, // known Google /url wrappers only; no network resolver
    });
    const TARGET = 'www.google.com';
    const SUFFIXES = new Set(/* GOOGLE_SUFFIXES */);
    const MARKER = '__lifanultraGoogleSearchRedirectV4';
    const KEY = 'lifanultra.google-search-redirect.v4';
    const COOLDOWN_MS = 120000;
    const MAX_RECORDS = 32;
    const CLIENT_KEYS = new Set(['client', 'sourceid', 'rls']);
    const BOUNCE_KEYS = new Set(['client', 'sourceid', 'rls', 'ei', 'sei', 'ved',
        'oq', 'aqs', 'gs_lcrp', 'gs_l', 'gs_lcp', 'gs_lp', 'sca_esv', 'sca_upv', 'sxsrf', 'iflsig']);

    if (window.top !== window.self || window[MARKER]) return;

    function keyOf(segment) {
        try {
            return decodeURIComponent(segment.split('=', 1)[0].replace(/\+/g, ' '));
        } catch {
            return ''; // Unknown/malformed keys must survive, not break the page.
        }
    }

    function removeKey(key) {
        return (SETTINGS.cleanTracking && /^utm_/i.test(key)) ||
            (SETTINGS.cleanClient && CLIENT_KEYS.has(key));
    }

    // Filter raw segments; never reserialize kept values, duplicate keys or escapes.
    function filteredSearch(search, predicate) {
        if (!search) return search;
        const parts = search.slice(1).split('&');
        const keep = parts.filter(part => !predicate(keyOf(part)));
        return keep.length === parts.length ? search : keep.length ? '?' + keep.join('&') : '';
    }

    function googleHost(hostname, allowTypo = false) {
        const match = /^(?:www\.)?google\.([a-z.]+)$/.exec(hostname);
        return !!match && (SUFFIXES.has(match[1]) ||
            (allowTypo && SETTINGS.fixLinkTypos && match[1] === 'con'));
    }

    function eligible(input, base, allowTypo = false, allowEmptySearch = false) {
        let url;
        try { url = new URL(input, base); } catch { return null; }
        if (!['http:', 'https:'].includes(url.protocol) ||
            url.username || url.password || url.port) return null;
        if (!googleHost(url.hostname, allowTypo)) return null;
        // Restrict processing to the known Google search entry paths.
        if (!['/', '/webhp', '/webhp/', '/search', '/search/'].includes(url.pathname)) return null;
        // URL alone cannot reveal an original POST body. Only explicit query searches
        // are eligible for automatic /search normalization; native POST forms are skipped.
        if ((url.pathname === '/search' || url.pathname === '/search/') &&
            !allowEmptySearch && !url.searchParams.getAll('q').some(q => q.trim())) return null;
        return url;
    }

    function destination(url) {
        const target = new URL(url.href);
        target.protocol = 'https:';
        target.hostname = TARGET;
        const homepage = ['/', '/webhp', '/webhp/'].includes(target.pathname) &&
            !target.searchParams.getAll('q').some(q => q.trim());
        if (homepage) {
            // A plain homepage needs no account, locale, tracking or fragment state.
            // Keep root/webhp query searches on the normal lossless search path.
            target.pathname = '/';
            target.search = '';
            target.hash = '';
        } else {
            target.search = filteredSearch(target.search, removeKey);
        }
        return target;
    }

    function unwrapResult(input, base) {
        if (!SETTINGS.directResultLinks) return null;
        let url;
        try { url = new URL(input, base); } catch { return null; }
        const seen = new Set();
        let changed = false;
        for (let depth = 0; depth < 3; depth++) {
            if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.port) return null;
            if (!googleHost(url.hostname) || url.pathname !== '/url') return changed ? url : null;
            if (seen.has(url.href)) return null;
            seen.add(url.href);
            // URLSearchParams decodes exactly once. Never decode the whole target
            // again, guess DOM buttons, or interpret url/q fields on an external site.
            const candidates = new Set([...url.searchParams.getAll('url'), ...url.searchParams.getAll('q')].filter(Boolean));
            if (candidates.size !== 1) return null;
            try { url = new URL([...candidates][0]); } catch { return null; }
            changed = true;
        }
        if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.port ||
            (googleHost(url.hostname) && url.pathname === '/url')) return null;
        return changed ? url : null;
    }

    const current = eligible(window.location.href);
    if (!current) return;
    Object.defineProperty(window, MARKER, { value: true });

    // Install once even when automatic navigation is skipped (history/storage).
    const pendingForms = new WeakMap();
    function onLink(event, fromContextMenu = false) {
        if (event.defaultPrevented || (event.button !== undefined &&
            event.button !== 0 && event.button !== 1 && !(fromContextMenu && event.button === 2))) return;
        const path = typeof event.composedPath === 'function' ? event.composedPath() : [];
        let link = path.find(node => node && node.tagName === 'A');
        if (!link && event.target && typeof event.target.closest === 'function') {
            link = event.target.closest('a[href]');
        }
        if (!link || link.hasAttribute('download')) return;
        const raw = link.getAttribute('href');
        if (!raw) return;
        const unwrapped = unwrapResult(raw, document.baseURI);
        const url = eligible(unwrapped ? unwrapped.href : raw, document.baseURI, true);
        if (!url && !unwrapped) return;
        const target = url ? destination(url) : unwrapped;
        if (unwrapped || target.href !== url.href) link.setAttribute('href', target.href);
        // Do not preventDefault or navigate: preserve native history/new-tab behavior.
    }
    function attr(element, name) {
        return element.getAttribute(name) || '';
    }
    function isGetSelf(form) {
        const method = attr(form, 'method').toLowerCase();
        const base = document.querySelector('base[target]');
        const target = (attr(form, 'target') || (base && attr(base, 'target')) || '').toLowerCase();
        return (!method || method === 'get') && (!target || target === '_self');
    }
    function hasQuery(form) {
        return Array.from(form.elements).some(control => {
            if (control.name !== 'q' || control.disabled ||
                (typeof control.matches === 'function' && control.matches(':disabled'))) return false;
            const type = (control.type || '').toLowerCase();
            if (['submit', 'button', 'reset', 'image', 'file'].includes(type)) return false;
            if ((type === 'checkbox' || type === 'radio') && !control.checked) return false;
            return typeof control.value === 'string' && !!control.value.trim();
        });
    }
    function onSubmit(event) {
        const form = event.target;
        if (!form || form.tagName !== 'FORM') return;
        pendingForms.delete(form);
        if (event.defaultPrevented || !isGetSelf(form) || !hasQuery(form)) return;
        const button = event.submitter;
        if (button && ['formaction', 'formmethod', 'formtarget'].some(key => button.hasAttribute(key))) return;
        // Capture intent only. Later page handlers may cancel or change method,
        // target or submitter; do not permanently mutate action during dispatch.
        const url = eligible(attr(form, 'action') || window.location.href, document.baseURI, true, true);
        if (url) pendingForms.set(form, { event, button });
    }
    function onFormData(event) {
        const form = event.target;
        const pending = pendingForms.get(form);
        if (!pending) return;
        // new FormData(form) inside a submit handler is only an inspection, not
        // proof of final native submission. Preserve pending intent until dispatch ends.
        if (pending.event.eventPhase !== 0) return;
        pendingForms.delete(form);
        if (pending.event.defaultPrevented || !isGetSelf(form)) return;
        const button = pending.button;
        if (button && ['formaction', 'formmethod', 'formtarget'].some(key => button.hasAttribute(key))) return;
        const url = eligible(attr(form, 'action') || window.location.href, document.baseURI, true, true);
        if (!url) return;
        const data = event.formData;
        if (!data || !data.getAll('q').some(q => typeof q === 'string' && q.trim())) return;
        // Do not rewrite form action here: WebKit may already have captured it.
        // Rewriting earlier can affect a later POST/cancelled submission. Request-
        // layer rules, not a userscript resubmission, handle pre-request form routing.
        for (const key of new Set(data.keys())) if (removeKey(key)) data.delete(key);
        // Clean the serialized payload, never disable/remove hidden controls.
    }
    document.addEventListener('click', onLink, true);
    document.addEventListener('auxclick', onLink, true);
    document.addEventListener('contextmenu', event => onLink(event, true), true);
    document.addEventListener('submit', onSubmit, true);
    document.addEventListener('formdata', onFormData, true);

    function fingerprint(value) {
        let hash = 2166136261;
        for (let i = 0; i < value.length; i++) hash = Math.imul(hash ^ value.charCodeAt(i), 16777619);
        return (hash >>> 0).toString(16);
    }
    function mayRedirect(target) {
        try {
            const now = Date.now();
            // Identity only: normalize encoding/key order, preserving duplicate-key
            // order and functional filters. Actual outgoing query/fragment stays raw.
            const pairs = Array.from(target.searchParams).filter(([key]) =>
                !/^utm_/i.test(key) && !BOUNCE_KEYS.has(key));
            pairs.sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0);
            const identity = new URLSearchParams(pairs).toString();
            const id = fingerprint(target.origin + target.pathname + '?' + identity);
            const store = window.sessionStorage;
            const raw = store.getItem(KEY);
            let records = [];
            if (raw && raw.length <= 8192) {
                try {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed)) records = parsed.filter(entry =>
                        Array.isArray(entry) && /^[0-9a-f]{1,8}$/.test(entry[0]) &&
                        Number.isFinite(entry[1]) && entry[1] <= now && now - entry[1] < COOLDOWN_MS
                    ).slice(-MAX_RECORDS);
                } catch { /* Discard corrupt local state. */ }
            }
            if (records.some(entry => entry[0] === id)) return false;
            records.push([id, now]);
            store.setItem(KEY, JSON.stringify(records.slice(-MAX_RECORDS)));
            return true;
        } catch {
            return false; // No reliable guard: leave the current page usable.
        }
    }

    let activated = false;
    function activate() {
        if (activated || document.prerendering) return;
        activated = true;
        try {
            const nav = performance.getEntriesByType('navigation')[0];
            if (nav && nav.type === 'back_forward') return;
        } catch { /* Navigation Timing is optional. */ }
        const source = eligible(window.location.href);
        if (!source) return;
        const target = destination(source);
        if (target.href === source.href) return;
        if (source.protocol === 'https:' && source.hostname === TARGET) {
            if (SETTINGS.cleanAddressBar) {
                try { window.history.replaceState(window.history.state, '', target.href); }
                catch { /* Address cleanup must never trigger a fallback reload. */ }
            }
            return;
        }
        if (!mayRedirect(target)) return;
        try { window.location.replace(target.href); }
        catch { /* Navigation restrictions must not break normal use. */ }
    }
    if (document.prerendering) document.addEventListener('prerenderingchange', activate, { once: true });
    else activate();
})();
