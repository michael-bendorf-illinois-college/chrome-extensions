# Search SHARE

Search **SHARE** (Sharing Heartland's Available Resources Equally) library catalogs directly from selected text in Google Chrome. Highlight a title, author, or phrase, right-click, and choose **Search SHARE**. Version **1.1.0** lets each user pick their own SHARE member library's shortcut in a settings page.

**Version:** 1.1.0 · **Chrome:** Manifest V3 · **Build dependencies:** None · **Distribution:** Source code for manual installation

> An independent extension, not an official SHARE or Illinois Heartland Library System product. Not published to the Chrome Web Store.

## What is SHARE?

[SHARE](https://share.illinoisheartland.org/about) is the shared online-catalog and library automation consortium of the **Illinois Heartland Library System (IHLS)**, serving member libraries across central and southern Illinois. Its name means **Sharing Heartland's Available Resources Equally**. The system helps participating libraries and patrons discover materials and share library resources.

Member libraries have shortcut addresses such as `carp.illshareit.com`, directing patrons to their catalog. The [SHARE Library Locator](https://www.illshareit.com/) shows these shortcut URLs.

## Features

- Right-click selected webpage text and choose **Search SHARE** to open a keyword-search tab.
- Configure the library's shortcut *subdomain*, selecting that member library's `*.illshareit.com` catalog hostname.
- Open **Settings** by clicking the toolbar icon or Chrome's extension details.
- Save your choice in `chrome.storage.local`; no external configuration server, account, or API key.
- Live destination preview, input validation, and a reset button.
- Preserve the original URL parameters and selected-text encoding.
- Clean settings page modeled after **Read Selection Aloud**.
- No content scripts, browsing-history collection, analytics, or third-party libraries.

The original extension used Carlinville Public Library. **The default remains `carp`** so existing search behavior is preserved until a different library is selected.

## Install

1. Download or clone the [chrome-extensions repository](https://github.com/michael-bendorf-illinois-college/chrome-extensions), then extract it to a permanent location.
2. Open `chrome://extensions` in Chrome and enable **Developer mode**.
3. Choose **Load unpacked** and select the **`search-share`** folder (directly containing `manifest.json`).
4. Confirm **Search SHARE** appears and is enabled.

Select the extracted extension directory, not the ZIP or the repository root. Keep that folder in place. See [Chrome's official instructions](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked).

### Upgrading from version 1.0

The project was **renamed** from `search-carpl/` to `search-share/`. If Chrome was loading the old unpacked folder, it may recognize the new folder as a separate installation. Disable or remove the old installation and load `search-share` to avoid duplicate right-click entries. The original files remain recoverable in Git history.

## Configure your member library

1. Click the **Search SHARE** toolbar icon, or use `chrome://extensions` → **Details → Extension options**.
2. Open the [SHARE Library Locator](https://www.illshareit.com/).
3. Enter a town or address in **Enter your home address**, then select a suggested place.
4. Change **within** to 6, 12, or 24 miles as needed.
5. Find your member library in the results and read its displayed shortcut URL.
6. Enter only the segment before `.illshareit.com` in Settings and choose **Save settings**.

| Locator shortcut | Subdomain to enter |
| --- | --- |
| `carp.illshareit.com` — Carlinville Public Library | `carp` |
| `blca.illshareit.com` — Blackburn College | `blca` |

A town name can be enough; entering a private home address is not always necessary. Use only a shortcut shown for **your** member library.

The field accepts 1–63 letters, digits, and internal hyphens. Uppercase becomes lowercase. **Do not enter** `https://`, the full hostname, a path, spaces, or a URL. Read the [detailed locator instructions](docs/SHARE-LIBRARY-LOCATOR.md).

## Search

1. Highlight a title, author, subject, or other phrase on a normal webpage.
2. Right-click and choose **Search SHARE**.
3. A new Chrome tab opens the keyword search in your chosen member library's SHARE catalog.

With the default `carp` setting, highlighting `The Hobbit` opens:

`https://carp.illshareit.com/Union/Search?view=list&showCovers=on&lookfor=The%20Hobbit&searchIndex=Keyword&searchSource=local`

The extension trims and URL-encodes the selection. The other query parameters preserve the v1.0 behavior:

| Parameter | Value | Purpose |
| --- | --- | --- |
| `view` | `list` | Requests the list result display. |
| `showCovers` | `on` | Requests cover images when available. |
| `lookfor` | Selected text | Supplies the encoded keyword query. |
| `searchIndex` | `Keyword` | Specifies keyword search. |
| `searchSource` | `local` | Retains the catalog's original source selector; its exact scope is defined by the catalog. |

**Only the hostname changes.** SHARE controls its catalog URL format and availability; catalog changes may require a later extension update.

## Permissions and privacy

| Chrome permission | Purpose |
| --- | --- |
| `contextMenus` | Show **Search SHARE** in the selected-text right-click menu. |
| `storage` | Remember your chosen library subdomain locally. |

The code uses `chrome.tabs.create` to open a results tab and `chrome.runtime.openOptionsPage` to show settings, without requesting the additional `tabs` permission.

- Only the library subdomain is stored in `chrome.storage.local`. It is not synced between devices.
- The extension does **not** save highlighted text or continuously inspect webpages. It reads the selection supplied when you invoke its menu command.
- Search phrases become part of the target URL. **URL encoding is not encryption**: the text may be visible in Chrome history, the address bar, and the catalog operator's logs.
- No analytics, content scripts, or background network queries run.
- The linked SHARE pages are external and have their own data-handling practices.

Avoid selecting confidential information for public-catalog searches.

## Troubleshooting

| Symptom | Try this |
| --- | --- |
| Menu command missing | Select text first; verify the extension is enabled and try a regular webpage. |
| Toolbar button doesn't open settings | Confirm v1.1.0 was loaded from `search-share`; check Chrome's extension **Errors** panel. |
| Wrong library opens | Verify and resave the subdomain against the official SHARE Locator. |
| Settings rejects value | Enter only `carp`, for example, not `carp.illshareit.com` or a URL. |
| Catalog can't be reached | Open the shortcut on the locator; SHARE's destination may have changed. |
| Unexpected results | Check the selected text; the original keyword/search-source parameters are preserved. |
| Two identical menu items | Disable or remove the previous unpacked `search-carpl` installation. |
| Can't load a ZIP | Extract it, then select the folder containing `manifest.json` via **Load unpacked**. |

## Project layout

```text
search-share/
├── manifest.json
├── config.js                 Shared validation and URL builder
├── background.js             Context menu and catalog navigation
├── options.html              SHARE information and library settings
├── options.css
├── options.js
├── icons/
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
├── tests/verify.js            Automated smoke/regression tests
├── docs/
│   ├── DEVELOPMENT.md
│   ├── SHARE-LIBRARY-LOCATOR.md
│   └── TESTING.md
├── CHANGELOG.md
└── README.md
```

The existing purple-book icons remain unchanged; they contain no previous naming. The unnecessary v1.0 web-accessible-icon declaration was removed.

## Development and release status

No build step is needed. Run optional Node smoke tests from the extension folder:

```bash
node tests/verify.js
```

See [developer notes](docs/DEVELOPMENT.md) and the [manual testing checklist](docs/TESTING.md). Automated tests use mocked Chrome APIs; **live tests inside Chrome against the catalog have not been conducted** in this publication process.

This public source release has not been submitted to the Chrome Web Store. No explicit software license has been selected; public access to the source alone does not grant general reuse rights.

## Official references

- [SHARE — About](https://share.illinoisheartland.org/about)
- [SHARE Library Locator](https://www.illshareit.com/)
- [Chrome — Load unpacked](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked)
- [Chrome — Context menus API](https://developer.chrome.com/docs/extensions/reference/api/contextMenus)
- [Chrome — Storage API](https://developer.chrome.com/docs/extensions/reference/api/storage)
