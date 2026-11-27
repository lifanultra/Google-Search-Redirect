// ==UserScript==
// @name         Google Search Redirect
// @name:zh-CN   Google 搜索域名重定向
// @namespace    https://github.com/lifanultra
// @version      2026.11.27.1241
// @description  Direct Google search navigation with safe optional parameter cleanup and no cleanup reloads.
// @description:zh-CN Google 搜索域名直达、可选参数清理；清理地址不刷新，保留搜索功能。
// @author       LIFANULTRA
// @run-at       document-start
// @grant        none
// @noframes
// @homepageURL  https://github.com/lifanultra/Google-Search-Redirect
// @downloadURL  https://raw.githubusercontent.com/lifanultra/Google-Search-Redirect/refs/heads/main/Google-Search-Redirect.js
// @updateURL    https://raw.githubusercontent.com/lifanultra/Google-Search-Redirect/refs/heads/main/Google-Search-Redirect.js
// Domain inventory: https://www.google.com/supported_domains (2026-11-26 snapshot)
// @match        *://google.ad/*
// @match        *://www.google.ad/*
// @match        *://google.ae/*
// @match        *://www.google.ae/*
// @match        *://google.al/*
// @match        *://www.google.al/*
// @match        *://google.am/*
// @match        *://www.google.am/*
// @match        *://google.as/*
// @match        *://www.google.as/*
// @match        *://google.at/*
// @match        *://www.google.at/*
// @match        *://google.az/*
// @match        *://www.google.az/*
// @match        *://google.ba/*
// @match        *://www.google.ba/*
// @match        *://google.be/*
// @match        *://www.google.be/*
// @match        *://google.bf/*
// @match        *://www.google.bf/*
// @match        *://google.bg/*
// @match        *://www.google.bg/*
// @match        *://google.bi/*
// @match        *://www.google.bi/*
// @match        *://google.bj/*
// @match        *://www.google.bj/*
// @match        *://google.bs/*
// @match        *://www.google.bs/*
// @match        *://google.bt/*
// @match        *://www.google.bt/*
// @match        *://google.by/*
// @match        *://www.google.by/*
// @match        *://google.ca/*
// @match        *://www.google.ca/*
// @match        *://google.cat/*
// @match        *://www.google.cat/*
// @match        *://google.cd/*
// @match        *://www.google.cd/*
// @match        *://google.cf/*
// @match        *://www.google.cf/*
// @match        *://google.cg/*
// @match        *://www.google.cg/*
// @match        *://google.ch/*
// @match        *://www.google.ch/*
// @match        *://google.ci/*
// @match        *://www.google.ci/*
// @match        *://google.cl/*
// @match        *://www.google.cl/*
// @match        *://google.cm/*
// @match        *://www.google.cm/*
// @match        *://google.cn/*
// @match        *://www.google.cn/*
// @match        *://google.co.ao/*
// @match        *://www.google.co.ao/*
// @match        *://google.co.bw/*
// @match        *://www.google.co.bw/*
// @match        *://google.co.ck/*
// @match        *://www.google.co.ck/*
// @match        *://google.co.cr/*
// @match        *://www.google.co.cr/*
// @match        *://google.co.id/*
// @match        *://www.google.co.id/*
// @match        *://google.co.il/*
// @match        *://www.google.co.il/*
// @match        *://google.co.in/*
// @match        *://www.google.co.in/*
// @match        *://google.co.jp/*
// @match        *://www.google.co.jp/*
// @match        *://google.co.ke/*
// @match        *://www.google.co.ke/*
// @match        *://google.co.kr/*
// @match        *://www.google.co.kr/*
// @match        *://google.co.ls/*
// @match        *://www.google.co.ls/*
// @match        *://google.co.ma/*
// @match        *://www.google.co.ma/*
// @match        *://google.co.mz/*
// @match        *://www.google.co.mz/*
// @match        *://google.co.nz/*
// @match        *://www.google.co.nz/*
// @match        *://google.co.th/*
// @match        *://www.google.co.th/*
// @match        *://google.co.tz/*
// @match        *://www.google.co.tz/*
// @match        *://google.co.ug/*
// @match        *://www.google.co.ug/*
// @match        *://google.co.uk/*
// @match        *://www.google.co.uk/*
// @match        *://google.co.uz/*
// @match        *://www.google.co.uz/*
// @match        *://google.co.ve/*
// @match        *://www.google.co.ve/*
// @match        *://google.co.vi/*
// @match        *://www.google.co.vi/*
// @match        *://google.co.za/*
// @match        *://www.google.co.za/*
// @match        *://google.co.zm/*
// @match        *://www.google.co.zm/*
// @match        *://google.co.zw/*
// @match        *://www.google.co.zw/*
// @match        *://google.com/*
// @match        http://www.google.com/*
// @match        https://www.google.com/*
// @match        *://google.com.af/*
// @match        *://www.google.com.af/*
// @match        *://google.com.ag/*
// @match        *://www.google.com.ag/*
// @match        *://google.com.ar/*
// @match        *://www.google.com.ar/*
// @match        *://google.com.au/*
// @match        *://www.google.com.au/*
// @match        *://google.com.bd/*
// @match        *://www.google.com.bd/*
// @match        *://google.com.bh/*
// @match        *://www.google.com.bh/*
// @match        *://google.com.bn/*
// @match        *://www.google.com.bn/*
// @match        *://google.com.bo/*
// @match        *://www.google.com.bo/*
// @match        *://google.com.br/*
// @match        *://www.google.com.br/*
// @match        *://google.com.bz/*
// @match        *://www.google.com.bz/*
// @match        *://google.com.co/*
// @match        *://www.google.com.co/*
// @match        *://google.com.cu/*
// @match        *://www.google.com.cu/*
// @match        *://google.com.cy/*
// @match        *://www.google.com.cy/*
// @match        *://google.com.do/*
// @match        *://www.google.com.do/*
// @match        *://google.com.ec/*
// @match        *://www.google.com.ec/*
// @match        *://google.com.eg/*
// @match        *://www.google.com.eg/*
// @match        *://google.com.et/*
// @match        *://www.google.com.et/*
// @match        *://google.com.fj/*
// @match        *://www.google.com.fj/*
// @match        *://google.com.gh/*
// @match        *://www.google.com.gh/*
// @match        *://google.com.gi/*
// @match        *://www.google.com.gi/*
// @match        *://google.com.gt/*
// @match        *://www.google.com.gt/*
// @match        *://google.com.hk/*
// @match        *://www.google.com.hk/*
// @match        *://google.com.jm/*
// @match        *://www.google.com.jm/*
// @match        *://google.com.kh/*
// @match        *://www.google.com.kh/*
// @match        *://google.com.kw/*
// @match        *://www.google.com.kw/*
// @match        *://google.com.lb/*
// @match        *://www.google.com.lb/*
// @match        *://google.com.ly/*
// @match        *://www.google.com.ly/*
// @match        *://google.com.mm/*
// @match        *://www.google.com.mm/*
// @match        *://google.com.mt/*
// @match        *://www.google.com.mt/*
// @match        *://google.com.mx/*
// @match        *://www.google.com.mx/*
// @match        *://google.com.my/*
// @match        *://www.google.com.my/*
// @match        *://google.com.na/*
// @match        *://www.google.com.na/*
// @match        *://google.com.ng/*
// @match        *://www.google.com.ng/*
// @match        *://google.com.ni/*
// @match        *://www.google.com.ni/*
// @match        *://google.com.np/*
// @match        *://www.google.com.np/*
// @match        *://google.com.om/*
// @match        *://www.google.com.om/*
// @match        *://google.com.pa/*
// @match        *://www.google.com.pa/*
// @match        *://google.com.pe/*
// @match        *://www.google.com.pe/*
// @match        *://google.com.pg/*
// @match        *://www.google.com.pg/*
// @match        *://google.com.ph/*
// @match        *://www.google.com.ph/*
// @match        *://google.com.pk/*
// @match        *://www.google.com.pk/*
// @match        *://google.com.pr/*
// @match        *://www.google.com.pr/*
// @match        *://google.com.py/*
// @match        *://www.google.com.py/*
// @match        *://google.com.qa/*
// @match        *://www.google.com.qa/*
// @match        *://google.com.sa/*
// @match        *://www.google.com.sa/*
// @match        *://google.com.sb/*
// @match        *://www.google.com.sb/*
// @match        *://google.com.sg/*
// @match        *://www.google.com.sg/*
// @match        *://google.com.sl/*
// @match        *://www.google.com.sl/*
// @match        *://google.com.sv/*
// @match        *://www.google.com.sv/*
// @match        *://google.com.tj/*
// @match        *://www.google.com.tj/*
// @match        *://google.com.tr/*
// @match        *://www.google.com.tr/*
// @match        *://google.com.tw/*
// @match        *://www.google.com.tw/*
// @match        *://google.com.ua/*
// @match        *://www.google.com.ua/*
// @match        *://google.com.uy/*
// @match        *://www.google.com.uy/*
// @match        *://google.com.vc/*
// @match        *://www.google.com.vc/*
// @match        *://google.com.vn/*
// @match        *://www.google.com.vn/*
// @match        *://google.cv/*
// @match        *://www.google.cv/*
// @match        *://google.cz/*
// @match        *://www.google.cz/*
// @match        *://google.de/*
// @match        *://www.google.de/*
// @match        *://google.dj/*
// @match        *://www.google.dj/*
// @match        *://google.dk/*
// @match        *://www.google.dk/*
// @match        *://google.dm/*
// @match        *://www.google.dm/*
// @match        *://google.dz/*
// @match        *://www.google.dz/*
// @match        *://google.ee/*
// @match        *://www.google.ee/*
// @match        *://google.es/*
// @match        *://www.google.es/*
// @match        *://google.fi/*
// @match        *://www.google.fi/*
// @match        *://google.fm/*
// @match        *://www.google.fm/*
// @match        *://google.fr/*
// @match        *://www.google.fr/*
// @match        *://google.ga/*
// @match        *://www.google.ga/*
// @match        *://google.ge/*
// @match        *://www.google.ge/*
// @match        *://google.gg/*
// @match        *://www.google.gg/*
// @match        *://google.gl/*
// @match        *://www.google.gl/*
// @match        *://google.gm/*
// @match        *://www.google.gm/*
// @match        *://google.gr/*
// @match        *://www.google.gr/*
// @match        *://google.gy/*
// @match        *://www.google.gy/*
// @match        *://google.hn/*
// @match        *://www.google.hn/*
// @match        *://google.hr/*
// @match        *://www.google.hr/*
// @match        *://google.ht/*
// @match        *://www.google.ht/*
// @match        *://google.hu/*
// @match        *://www.google.hu/*
// @match        *://google.ie/*
// @match        *://www.google.ie/*
// @match        *://google.im/*
// @match        *://www.google.im/*
// @match        *://google.iq/*
// @match        *://www.google.iq/*
// @match        *://google.is/*
// @match        *://www.google.is/*
// @match        *://google.it/*
// @match        *://www.google.it/*
// @match        *://google.je/*
// @match        *://www.google.je/*
// @match        *://google.jo/*
// @match        *://www.google.jo/*
// @match        *://google.kg/*
// @match        *://www.google.kg/*
// @match        *://google.ki/*
// @match        *://www.google.ki/*
// @match        *://google.kz/*
// @match        *://www.google.kz/*
// @match        *://google.la/*
// @match        *://www.google.la/*
// @match        *://google.li/*
// @match        *://www.google.li/*
// @match        *://google.lk/*
// @match        *://www.google.lk/*
// @match        *://google.lt/*
// @match        *://www.google.lt/*
// @match        *://google.lu/*
// @match        *://www.google.lu/*
// @match        *://google.lv/*
// @match        *://www.google.lv/*
// @match        *://google.md/*
// @match        *://www.google.md/*
// @match        *://google.me/*
// @match        *://www.google.me/*
// @match        *://google.mg/*
// @match        *://www.google.mg/*
// @match        *://google.mk/*
// @match        *://www.google.mk/*
// @match        *://google.ml/*
// @match        *://www.google.ml/*
// @match        *://google.mn/*
// @match        *://www.google.mn/*
// @match        *://google.ms/*
// @match        *://www.google.ms/*
// @match        *://google.mu/*
// @match        *://www.google.mu/*
// @match        *://google.mv/*
// @match        *://www.google.mv/*
// @match        *://google.mw/*
// @match        *://www.google.mw/*
// @match        *://google.ne/*
// @match        *://www.google.ne/*
// @match        *://google.nl/*
// @match        *://www.google.nl/*
// @match        *://google.no/*
// @match        *://www.google.no/*
// @match        *://google.nr/*
// @match        *://www.google.nr/*
// @match        *://google.nu/*
// @match        *://www.google.nu/*
// @match        *://google.pl/*
// @match        *://www.google.pl/*
// @match        *://google.pn/*
// @match        *://www.google.pn/*
// @match        *://google.ps/*
// @match        *://www.google.ps/*
// @match        *://google.pt/*
// @match        *://www.google.pt/*
// @match        *://google.ro/*
// @match        *://www.google.ro/*
// @match        *://google.rs/*
// @match        *://www.google.rs/*
// @match        *://google.ru/*
// @match        *://www.google.ru/*
// @match        *://google.rw/*
// @match        *://www.google.rw/*
// @match        *://google.sc/*
// @match        *://www.google.sc/*
// @match        *://google.se/*
// @match        *://www.google.se/*
// @match        *://google.sh/*
// @match        *://www.google.sh/*
// @match        *://google.si/*
// @match        *://www.google.si/*
// @match        *://google.sk/*
// @match        *://www.google.sk/*
// @match        *://google.sm/*
// @match        *://www.google.sm/*
// @match        *://google.sn/*
// @match        *://www.google.sn/*
// @match        *://google.so/*
// @match        *://www.google.so/*
// @match        *://google.sr/*
// @match        *://www.google.sr/*
// @match        *://google.st/*
// @match        *://www.google.st/*
// @match        *://google.td/*
// @match        *://www.google.td/*
// @match        *://google.tg/*
// @match        *://www.google.tg/*
// @match        *://google.tl/*
// @match        *://www.google.tl/*
// @match        *://google.tm/*
// @match        *://www.google.tm/*
// @match        *://google.tn/*
// @match        *://www.google.tn/*
// @match        *://google.to/*
// @match        *://www.google.to/*
// @match        *://google.tt/*
// @match        *://www.google.tt/*
// @match        *://google.vu/*
// @match        *://www.google.vu/*
// @match        *://google.ws/*
// @match        *://www.google.ws/*
// ==/UserScript==

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
    const SUFFIXES = new Set(["ad","ae","al","am","as","at","az","ba","be","bf","bg","bi","bj","bs","bt","by","ca","cat","cd","cf","cg","ch","ci","cl","cm","cn","co.ao","co.bw","co.ck","co.cr","co.id","co.il","co.in","co.jp","co.ke","co.kr","co.ls","co.ma","co.mz","co.nz","co.th","co.tz","co.ug","co.uk","co.uz","co.ve","co.vi","co.za","co.zm","co.zw","com","com.af","com.ag","com.ar","com.au","com.bd","com.bh","com.bn","com.bo","com.br","com.bz","com.co","com.cu","com.cy","com.do","com.ec","com.eg","com.et","com.fj","com.gh","com.gi","com.gt","com.hk","com.jm","com.kh","com.kw","com.lb","com.ly","com.mm","com.mt","com.mx","com.my","com.na","com.ng","com.ni","com.np","com.om","com.pa","com.pe","com.pg","com.ph","com.pk","com.pr","com.py","com.qa","com.sa","com.sb","com.sg","com.sl","com.sv","com.tj","com.tr","com.tw","com.ua","com.uy","com.vc","com.vn","cv","cz","de","dj","dk","dm","dz","ee","es","fi","fm","fr","ga","ge","gg","gl","gm","gr","gy","hn","hr","ht","hu","ie","im","iq","is","it","je","jo","kg","ki","kz","la","li","lk","lt","lu","lv","md","me","mg","mk","ml","mn","ms","mu","mv","mw","ne","nl","no","nr","nu","pl","pn","ps","pt","ro","rs","ru","rw","sc","se","sh","si","sk","sm","sn","so","sr","st","td","tg","tl","tm","tn","to","tt","vu","ws"]);
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

