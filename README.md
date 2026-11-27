# Google Search Redirect

[English](README.md) | [简体中文](README.zh-CN.md)

A lightweight userscript for streamlined Google search navigation.

## Features

- Normalizes eligible Google search pages and cleans selected query parameters without reloading results solely for cleanup.
- Updates search links on demand and locally unwraps known Google result redirects, up to three layers.
- Preserves search settings, remaining query encoding, duplicate parameters, and fragments. Eligible GET forms are cleaned through native `formdata`.
- Provides per-tab, per-origin loop protection; does not download domain lists or upload search terms.

## Installation

Install or update using the same URL in a userscript manager that supports `document-start`:

[Install / update Google Search Redirect](https://raw.githubusercontent.com/lifanultra/Google-Search-Redirect/refs/heads/main/Google-Search-Redirect.js)

On iPhone Safari, grant the manager access to the relevant Google domains in extension settings. For wBlock, see the [setup guide](docs/wblock.md). Update the existing installation rather than enabling multiple copies.

## Settings

Edit `SETTINGS` near the top of the installed script:

| Setting | Default | Description |
|---|---|---|
| `cleanTracking` | `true` | Remove `utm_*` parameters |
| `cleanClient` | `true` | Remove `client`, `sourceid`, and `rls` |
| `cleanAddressBar` | `true` | Clean same-origin addresses without reloading, preserving history state |
| `fixLinkTypos` | `true` | Correct exact `google.con` and `www.google.con` hosts in observed search links |
| `directResultLinks` | `true` | Locally unwrap known Google result links |

Updates may overwrite local settings. Parameter cleanup does not guarantee faster searches.

## Releases

Releases use the `YYYY.MM.DD.HHmm` format (China Standard Time). The release workflow checks the generated script and tests, then publishes the script as a GitHub Release asset. Update `config/version.json` and regenerate the script for each code release. The installation URL follows `main` immediately, independently of Release workflow status.

## Compatibility and limitations

The script handles supported Google search hosts and paths. It does not modify other Google service hosts. Browser navigation, direct form submission, some AJAX searches, and long-press previews may bypass its listeners; POST forms and forms with target or submit-button overrides are conservatively skipped. WebKit may select a form request destination before `formdata` runs.

Userscripts cannot correct a hostname before Safari's first request or run on DNS and certificate error pages. For request-layer rules and Safari setup, see the [optional WebExtension documentation](extensions/safari/README.md). Implementation details and sources are available in the [research notes](docs/research.md) and [source list](docs/research-sources.json).

## Development and tests

Node.js **22+** is required; no npm dependencies are needed.

```sh
npm run build
npm run check:generated
npm test
```

Edit `src/redirect.js` and `config/google-domains.json`; `scripts/build.mjs` generates `Google-Search-Redirect.js` offline. Run `node scripts/browser-fixture.mjs` to generate a WebKit DOM/FormData fixture. Automated tests do not replace testing on real Google pages, userscript managers, or signed Safari extensions.
