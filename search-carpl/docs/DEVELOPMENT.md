# Development and testing

Technical notes for **Search CarPL v1.0**, a single-purpose Google Chrome Manifest V3 extension.

## Architecture

The extension consists of `manifest.json`, one background service worker (`background.js`), and four PNG icons. It has no popup, options page, content script, storage, external libraries, or build system.

### Context-menu registration

When the extension is installed or updated, the `chrome.runtime.onInstalled` listener registers:

| Property | Value |
| --- | --- |
| Menu ID | `search-carpl` |
| Menu label | **Search CarPL** |
| Context | `selection` |

The command is shown when Chrome supplies a text-selection context.

### Search execution

When `chrome.contextMenus.onClicked` fires:

1. Require `info.menuItemId === "search-carpl"` and a truthy `info.selectionText`.
2. Apply `trim()` to remove surrounding whitespace.
3. Apply `encodeURIComponent()` to safely place the text in a URL.
4. Replace the first literal `Z` in `URL_TEMPLATE` with the encoded query.
5. Open the resulting catalog address using `chrome.tabs.create({ url: targetUrl })`.

For example, the selected phrase `A Tale of Two Cities` becomes `A%20Tale%20of%20Two%20Cities` in the URL's `lookfor` parameter. Characters such as `&` are escaped so they do not accidentally create additional query parameters.

The search term travels as a URL **query parameter**, not as a private message; it can appear in the address bar and server-side request logs.

## Fixed destination

The version 1.0 `URL_TEMPLATE` targets:

```text
https://carp.illshareit.com/Union/Search
```

Its query settings are `view=list`, `showCovers=on`, `searchIndex=Keyword`, and `searchSource=local`. The `lookfor` parameter receives the selection.

This is a specific catalog integration, not a browser-wide catalog discovery system. The app does not check whether the configured endpoint is current or whether the catalog has changed its search parameter names. The source ZIP was created before this GitHub publication; the endpoint was preserved without modification.

### Updating the catalog target

For a future version:

1. Obtain the current official catalog search URL.
2. Run a search manually and inspect the destination's supported query parameters.
3. Update `URL_TEMPLATE` in `background.js` and put the literal `Z` where the selected search phrase should go.
4. Retain `encodeURIComponent(info.selectionText.trim())` when inserting a query value.
5. Reload the extension in `chrome://extensions`.
6. Test multi-word titles, ampersands, punctuation, and a catalog search with no results.

If the catalog switches to form submissions, client-side state, or a different search mechanism, a simple URL-template substitution may no longer be sufficient.

## Manifest and permissions

| Manifest field | Description |
| --- | --- |
| `manifest_version: 3` | Chrome's Manifest V3 format |
| `name: "Search CarPL"` | Display name |
| `version: "1.0"` | Supplied extension version |
| `permissions: ["contextMenus"]` | Right-click menu capability |
| `background.service_worker` | `background.js` |
| `action.default_icon` | 16/32/48/128 pixel icons |
| `icons` | Same PNG sizes for extension identity |
| `web_accessible_resources` | `icons/*` made available to `<all_urls>` |

Creating a tab with `chrome.tabs.create` does not itself require the `tabs` permission. No `host_permissions` are declared, and the extension does not inject code into webpages.

The web-accessible resource declaration covers icons broadly. This is preserved to keep the published source identical to the supplied archive; a future version may be able to narrow or remove the declaration after testing.

## Original source map

| File | Purpose |
| --- | --- |
| `manifest.json` | Metadata, background entrypoint, icon declaration, permissions |
| `background.js` | Menu registration, selection handling, catalog URL construction |
| `icons/icon16.png` | 16×16 PNG |
| `icons/icon32.png` | 32×32 PNG |
| `icons/icon48.png` | 48×48 PNG |
| `icons/icon128.png` | 128×128 PNG |

## Local development

1. Clone/download the repository.
2. Load the `search-carpl` folder via `chrome://extensions` → **Developer mode** → **Load unpacked**.
3. Edit `background.js` or the manifest directly; no build step is required.
4. Select **Reload** on the extension card after modifying the service worker or manifest.
5. Inspect the service worker from its extension card or review **Errors** if it fails.

With Node.js installed, the background script can be syntax-checked:

```bash
node --check background.js
```

A successful syntax check does not confirm catalog availability or proper operation within Chrome.

## Manual acceptance checklist

- [ ] Chrome loads the unpacked extension without manifest errors.
- [ ] The extension shows **Search CarPL** and version **1.0**.
- [ ] Selecting text on a normal webpage shows **Search CarPL** in the right-click menu.
- [ ] Choosing it for a single keyword opens a new catalog tab.
- [ ] Choosing it for a multi-word title populates the keyword search correctly.
- [ ] Ampersands, quotation marks, punctuation, and leading/trailing whitespace do not corrupt the URL.
- [ ] The configured `view=list` and `searchIndex=Keyword` settings are honored by the catalog.
- [ ] The extension does not open a tab when another context-menu action is selected.
- [ ] Chrome restart and extension reload preserve normal operation.
- [ ] All supplied icons display in Chrome's extension interface.
- [ ] The catalog endpoint is live and is still the desired destination.
- [ ] Any screenshots or issue reports avoid exposing sensitive highlighted text or personal data.

### Edge cases

- A whitespace-only selection may produce an empty query because the event checks the original selection before trimming.
- An unavailable catalog endpoint opens an error or failed-loading tab; the extension does not contain destination health checks.
- No browser UI exists for changing the URL, so customization currently requires editing code.
- URL encoding is for syntactic correctness, **not** privacy or encryption.

## Initial publication checks

| Check | Result |
| --- | --- |
| `search_carpl.zip` integrity (`unzip -t`) | Passed |
| Manifest parsed, all referenced source/icon files present | Passed |
| `background.js` parsed with `node --check` | Passed |
| PNG dimensions | 16×16, 32×32, 48×48, 128×128 |
| Source audit | No credentials, content scripts, storage, analytics, or direct network calls |
| GitHub source fidelity | Original source bytes preserved and Git blob hashes verified |
| Live Chrome or library-catalog test | **Not performed** |

## Future changes to consider

These are suggestions, **not changes included in v1.0**:

- Update or validate the catalog endpoint if the service has migrated.
- Allow a configurable catalog URL/search type from an options page.
- Limit or remove the broad web-accessible icon declaration if unnecessary.
- Handle empty selections and tab-navigation errors explicitly.
- Add automated tests for safe URL construction and placeholder replacement.

## Official Chrome references

- [Context menus](https://developer.chrome.com/docs/extensions/reference/api/contextMenus)
- [Tabs API](https://developer.chrome.com/docs/extensions/reference/api/tabs)
- [Manifest V3 service workers](https://developer.chrome.com/docs/extensions/develop/concepts/service-workers)
- [Web-accessible resources](https://developer.chrome.com/docs/extensions/reference/manifest/web-accessible-resources)
