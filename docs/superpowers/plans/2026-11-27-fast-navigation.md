# Google Search Redirect 4.0 implementation plan

> **For agentic workers:** Execute the approved design task-by-task with tests before implementation.

**Goal:** Remove avoidable reloads, safely prepare subsequent search navigation, add configurable URL cleanup and a separate request-layer typo companion, then publish and merge a reviewed PR.

**Architecture:** One dependency-free document-start userscript, built offline from a source template and a checked-in Google suffix list. Tests execute the distributed script in Node VM and real WebKit DOM fixtures. A separate optional declarative extension handles main-frame GET requests before DNS; it is not silently installed or represented as an iOS app.

**Tech Stack:** JavaScript, Node 22 node:test, browser WebKit, GitHub Actions, GitHub MCP.

**Spec:** User-approved proposal in this conversation (2026-11-27); user explicitly requested implementation, GitHub submission and merge, with no further design questions.

## Global constraints
- No timers, remote runtime dependencies, polling, search telemetry, all-web userscript access, cookie modification, global network/history prototype patches, or tracking cleanup reloads.
- Canonical HTTPS Google does not get a document reload. Only known hosts and exact home/search paths. Unknown parameters, encodings, fragments, functional filters and account selection survive.
- Default cleanup covers utm_* and client/source identifiers; either can be disabled via SETTINGS. Current loaded URL cleanup uses replaceState only, preserving history.state.
- GET forms only; skip POST, non-self target forms, form overrides that cannot be safely supported. Native link navigation and history remain native. No DOM scans or MutationObserver.
- Exact google.con/www.google.con typo correction is limited to links/forms the script sees; address-bar correction requires the optional request-layer extension. No claim of measured real-world speed improvement.
- Retain bounded fail-safe loop protection without limiting distinct rapid searches, separate navigation guards from event installation, handle prerender activation and BFCache without repeat forced navigation.

## Review focus
- POST navigations containing a query string and forms with submitter overrides.
- Plain clicks vs long press/new tab, relative links, malicious lookalike domains and custom ports.
- Encoded keys, repeated q, C++/percent escapes, fragments and non-ASCII search terms.
- Storage denial/corruption, identical bouncing targets with altered telemetry, many distinct quick searches.
- Google page state, history traversal, prerender activation and repeated injection.

## Tasks
1. Freeze baseline, create build/domain inputs and write failing VM tests for no-reload cleanup, safe navigation, query preservation and loop guards; prove failures on v3.
2. Implement minimal dependency-free userscript and offline build; get all tests green. Add focused real DOM fixture tests and CI.
3. Independently build/test optional Safari WebExtension source and narrowly scoped main-frame GET rules. Document Xcode/signing and permissions; no claims of installed native extension.
4. Document installation, optional cleanup, known limitations, deterministic generation and manual iPhone A/B checklist. Independently review all changes and fix important findings with regression tests.
5. Run fresh build/check/tests/WebKit checks; push feature branch, open PR, inspect checks, merge with expected head SHA, fetch main and verify remote tree and final tests.

## Evidence / progress
- Baseline main: 17bb4e74c1e9b3704214fae32dfec469374c717b; clean tree; Node v22.23.2.
- v3 does not match canonical HTTPS www.google.com, has 188 suffixes, no runtime timers or remote dependencies.
- Native Safari user-script manager/version/network timings unknown. IANA has no CON; user script cannot run on DNS failure page.

## Final design refinements and verification
- User pinned the only installation/update URL to `https://raw.githubusercontent.com/lifanultra/Google-Search-Redirect/refs/heads/main/Google-Search-Redirect.js`, author `LIFANULTRA`; no alternate .user.js distribution.
- Seven requested ScriptCat sources plus four related GitHub repositories were read. Source snapshots indexed in docs/research-sources.json; independent strategy references only at distributed script footer.
- Actual WebKit navigation review disproved changing form action in formdata. Final userscript never writes form action or re-submits; only cleans approved serialized GET payload after submit dispatch. Request-layer routing is optional and separate.
- Added bounded known Google /url link extraction and contextmenu preparation; no external business-field recursion, network resolver or default-action takeover.
- Loop identity ignores known telemetry/order/fragment variation for 120s, preserves functional filters and actual query bytes; no distinct-search global counter.
- First complete 44-case suite passed. Final browser fixture initially hung due synthetic external anchor activation; the fixture now cancels that default action after verifying product did not cancel. Eleven WebKit DOM fixture checks passed; these are not real-Google/script-manager/signed-extension or speed tests.
- Independent final source review found no new Critical/Important runtime blocker; stale artifact noted during parallel review has been rebuilt and checked. A final full run with 188-suffix main-runtime matrix precedes publication.
