// ==UserScript==
// @name         Google Search Redirect
// @name:zh-CN   Google 搜索域名重定向
// @namespace    https://github.com/lifanultra
// @version      3.0.0
// @description  Normalize regional Google Search URLs to www.google.com without changing search parameters.
// @description:zh-CN 将 Google 地区搜索域名规范化为 www.google.com，保留原始搜索参数。
// @author       lifanultra
// @run-at       document-start
// @grant        none
// @noframes
//
// Explicit host patterns for portability across userscript managers.
// The canonical HTTPS host is deliberately not matched.
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

// Inspired by https://github.com/tunggian/google-search-ncr
// Direct navigation only; no /ncr bootstrap, cookie changes or DOM hooks.
// Domain inventory: https://www.google.com/supported_domains
// Snapshot: 2026-11-26. No remote dependency or runtime list refresh.

(() => {
    'use strict';

    const TARGET = 'www.google.com';
    const KEY = 'lifanultra.google-search-redirect.v3';
    const WINDOW_MS = 10000;
    const MAX_ATTEMPTS = 4;

    // Never interfere with embedded pages or speculative prerendering.
    if (window.top !== window.self || document.prerendering) return;

    const source = new URL(window.location.href);

    if (source.protocol !== 'https:' && source.protocol !== 'http:') return;
    if (source.protocol === 'https:' && source.hostname === TARGET) return;
    if (source.username || source.password || source.port) return;

    // Exact paths only; do not touch Maps, Accounts, consent, /url, /ncr,
    // search suggestions, APIs, or other Google services.
    const path = source.pathname;

    if (path !== '/' && path !== '/webhp' && path !== '/webhp/' &&
        path !== '/search' && path !== '/search/') return;

    // Queryless /search may represent a non-URL search submission.
    // A userscript cannot reliably recover a POST body: leave it alone.
    if ((path === '/search' || path === '/search/') && !source.search) return;

    const suffix = /^(?:www\.)?google\.([a-z.]+)$/.exec(source.hostname);

    if (!suffix) return;

    const supported = new Set(`
        ad ae al am as at az ba be bf bg bi bj bs bt by ca cat cd cf cg ch ci cl cm cn co.ao co.bw
        co.ck co.cr co.id co.il co.in co.jp co.ke co.kr co.ls co.ma co.mz co.nz co.th co.tz co.ug
        co.uk co.uz co.ve co.vi co.za co.zm co.zw com com.af com.ag com.ar com.au com.bd com.bh com.bn
        com.bo com.br com.bz com.co com.cu com.cy com.do com.ec com.eg com.et com.fj com.gh com.gi
        com.gt com.hk com.jm com.kh com.kw com.lb com.ly com.mm com.mt com.mx com.my com.na com.ng
        com.ni com.np com.om com.pa com.pe com.pg com.ph com.pk com.pr com.py com.qa com.sa com.sb
        com.sg com.sl com.sv com.tj com.tr com.tw com.ua com.uy com.vc com.vn cv cz de dj dk dm dz ee
        es fi fm fr ga ge gg gl gm gr gy hn hr ht hu ie im iq is it je jo kg ki kz la li lk lt lu lv
        md me mg mk ml mn ms mu mv mw ne nl no nr nu pl pn ps pt ro rs ru rw sc se sh si sk sm sn so
        sr st td tg tl tm tn to tt vu ws
    `.trim().split(/\s+/));

    if (!supported.has(suffix[1])) return;

    // Do not override an explicit browser history traversal.
    try {
        const nav = performance.getEntriesByType('navigation')[0];

        if (nav && nav.type === 'back_forward') return;
    } catch {
        // Navigation Timing is optional; loop protection remains active.
    }

    // Change only scheme and host. Do not reserialize URLSearchParams,
    // add tracking or locale parameters, or remove existing fragments.
    const target = new URL(source.href);

    target.protocol = 'https:';
    target.hostname = TARGET;

    if (target.href === source.href) return;

    // Per-tab, per-origin guard. A short fingerprint distinguishes fast
    // consecutive searches without saving their raw URLs or search terms.
    // This is a non-cryptographic local identifier, not anonymization.
    function fingerprint(value) {
        let hash = 2166136261;

        for (let i = 0; i < value.length; i++) {
            hash = Math.imul(hash ^ value.charCodeAt(i), 16777619);
        }

        return (hash >>> 0).toString(16);
    }

    try {
        const now = Date.now();
        const id = fingerprint(target.href);
        const store = window.sessionStorage;
        const raw = store.getItem(KEY);

        let records = [];

        if (raw && raw.length <= 2048) {
            try {
                const parsed = JSON.parse(raw);

                if (Array.isArray(parsed)) {
                    records = parsed.filter(entry => Array.isArray(entry) &&
                        typeof entry[0] === 'string' &&
                        /^[0-9a-f]{1,8}$/.test(entry[0]) &&
                        Number.isFinite(entry[1]) &&
                        entry[1] <= now &&
                        now - entry[1] < WINDOW_MS
                    ).slice(-MAX_ATTEMPTS);
                }
            } catch {
                // Ignore corrupt or incompatible state.
            }
        }

        // Stop an identical bounce, and cap rapid bounces even if Google
        // adds or changes query parameters on each round trip.
        if (records.some(entry => entry[0] === id) ||
            records.length >= MAX_ATTEMPTS) return;

        records.push([id, now]);

        store.setItem(KEY, JSON.stringify(records));

    } catch {
        // Fail open: if reliable loop protection is unavailable, leave the
        // current page alone and let Google handle normal navigation.
        return;
    }

    // No timer, network fetch, alert, overlay, or extra history entry.
    try {
        window.location.replace(target.href);
    } catch {
        // Restricted navigation contexts must not break the current page.
    }
})();
