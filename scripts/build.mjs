import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const suffixes = JSON.parse(readFileSync(resolve(root, 'config/google-domains.json'), 'utf8'));
const { version } = JSON.parse(readFileSync(resolve(root, 'config/version.json'), 'utf8'));
// Four numeric components preserve date/time ordering in userscript managers.
// Keep zero padding for display; consumers should compare each component numerically.
const parts = typeof version === 'string' && /^(\d{4})\.(\d{2})\.(\d{2})\.(\d{2})(\d{2})$/.exec(version);
if (!parts) throw Error('Invalid version: expected YYYY.MM.DD.HHmm');
const [, y, m, d, h, min] = parts.map(Number);
const day = new Date(Date.UTC(y, m - 1, d));
if (y < 1000 || day.getUTCFullYear() !== y || day.getUTCMonth() !== m - 1 || day.getUTCDate() !== d || h > 23 || min > 59) {
    throw Error('Invalid calendar date or time in version');
}
if (new Set(suffixes).size !== suffixes.length || suffixes.some(s => !/^[a-z]+(?:\.[a-z]+)*$/.test(s))) {
    throw Error('Invalid or duplicate Google domain suffix');
}
const matches = suffixes.flatMap(s => [
    `// @match        *://google.${s}/*`,
    s === 'com' ? '// @match        http://www.google.com/*\n// @match        https://www.google.com/*' : `// @match        *://www.google.${s}/*`,
]).join('\n');
const metadata = `// ==UserScript==
// @name         Google Search Redirect
// @name:zh-CN   Google 搜索域名重定向
// @namespace    https://github.com/lifanultra
// @version      ${version}
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
${matches}
// ==/UserScript==

`;
const template = readFileSync(resolve(root, 'src/redirect.js'), 'utf8');
if ((template.match(/\/\* GOOGLE_SUFFIXES \*\//g) || []).length !== 1) throw Error('Missing/duplicate domain marker');
const references = readFileSync(resolve(root, 'src/references.txt'), 'utf8');
if (!references.startsWith('/*') || !references.trimEnd().endsWith('*/') || references.includes('@require')) {
    throw Error('References must be a comment-only footer, not a runtime dependency');
}
const output = metadata + template.replace('/* GOOGLE_SUFFIXES */', JSON.stringify(suffixes)) + '\n' + references;
for (const name of ['Google-Search-Redirect.js']) {
    const path = resolve(root, name);
    if (process.argv.includes('--check')) {
        if (readFileSync(path, 'utf8') !== output) throw Error(`Stale generated file: ${name}`);
    } else writeFileSync(path, output);
}
console.log(`Userscript ${version}: ${suffixes.length} suffixes; deterministic artifacts ${process.argv.includes('--check') ? 'verified' : 'built'}.`);
