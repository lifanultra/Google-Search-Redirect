# Using Google Search Redirect with wBlock

This is the existing userscript, not a wBlock filter list or a second installation source. The compatibility review below is based on [wBlock source at commit `9aef813`](https://github.com/0xCUB3/wBlock/tree/9aef8131b26e8b99ce470a9b999155b53946a1f8); an App Store build may differ. This project has **not** been tested in wBlock on an iPhone or iPad.

## Install

1. In wBlock, open **Scripts**, choose **Add Userscript or Userstyle**, then **Userscript** and URL. Paste this project's fixed URL, review the result, and add it:

   `https://raw.githubusercontent.com/lifanultra/Google-Search-Redirect/refs/heads/main/Google-Search-Redirect.js`

2. Make sure the imported script is enabled. Enable the **wBlock Scripts** Safari extension in iOS/iPadOS Settings → Apps → Safari → Extensions (the path and labels can vary by OS). Grant it access to the Google sites you want to use; also check per-site extension permissions in Safari. Enabling only a wBlock content blocker is not the same as enabling its Scripts extension.
3. Disable this same script in other userscript managers to avoid duplicate execution. Reload a relevant Google page. These are instructions for the user; installation and permissions cannot be changed by this repository.

The script's `@downloadURL` and `@updateURL` use the same fixed URL. Update behavior depends on your wBlock version and settings; check the installed script after updates. This URL follows the repository's `main` branch, not a pinned release, so inspect changes and trust the publisher before importing or updating.

## Scope and verification

The reviewed [metadata parser](https://github.com/0xCUB3/wBlock/blob/9aef8131b26e8b99ce470a9b999155b53946a1f8/wBlockCoreService/UserScript.swift) reads `@match`, `@run-at`, `@grant`, and `@noframes`; its matching code supports the script's exact-host HTTP/HTTPS patterns. The reviewed [iOS injector](https://github.com/0xCUB3/wBlock/blob/9aef8131b26e8b99ce470a9b999155b53946a1f8/wBlock%20Scripts%20(iOS)/Resources/userscript-injector.js) handles `document-start`, `none` and frame exclusion. Actual injection timing and page-world behavior still depend on Safari, CSP and the installed wBlock build; `document-start` is not a guarantee of execution before the first request or every page script.

Run `node --test tests/wblock-compat.test.mjs` and `node scripts/build.mjs --check` locally. The first checks the generated file's directives and domain inventory using a **limited independent model**, not the actual Swift parser or Safari. Other project tests exercise userscript behavior separately. These checks do not establish real-device compatibility.

For a manual check, use a supported non-`www.google.com` Google search host and a normal search query; inspect the destination, then try a normal result link and the back button. Some searches or hosts may intentionally remain unchanged. If nothing happens, check the imported script is enabled, the Scripts extension and website permissions, then retry without another manager. If a site breaks, disable the script and reload. Do not enter private test data into unfamiliar domains.

`google.con` is not a supported match and is not guaranteed to resolve or have a valid certificate. A userscript cannot fix a DNS/TLS error page or intercept the initial address-bar request. No untested filter or redirect rule is recommended here: a malformed rule could block navigation, leak a query, or change behavior on other sites. Speed gains are not guaranteed.
