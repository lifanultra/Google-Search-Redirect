# Optional Safari request companion

Author: **LIFANULTRA**.

This directory is **Safari WebExtension source**, not a native iOS app, not an installed extension, and not required by the userscript. Nothing installs or enables it automatically. There are no background scripts, content scripts, runtime JavaScript, telemetry, remote dependencies, or parameter-cleanup rules. The sole default-enabled static ruleset performs domain/HTTPS normalization.

## Build and install

Requires Node 22 for offline generation:

```sh
node scripts/build-extension.mjs
node --test tests/extension.test.mjs
```

The allowlist comes only from the checked-in `config/google-domains.json` (188 official suffixes), plus the two exact typo authorities `google.con` and `www.google.con`. Generated source is in `extensions/safari/generated/` (`manifest.json`, `rules/normalize.json`). Do not hand-edit generated files. The main build should call this generator after `node scripts/build.mjs`; the userscript must not import or install the companion.

Installation needs **a Mac with Xcode** and Apple's Safari Web Extension converter, for example from the repository root:

```sh
xcrun safari-web-extension-converter extensions/safari/generated --project-location /tmp/GoogleSearchRedirectSafari
```

Open the resulting Xcode project, configure its signing team and identifiers, and set deployment targets to macOS 26 / iOS 26 or newer as applicable. Build/sign the containing app and extension, install to the chosen Mac/iPhone/iPad, then explicitly enable the extension in Safari settings and grant the requested Google website access. For a local macOS developer build Safari may require enabling unsigned extensions; distribution needs appropriate Apple signing/provisioning. Follow Xcode/converter diagnostics rather than treating this source directory as an installable iOS app. No Xcode project, signed app or App Store distribution is supplied here.

## Minimum version: Safari 26

MDN Browser Compatibility Data marks DNR `requestMethods` (and `excludedRequestMethods`) as first supported in **Safari 26**, including Safari on iOS. `requestDomains` starts at Safari 16.4 and redirects at 15.4, but those older versions cannot safely enforce this companion's GET-only policy. `browser_specific_settings.safari.strict_min_version` is therefore `26.0`. Do not lower it or remove `requestMethods`: that can redirect POST navigations and change submission semantics. Deployment targets in a converted Xcode project must enforce the same floor.

Sources checked for this implementation:

