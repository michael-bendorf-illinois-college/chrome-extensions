# Search Slate (Slate Context Search)

A small Google Chrome extension that sends highlighted text to a Slate CRM lookup using the right-click **Search Slate** command. Version **1.1.0** adds a settings page for a configurable Slate **hostname** and a personal **toolbar icon pack** while retaining the original search path, lookup-base ID, and selected-text behavior.

**Version:** 1.1.0 · **Extension format:** Manifest V3 · **Browser:** Google Chrome · **Dependencies:** None

> This extension ships with the Illinois College Admission Slate hostname as its default. The lookup-base identifier remains fixed in code; changing the hostname alone will not make that lookup ID valid in another Slate institution. This is a source-code release, not a Chrome Web Store listing.

## Features

- Highlight a name, email address, or other appropriate text, right-click, and choose **Search Slate**.
- Open a new browser tab with that phrase in the configured Slate lookup.
- Enter a different hostname without editing JavaScript.
- Load four personal PNG images as a toolbar icon pack, preview them, and restore the original icons.
- Remember the hostname and icon pack locally in Chrome.
- Click the extension's toolbar icon to open its settings page.
- Preserve the original lookup's route, query parameters, and hash-fragment search state.

No popup, content script, external library, or API credential is required.

## Installation

1. Download or clone the [chrome-extensions repository](https://github.com/michael-bendorf-illinois-college/chrome-extensions).
2. Extract the files to a permanent folder.
3. Open `chrome://extensions` in Google Chrome.
4. Turn on **Developer mode**.
5. Select **Load unpacked** and choose the repository's **`search-slate`** folder—the directory containing `manifest.json`.
6. Confirm **Slate Context Search** appears in Chrome's extensions list.
7. Optionally pin the extension icon through the puzzle-piece Extensions menu for convenient access to settings.

Do not choose the entire repository or an unextracted ZIP archive. Chrome's [unpacked-extension instructions](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked) cover this process.

### Upgrading from v1.0

If you previously installed the unpacked v1.0 extension, update the files **in the same existing extension folder**, then select **Reload** in `chrome://extensions`. Keeping the installed folder avoids accidentally creating a second unpacked extension.

Existing search behavior remains intact. In the absence of a saved setting, v1.1.0 uses `admission.ic.edu` and the original bundled icons.

## Search selected text

1. Highlight some text on a normal webpage.
2. Right-click the selection.
3. Choose **Search Slate**.
4. A new tab opens the configured Slate lookup with the highlighted phrase.

For example, highlighting `Jane Smith` produces a search query containing `Jane%20Smith`. Chrome may restrict extension menu actions on internal or protected pages.

Results depend on the lookup's configuration and the signed-in user's Slate permissions. Choose only a trusted hostname because the browser directs your selected search text to the configured destination. This extension never bypasses Slate authentication.

## Open the settings page

- Click the pinned extension toolbar icon, **or**
- Open `chrome://extensions` → **Slate Context Search** → **Details** → **Extension options**.

The page is visually patterned after the Read Selection Aloud settings page and contains two sections: **Slate destination** and **Toolbar icon pack**.

### 1. Slate destination: hostname

Enter a hostname such as:

```text
admission.ic.edu
```

You can also use a different hostname, such as `slate.example.edu`, if that host exposes the **same lookup path and lookup-base ID**.

Input rules:

- Enter **only** the hostname—no `https://`, slash, path, port, or query string.
- Letters, digits, hyphens, and dots are accepted; surrounding whitespace is trimmed and capital letters are normalized to lowercase.
- Searches always use **HTTPS**.
- Select **Use original** to put `admission.ic.edu` back in the field.
- Select **Save settings** to apply the change. Reset buttons stage a change; they do not save it automatically.

**Unchanged from v1.0:** The search still uses `/manage/lookup/search` with the fixed lookup-base GUID, `joinable=1`, and the same encoded search-state fragment. To adapt to another institution's different lookup base, the source would still need modification.

### 2. Toolbar icon pack

You may use the four original bundled PNGs or supply four of your own.

| Required image | Dimensions | Format |
| --- | --- | --- |
| Small icon | 16×16 pixels | PNG |
| Standard/high-density icon | 32×32 pixels | PNG |
| Medium icon | 48×48 pixels | PNG |
| Large icon | 128×128 pixels | PNG |

**All four files are required.** Each must be a valid square PNG and **256 KB or smaller**. Transparent backgrounds are recommended.

1. Prepare four separate PNG images at the exact dimensions above.
2. In settings, choose **Select four PNG files** and select all four at once. **Do not upload a ZIP.**
3. The extension checks file signatures, image dimensions, decodability, duplicates, and the per-file size limit.
4. Check the four image previews.
5. Select **Save settings** to activate your personal toolbar icons.
6. To revert, choose **Restore original icons** and then **Save settings**.

Filenames do not need to match any particular pattern; the settings page identifies images by their actual dimensions. The pack stays in `chrome.storage.local` on that Chrome installation and is **not uploaded to a server**.

**Important Chrome limitation:** Custom images replace the **toolbar action icon**, including its icon in the Extensions menu. The installed extension's identity icon in Chrome's extension-management/installation surfaces remains defined by the packaged `manifest.json`. The right-click menu item continues to read **Search Slate**. Chrome's runtime icon API does not replace the packaged identity icons.

See the [complete icon-pack preparation guide](docs/ICON-PACK.md) for design and export recommendations.

## Privacy and permissions

The manifest requests:

| Permission | Purpose |
| --- | --- |
| `contextMenus` | Add **Search Slate** to the menu when text is selected. |
| `storage` | Keep the hostname and optional custom PNG icon pack on this Chrome installation. |

The extension also calls `chrome.tabs.create` to open the lookup; this does **not** require an extra `tabs` permission. It requests no `host_permissions` and injects no scripts into webpages.

The existing `web_accessible_resources` declaration exposes the four **bundled icon files** to webpages matching `<all_urls>`; that declaration does not grant the extension broad page-reading privileges. It is retained for compatibility with the previous release.

**Selected text:** When you explicitly invoke **Search Slate**, the extension receives that selection, trims and URL-encodes it, then opens the Slate destination. The query appears in the new tab's URL fragment and may be visible in the address bar or browser history. URL encoding is **not encryption**. The Slate application controls how the query is subsequently processed.

**Saved preferences:** Only `slateHostname` and `iconPack` are stored locally. The supplied code has no analytics, query-history database, external JavaScript dependencies, direct HTTP client calls, or credential management. Chrome normally clears this local extension storage when the extension is removed.

## Troubleshooting

| Symptom | Suggested action |
| --- | --- |
| **Search Slate** is absent | Highlight text, enable the extension, and try a regular webpage. Reload in `chrome://extensions` if needed. |
| Chrome cannot load the extension | Select the directory containing `manifest.json`; extract the ZIP first. |
| Slate asks for sign-in | Authenticate using your authorized Slate account. |
| Hostname is rejected | Enter a hostname like `admission.ic.edu` without a scheme, path, port, or spaces. |
| A different hostname opens the wrong lookup | The base GUID is still the original one; the alternate host may not contain that lookup. |
| Icon pack is rejected | Select four **PNG** files together at exactly 16/32/48/128 square pixels, each no larger than 256 KB. |
| Toolbar icon did not change | Click **Save settings**, inspect errors, and reload the extension. Only the toolbar icon is user-configurable. |
| Pack works until Chrome restarts | The worker attempts to reapply it on startup; check its Errors panel if that fails. |
| Settings page shows an error | Open Developer Tools on the settings page; the background service worker may also show an error. |
| Want original settings | Choose **Use original** for the hostname and/or **Restore original icons**, then save. |

## Source layout

```text
search-slate/
├── manifest.json            v1.1.0 permissions and options-page registration
├── background.js            Search, hostname lookup, icon restoration
├── options.html             Configuration interface
├── options.css              Responsive settings-page design
├── options.js               Validation, PNG previews, local persistence
├── icons/
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
├── README.md
├── CHANGELOG.md
└── docs/
    ├── DEVELOPMENT.md      Architecture and testing
    └── ICON-PACK.md        PNG dimensions and preparation guide
```

The four original packaged icons are unchanged. The manifest version, service worker, settings UI, and documentation have been updated for v1.1.0.

## Development and verification

This is a dependency-free extension. Edit source directly and use **Reload** from `chrome://extensions` after changing the manifest or background service worker.

See [Development and testing](docs/DEVELOPMENT.md) for implementation details and the manual browser acceptance checklist.

Static validation and simulated Chrome API tests were performed for hostname handling, v1.0 URL parity, icon pack processing, settings save/reset, and rollback. **A live authenticated Chrome/Slate installation was not exercised as part of publication.**

## License and distribution

This source is published on GitHub for manual installation. No explicit software license has been selected for the repository, and the extension has not been submitted to the Chrome Web Store.

## References

- [Chrome: Load an unpacked extension](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked)
- [Chrome: Action/toolbar icons](https://developer.chrome.com/docs/extensions/reference/api/action)
- [Chrome: Storage API](https://developer.chrome.com/docs/extensions/reference/api/storage)
- [Chrome: Context menus API](https://developer.chrome.com/docs/extensions/reference/api/contextMenus)
