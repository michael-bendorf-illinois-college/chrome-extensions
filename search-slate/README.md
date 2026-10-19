# Search Slate (Slate Context Search)

A small Google Chrome extension that lets you highlight text on a webpage, right-click, and choose **Search Slate** to open an Illinois College Slate CRM lookup in a new tab.

**Version:** 1.0 · **Extension format:** Manifest V3 · **Browser:** Google Chrome · **Dependencies:** None

> **Institution-specific extension.** This version is configured for the **Illinois College Admission Slate environment**. Its search URL and lookup-base identifier are hardcoded in `background.js`. An authenticated Slate account with the necessary access is required to use the destination. This source release is not a Chrome Web Store listing.

## What it does

- Adds **Search Slate** to Chrome's right-click menu when text is highlighted.
- Accepts text selected on a webpage, trims whitespace at its beginning and end, and URL-encodes it.
- Inserts the encoded selection into a predefined Slate lookup URL.
- Opens that URL in a **new browser tab**.
- Uses no popup, preferences page, third-party package, content script, or API token.

**Example:** Highlight `Jane Smith`, right-click, and choose **Search Slate**. The extension opens a new tab with the term included in the search state of the configured Illinois College Slate lookup.

The extension submits the **selected phrase** as its search query; it does not collect data from the rest of the webpage, search every record on its own, or bypass Slate access permissions.

## Install from GitHub

1. Open the [chrome-extensions repository](https://github.com/michael-bendorf-illinois-college/chrome-extensions).
2. Select **Code → Download ZIP** and extract it to a permanent location on your computer (or clone the repository).
3. Locate the **`search-slate`** subfolder. The folder you select must contain `manifest.json` directly.
4. In Chrome, open `chrome://extensions`.
5. Enable **Developer mode** in the upper-right corner.
6. Select **Load unpacked** and choose the extracted `search-slate` folder.
7. Confirm **Slate Context Search** appears among the installed extensions.

**Do not choose** the whole repository folder or the still-compressed ZIP. Chrome needs the specific unpacked extension directory.

You can optionally pin its icon, but the main feature is accessed through the **right-click context menu** rather than the toolbar icon. Clicking the action icon does not open a settings page in this version.

Keep the extracted source folder in place; Chrome relies on it to load the unpacked extension.

See [Chrome's official unpacked-extension instructions](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked) if the extension does not load.

## How to use

1. Open a webpage with selectable text.
2. Highlight a name, email address, identifier, or other phrase you want to look up **if appropriate for your Slate access and data-handling policies**.
3. Right-click the selection.
4. Select **Search Slate**.
5. A new tab opens the configured Illinois College Slate lookup with the highlighted phrase as the query.
6. Sign in to Slate if prompted; access to the destination is controlled by Slate.

The menu item appears only in selection contexts. Some browser-internal or other restricted pages may not offer extension context-menu actions.

### Search target

The destination is defined by the `URL_TEMPLATE` constant in `background.js`. The currently configured template:

- Uses the `https://admission.ic.edu` Slate host.
- Opens a specific `/manage/lookup/search` route.
- Includes a fixed lookup-base identifier.
- Encodes the search text in the URL's hash-fragment search state.
- Requests the initial search page with the saved template's sort and filter state.

**This is not a generic Slate-wide search.** Results depend on that lookup's configuration and the signed-in user's Slate permissions. If the lookup base, route, or Slate search-state format changes, the extension may need an update.

## Permissions and data handling

The manifest requests only the **`contextMenus`** permission to register the **Search Slate** item. It invokes `chrome.tabs.create` to open a tab; Chrome does not require the additional `tabs` permission for that operation.

The manifest also declares its four icon files as `web_accessible_resources` for `<all_urls>`. This makes the **icons** available as extension resources to webpages; it does **not** grant the extension permission to inspect those webpages. The existing declaration is preserved from the original source and could be reviewed for minimization in a future release.

### Privacy considerations

- The extension accesses the selected text at the time you choose **Search Slate**.
- It encodes that phrase into the destination URL; **URL encoding is not encryption**.
- The phrase may appear in the new tab's address bar and browser history. Be thoughtful about searching sensitive personal data, particularly on shared computers or while screen sharing.
- Chrome navigates to the configured Illinois College Slate destination. How the query is subsequently processed is governed by that Slate application and your institution's policies.
- The supplied extension code has **no analytics, tracking, external dependencies, account credentials, direct HTTP client calls, persistent query log, or local storage**.
- It does not use content scripts or request host permissions.

This is a convenience tool for authorized users, **not** a way to access records without Slate authentication or authorization.

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| **Search Slate** is missing | Select text first; verify **Slate Context Search** is enabled in `chrome://extensions`; reload it; try a normal webpage rather than a restricted Chrome page. |
| Chrome cannot load it | Choose the folder that directly contains `manifest.json`. Extract ZIPs before using **Load unpacked**. |
| A new tab opens but Slate asks for login | Sign in with your authorized Illinois College Slate account; the extension does not provide authentication. |
| A new tab opens but the lookup is unavailable | Check your Slate access, the hardcoded host and lookup base, and whether Slate has changed its lookup URL format. |
| The search query looks wrong | Confirm you selected the intended text. `background.js` uses `trim()` and `encodeURIComponent()`. Check browser Developer Tools for errors. |
| No new tab opens | Check the extension's **Errors** button or service-worker console in `chrome://extensions`. |
| It worked before but stopped after moving files | Restore the unpacked source to its original folder or reload it from the new location. |

## Project structure

```text
search-slate/
├── manifest.json          Manifest V3 identity, permissions, icons
├── background.js          Context-menu creation and Slate navigation
├── icons/
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
├── README.md              Installation, operation, privacy, troubleshooting
├── CHANGELOG.md           Initial public source-release record
└── docs/
    └── DEVELOPMENT.md    Architecture, customization, and test checklist
```

The application files and icons above match the supplied `search_slate.zip` snapshot, whose inner folder was named `search_slate`. In this repository, the parent directory is named `search-slate` for consistent project naming. **No source-code or icon changes were made for publication.**

## Customization and development

This project has no build process or package-manager dependencies. To change the destination for another Slate environment, review and update `URL_TEMPLATE` in `background.js`, including the host, lookup base, and search-state structure required by that environment. Reload the unpacked extension in `chrome://extensions` after editing the service worker.

See [Development and testing](docs/DEVELOPMENT.md) for detailed behavior, safe customization steps, and a manual test checklist.

Static ZIP integrity, manifest, JavaScript syntax, and icon checks were completed for this release. **Interactive testing inside an authenticated Slate session was not performed as part of GitHub publication**.

## Distribution and license

This source is published on GitHub for visibility and manual installation. It has not been submitted to the Chrome Web Store. No explicit software license has been added at the time of initial publication; public source visibility alone does not establish an open-source license.

## References

- [Chrome: Load an unpacked extension](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked)
- [Chrome: Context menus API](https://developer.chrome.com/docs/extensions/reference/api/contextMenus)
- [Chrome: Tabs API](https://developer.chrome.com/docs/extensions/reference/api/tabs)
- [Chrome: Web-accessible resources](https://developer.chrome.com/docs/extensions/reference/manifest/web-accessible-resources)