/*
 * 参考文献 / References — researched 2026-11-27.
 * Strategy research and counterexamples only; independently implemented.
 * No upstream implementation copied; no runtime dependencies or remote fetching.
 * 学习不等于整套合并；限定 Google 搜索，不改账号/邮箱/地图的服务主机。
 * ScriptCat 1706 / 重定向链接 v0.1 / SHA256 1370614193dcb2f7898bff36b2d602c6d4a9ae6656289627e08ac675e2e0468d
 * https://scriptcat.org/scripts/code/1706/%E9%87%8D%E5%AE%9A%E5%90%91%E9%93%BE%E6%8E%A5.user.js
 * 精确已知入口；不照搬重复解码或缺少协议校验。
 * ScriptCat 5392 / 网页重定向 v2.6.2 / SHA256 84b7b0f5bea62bf055725cc02a83968c7edcc326747051bc2c35eb64c06599e9
 * https://scriptcat.org/scripts/code/5392/%E7%BD%91%E9%A1%B5%E9%87%8D%E5%AE%9A%E5%90%91.user.js
 * 开关与幂等；不采用全局导航/表单/原型劫持。
 * ScriptCat 8937 / Auto Redirect Purifier (自动重定向净化) v3.4 / SHA256 c9f36ba76f71434ace187a5f92cfa7f9a5be063b2a6862f831202dbf0631827e
 * https://scriptcat.org/scripts/code/8937/Auto%20Redirect%20Purifier%20(%E8%87%AA%E5%8A%A8%E9%87%8D%E5%AE%9A%E5%90%91%E5%87%80%E5%8C%96).user.js
 * 本地有界解包；不猜 DOM 目标、不全站递归解包。
 * ScriptCat 5462 / 移动端去除链接重定向 v1.5 / SHA256 21aa622dda21eec32503918f4aa45b6f3ef61728cc4ce9504013cbc8fe9ed346
 * https://scriptcat.org/scripts/code/5462/%E7%A7%BB%E5%8A%A8%E7%AB%AF%E5%8E%BB%E9%99%A4%E9%93%BE%E6%8E%A5%E9%87%8D%E5%AE%9A%E5%90%91.user.js
 * 有界状态思想；不引入联网兜底、全页扫描或点击接管。
 * ScriptCat 3053 / 兔小巢首页阻止重定向 v2025-03-30 / SHA256 d6a74b977f7349b7889cfc930c3954141ef5045fab493701f805e988038f0534
 * https://scriptcat.org/scripts/code/3053/%E5%85%94%E5%B0%8F%E5%B7%A2%E9%A6%96%E9%A1%B5%E9%98%BB%E6%AD%A2%E9%87%8D%E5%AE%9A%E5%90%91.user.js
 * 按站点范围处理；不采用设备特征或字符串原型伪装。
 * ScriptCat 3211 / 跳转链接修复（移除重定向外链直达） v2.27.0 / SHA256 8480c34c3723f6964b688b4cff9bd2e6cccb06d5943d31f2cb0c07af26e90566
 * https://scriptcat.org/scripts/code/3211/%E8%B7%B3%E8%BD%AC%E9%93%BE%E6%8E%A5%E4%BF%AE%E5%A4%8D%EF%BC%88%E7%A7%BB%E9%99%A4%E9%87%8D%E5%AE%9A%E5%90%91%E5%A4%96%E9%93%BE%E7%9B%B4%E8%BE%BE%EF%BC%89.user.js
 * 区分页面导航与外链处理；保留原生点击，独立实现协议/域名校验。
 * ScriptCat 2567 / No Google vignette v0.1.0 / SHA256 f171056d57be9d1b76c20bda1f62160d84ba249e00a88da3ae939e08a343a514
 * https://scriptcat.org/scripts/code/2567/No%20Google%20vignette.user.js
 * 明确触发标记；不通过重载/路径截断或盲删节点清理地址。
 * tunggian/google-search-ncr — Validate scope; avoid an extra NCR bootstrap hop.
 * https://raw.githubusercontent.com/tunggian/google-search-ncr/218b2742163248e928033ee3e4250ab68aa13586/google-search-ncr.user.js
 * ClearURLs/Rules — Separate exceptions, cleanup and redirect extraction.
 * https://raw.githubusercontent.com/ClearURLs/Rules/7c30a16c37c13526bd43eead3135459e79975585/data.min.json
 * Smile4ever/Neat-URL — Preserve raw query bytes and duplicate fields.
 * https://raw.githubusercontent.com/Smile4ever/Neat-URL/630181f17fb48b484d83b450dcd256577baaeb9d/src/core/clean.js
 * AdguardTeam/AdguardFilters — Path-scoped cleanup; preserve encoding and compatibility parameters.
 * https://raw.githubusercontent.com/AdguardTeam/AdguardFilters/2fdc51144fd57bf6c8815a2de98032c84a71ff80/TrackParamFilter/sections/specific.txt
 * blackmatrix7 SafeRedirect — Google entry-point rewrite; request-layer scope differs.
 * https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/0b6897dc17e0c513d25449c935a9694818e32f0c/rewrite/Loon/SafeRedirect/SafeRedirect.plugin
 */
