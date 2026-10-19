# Search CarPL

A lightweight Google Chrome extension that lets you highlight text on a webpage, right-click, and select **Search CarPL** to search the configured CarPL library catalog in a new tab.

**Version:** 1.0 · **Extension format:** Manifest V3 · **Browser:** Google Chrome · **Dependencies:** None

> This is a source-code release for manual installation, not a Chrome Web Store listing. The catalog URL is hardcoded for the CarPL destination used by this version. A later revision may change that configuration.

## Features

- Adds **Search CarPL** to Chrome's right-click context menu for highlighted text.
- Uses the selected word or phrase as a **keyword search**.
- Trims leading and trailing spaces and URL-encodes the search text.
- Opens catalog results in a new browser tab.
- Keeps the original webpage open.
- Requires no popup, settings page, API key, content script, or third-party dependency.

**Example:** Highlight `The Hobbit` on a webpage, right-click, and choose **Search CarPL**. A new tab opens the configured library catalog with `The Hobbit` as the keyword query.

The extension operates only when you select its context-menu command. It does not search automatically as you browse or collect the contents of entire webpages.

## Install from GitHub

1. Open the [chrome-extensions repository](https://github.com/michael-bendorf-illinois-college/chrome-extensions).
2. Use **Code → Download ZIP**, or clone the repository, and extract the files to a permanent location.
3. Find the **`search-carpl`** folder inside the repository.
4. In Chrome, open `chrome://extensions`.
5. Turn on **Developer mode** using the switch near the upper-right corner.
6. Choose **Load unpacked** and select the **`search-carpl`** folder—the directory that directly contains `manifest.json`.
7. Confirm **Search CarPL** is listed and enabled.

You must select the extracted extension folder, not the compressed ZIP or the repository's top-level directory.

You can pin its icon in Chrome if you like, but searches are launched using the **right-click menu**. Clicking the toolbar icon does not open a popup in version 1.0.

Keep the unpacked folder in place so Chrome can continue to load it. See [Chrome's official installation instructions](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked) if needed.

## Use the extension

1. Open a normal webpage containing selectable text.
2. Highlight a title, author, subject, or other search phrase.
3. Right-click the selection.
4. Choose **Search CarPL**.
5. The extension opens a new tab containing a keyword search at the configured catalog URL.

The menu item appears in selection contexts. Chrome-internal and other restricted pages may not allow extension context-menu actions.

### What the search URL does

The source file `background.js` contains a single `URL_TEMPLATE` with the destination:

```text
https://carp.illshareit.com/Union/Search
```

The template uses these query parameters:

| Parameter | Value in v1.0 | Purpose |
| --- | --- | --- |
| `view` | `list` | Requests the list-style results view. |
| `showCovers` | `on` | Requests cover images where the catalog provides them. |
| `lookfor` | Your highlighted text | Supplies the search phrase after URL encoding. |
| `searchIndex` | `Keyword` | Selects a keyword search. |
| `searchSource` | `local` | Uses the catalog's configured local search source. |

The last parameter's exact result scope is controlled by the catalog application, not by this extension.

This URL may change as the library catalog or its hosting platform evolves. If the destination stops working, review the current catalog URL before modifying the source.

## Permissions and privacy

The manifest requests only one Chrome API permission:

| Permission | Why it is used |
| --- | --- |
| `contextMenus` | Display the **Search CarPL** right-click action when text is selected. |

The extension calls `chrome.tabs.create` to open a new tab. Chrome permits this without requesting the additional `tabs` permission.

The manifest declares its icon files under `web_accessible_resources`, matching `<all_urls>`. This exposes those **icon resources** to webpages; it does not grant the extension permission to read page content or access arbitrary websites. The original declaration is preserved and may be simplified in a future tested revision.

### Data handling

- The extension receives only the text Chrome supplies when you invoke **Search CarPL**.
- It applies `trim()` and `encodeURIComponent()`, then places the search phrase into the destination URL's `lookfor` query parameter.
- **URL encoding is not encryption.** The search phrase may be visible in the address bar, browser history, and the destination catalog's request logs.
- The code does not retain search history, save preferences, store selected text, run analytics, call other HTTP APIs, or use content scripts.
- Normal operation navigates your browser to the catalog. The catalog's own privacy practices and availability are separate from this extension.

Avoid selecting confidential or sensitive material for searches on a public catalog service.

## Troubleshooting

| Problem | Suggested action |
| --- | --- |
| **Search CarPL** is missing | Highlight text first, confirm the extension is enabled, and try a regular webpage rather than a restricted Chrome page. |
| Chrome cannot install the ZIP | Extract it first. Use **Load unpacked** on the folder containing `manifest.json`. |
| The context menu appears but nothing opens | Review the extension's **Errors** panel and service-worker console in `chrome://extensions`. |
| The catalog opens but the search is unexpected | Check the selected phrase and the `lookfor` parameter. The extension uses a fixed keyword-search configuration. |
| The catalog URL no longer works | Compare the hardcoded endpoint with the library's current catalog link; it may have changed since this version was built. |
| A new tab shows a service error or no results | The destination catalog may be unavailable, or the selected term may have no matching results. |
| The extension breaks after moving its folder | Reload it from the new location or restore the original unpacked folder. |

## Files included

```text
search-carpl/
├── manifest.json          Chrome Manifest V3 metadata
├── background.js          Selection menu and catalog URL navigation
├── icons/
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
├── README.md              Installation, usage, privacy, troubleshooting
├── CHANGELOG.md           Source publication history
└── docs/
    └── DEVELOPMENT.md    Architecture, customization, test checklist
```

The original six application files are preserved from `search_carpl.zip`. The ZIP's inner folder was named `search_carpl`; the repository directory uses `search-carpl` for consistent naming with the other projects. **The source code and icons were not altered for this publication.**

## Development and future customization

No compilation, package manager, or build step is necessary. To change the catalog address, keyword-search parameters, or search platform, edit `URL_TEMPLATE` in `background.js` and reload the unpacked extension from `chrome://extensions`. The template currently uses the literal `Z` as the placeholder for the URL-encoded selected text.

See [Development and testing](docs/DEVELOPMENT.md) for implementation details, validation results, and a manual acceptance checklist.

Static ZIP integrity, manifest references, JavaScript syntax, and image checks passed before initial GitHub publication. **Live testing in Chrome against the catalog was not performed in this publishing workflow.**

## Distribution and license

This public GitHub release is intended for code access and manual installation. It has not been submitted to the Chrome Web Store. No explicit software license has been selected for the initial repository publication.

## References

- [Chrome: Load an unpacked extension](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked)
- [Chrome: Context menus API](https://developer.chrome.com/docs/extensions/reference/api/contextMenus)
- [Chrome: Tabs API](https://developer.chrome.com/docs/extensions/reference/api/tabs)
- [Chrome: Web-accessible resources](https://developer.chrome.com/docs/extensions/reference/manifest/web-accessible-resources)
- [Carlinville Public Library](https://www.carlinvillelibrary.org/)
