# Research and implementation decisions — 2026-11-27

## Source audit

Read all seven user-specified ScriptCat installation sources, not only their presentation pages. The exact downloaded sources, response status, retrieval time and SHA-256 are indexed in `research-sources.json`. Upstream code was not vendored or copied; these are independent implementations of selected strategies.

| ID | Script/version | Adopted idea | Deliberately not adopted |
|---|---|---|---|
| 1706 | 重定向链接 0.1 | Exact known entry point | Re-decoding an entire target; no protocol validation |
| 5392 | 网页重定向 2.6.2 | Explicit switches, idempotent install | Global navigation/history/form prototype hooks |
| 8937 | Auto Redirect Purifier 3.4 | Local bounded extraction | Guessing DOM targets or recursively unwrapping arbitrary external query fields |
| 5462 | 移动端去除链接重定向 1.5 | Bounded state and work | Network fallback, full-page scans, click takeover |
| 3053 | 兔小巢首页阻止重定向 2025-03-30 | Site-scoped early execution | UA/orientation or String prototype spoofing |
| 3211 | 跳转链接修复 2.27.0 | Separate Google service paths; change href rather than own navigation | Broad host guessing, non-HTTP targets, full-DOM rescans |
| 2567 | No Google vignette 0.1.0 | Exact trigger recognition | Reload/path truncation or blind node removal |

Also read fixed-commit source files from google-search-ncr, ClearURLs/Rules, Neat-URL and AdGuardFilters. They reinforce preserving query bytes, keeping functional/encoding parameters, path-specific exceptions and event-time processing. Their source URLs and fixed commits appear only in the distributed script's final References comment. Upstream licenses were examined: several sources have no declared license, and some repositories use GPL/LGPL; no implementation or rule tables were copied.

## Changes supported by the research

- Preserve raw retained query segments and duplicate fields; clean a small explicit set only.
- Clean client/source parameters by default; preserve encoding, locale, account and search modes.
- Prepare clicked/aux-clicked/context-menu Google links without polling, page scans or network resolution.
- Unwrap at most three *known Google /url wrappers* with exactly one unambiguous target, HTTP(S)/credential/port checks and a visited set. Never reinterpret q/url on the external destination, decode twice, or pick an arbitrary DOM button.
- Use only identity-time normalization for the per-origin loop guard: known telemetry exclusion, stable key ordering, duplicate-key order preservation and fragment independence. Do not reorder actual outgoing query bytes.
- Retain a bounded two-minute guard for identical logical searches, not a counter across different searches. It is not a cross-origin or absolute anti-loop guarantee.

## Native form submission: evidence changed the design

An independent reviewer exercised actual WebKit `requestSubmit()` and iframe navigation. Changing action in `formdata` changed the DOM property but not the request target already captured by WebKit. Changing it during submit capture could affect later handlers that cancel or switch to POST.

Therefore the userscript **never rewrites form action or re-submits a form**. It records qualified GET intent, ignores FormData inspections during submit dispatch, rechecks cancellation/method/effective target/submitter, and only cleans the final serialized payload. Request-layer routing belongs in the optional extension, not an unreliable userscript imitation. Native DOM fixtures cover these lifecycle cases.

## Verification boundaries

Node VM/rule-model tests and native WebKit DOM fixtures are reproducible local correctness checks. They are not real Google, script-manager injection, real-network speed measurements or signed Safari-extension interception tests. The optional request companion requires Safari 26+, Mac/Xcode conversion, signing and user website permissions; no native app is installed by the userscript.

## SafeRedirect: Google rules

The Loon SafeRedirect plugin snapshot `0b6897dc17e0c513d25449c935a9694818e32f0c` contains request-layer 302 rewrites for Google China search and Maps entry points. It does not contain Google result-link extraction or an associated Google JavaScript script. The plugin's URL-pattern and MITM execution model is different from document-start userscripts; this project retains its exact search-host and path allowlists instead of copying network rules or changing Google Maps. The fixed source is recorded in the distributed script's References footer.