- [MDN BCD: DNR RuleCondition](https://github.com/mdn/browser-compat-data/blob/main/webextensions/api/declarativeNetRequest.json) (`requestMethods`, `requestDomains`).
- [MDN BCD: Safari manifest version gating](https://github.com/mdn/browser-compat-data/blob/main/webextensions/manifest/browser_specific_settings.json).
- [MDN RuleCondition](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/declarativeNetRequest/RuleCondition).
- [Apple: Converting a web extension for Safari](https://developer.apple.com/documentation/safariservices/converting-a-web-extension-for-safari).

## Exact behavior

Only main-frame HTTP(S) **GET** requests to an exact allowlisted bare Google domain or `www` host qualify. DNR `requestDomains` can include subdomains, so every rule also anchors and rechecks the complete authority, scheme and exact case-sensitive path. There are no all-web or wildcard-subdomain host permissions. Match-pattern paths are broad because host permissions cannot express individual GET paths; the rules impose the narrower path/method checks.

Eligible paths are `/`, `/webhp`, and `/search` with a first, literal, nonblank `q` parameter. Redirects replace only scheme/authority with `https://www.google.com`; the entire path, query and fragment suffix is copied with `regexSubstitution`. `client`, `sourceid`, account selection, functional filters, unknown parameters, repeated parameters, encoding and ordering are not cleaned or rebuilt. The canonical `https://www.google.com` authority is excluded structurally to prevent loops. Home and `webhp` do not need `q`.

Search matching is deliberately conservative: only the literal lowercase key `q` is recognized; an encoded parameter key before the first literal `q` leaves the navigation untouched. An empty/whitespace-only first `q` is not rescued by a later duplicate `q`. `+`, ASCII percent-encoded whitespace and UTF-8 ECMAScript trim whitespace are recognized as blank; Chinese and other encoded nonblank terms qualify. Malformed/incomplete percent escapes can be left untouched instead of attempting dynamic decoding. This is not a full URLSearchParams parser.

POST/HEAD and other methods, subframes/subresources, arbitrary paths, other Google services/subdomains, trailing-dot hosts, third-party/lookalike domains, visible credentials and nonstandard ports do not match. URL canonicalization by Safari occurs before DNR: default ports can disappear, and credentials might be removed from a request URL before rule evaluation. A pure declarative rule cannot recover that lost input or promise to reject an original address whose credentials were stripped upstream. The regex itself never accepts credentials or explicit ports.

## What this does NOT prove or fix

- The rules act at Safari's declarative request layer, before a matching request is sent; this can avoid requesting/resolving the mistyped origin. **No real-device interception, DNS suppression, latency improvement or network timing has been measured here.** Speculative DNS/preconnect, browser internals and privacy/network services can still perform independent work; this is not a DNS firewall.
- If the address bar interprets bare `google.con` as search text instead of a URL, there is no `google.con` request for DNR to correct. Test with an explicit `https://google.con/` URL. No dynamic fuzzy typo correction is implemented.
- Browser-internal/privileged pages, other extensions, requests outside Safari, restricted traffic and traffic denied by website permissions may bypass WebExtension rules. Safari's permission and private-browsing settings remain authoritative.
- Some URL fragments are not sent over HTTP and may not appear in the request URL exposed to a particular browser's DNR implementation. The substitution copies the fragment verbatim **when it is present**; end-to-end fragment inheritance and Safari normalization require a signed-device check.
- Regexes use RE2-compatible regular-language constructs, no lookahead/lookbehind or pattern backreferences; each source is capped at 2KB. Crucially, WebKit's content-rule URL parser rejects `|` disjunction and built-in classes such as `\\s`, even though RE2 accepts them. The generator therefore emits separate bounded rules for significant encoded-byte alternatives, and uses only the smaller Safari syntax subset. Domain matching is the intersection of an anchored bare/www authority grammar (`co.`/`com.` optional prefix, 2–3-letter final suffix) and the explicit requestDomains allowlist: an arbitrary suffix fails the allowlist, while any subdomain containing another `google.` fails the grammar. Node tests explicitly check these intersections and unsupported syntax. A 2KB source cap is not proof of a browser's compiled regex memory limit. Node tests emulate matching with JavaScript RegExp, **not RE2 or Safari**. Validate generated rules with Safari's `isRegexSupported` and actual navigation after conversion/signing; no browser engine support is inferred solely from Node passing. See [WebKit URLFilterParser](https://github.com/WebKit/WebKit/blob/main/Source/WebCore/contentextensions/URLFilterParser.cpp) and [Safari DNR validation](https://github.com/WebKit/WebKit/blob/main/Source/WebKit/UIProcess/Extensions/Cocoa/_WKWebExtensionDeclarativeNetRequestRule.mm).

## Signed-device acceptance checklist

1. Confirm Safari 26+, signing, deployment target, extension enabled and website access granted.
2. Validate every generated regex with `browser.declarativeNetRequest.isRegexSupported` in an extension debugging context, with capture support where offered. Inspect Safari's extension diagnostics for rejected rules before relying on the extension.
3. Navigate explicitly to `https://google.con/search?q=test&client=safari#fragment`, an official bare/www regional domain, HTTP canonical `www.google.com`, and canonical HTTPS. Confirm one normalization and no canonical loop; verify query/fragment preservation.
4. Check a GET form and a POST form whose action includes `?q=test`; POST must remain untouched. Check a subframe and subresource as negative controls.
5. Check fake suffix hosts, credentials, custom ports, service subdomains and non-search paths; inspect the actual request URL if Safari canonicalizes authority components.
6. Test address-bar search interpretation, private browsing/site permissions, and browser-internal navigation separately. Measure DNS/network behavior with external instrumentation if needed; Node tests do not establish it.
