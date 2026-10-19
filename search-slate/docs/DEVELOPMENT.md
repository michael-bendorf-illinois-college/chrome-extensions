# Development and testing

Implementation notes for **Slate Context Search v1.0** / **Search Slate**, the Illinois College-specific Chrome extension.

## How it works

The extension uses a single Manifest V3 background service worker, `background.js`.

### Registration

When Chrome installs or updates the extension, the `chrome.runtime.onInstalled` listener registers a context-menu item with:

- ID: `search-slate`
- Label: **Search Slate**
- Context: `selection`

The item is intended to appear when the user has selected text. There is no persistent background page, popup interface, options page, or content script.

### Search event

When Chrome dispatches `chrome.contextMenus.onClicked`:

1. Check that `info.menuItemId` equals `search-slate` and that `info.selectionText` is present.
2. Remove leading/trailing whitespace using `trim()`.
3. Convert the query to URL-safe form with `encodeURIComponent()`.
4. Replace the first `X` placeholder in the hardcoded `URL_TEMPLATE`.
5. Call `chrome.tabs.create({ url: targetUrl })` to navigate in a new tab.

The current template routes to the Illinois College Admission Slate host's `/manage/lookup/search` endpoint with a fixed `base` query parameter and encoded JSON-like search state in the URL fragment.

**Do not treat `encodeURIComponent()` as a privacy mechanism.** It protects URL syntax, not the confidentiality of selected names or identifiers.

## Institution-specific configuration

`URL_TEMPLATE` in `background.js` is the only search destination configured in this version. It includes the institution host, route, lookup-base GUID, and serialized search-state pattern. The literal `X` represents the highlighted phrase before replacement.

To adapt this extension:

1. Obtain a working, authorized Slate lookup URL for the intended environment.
2. Confirm the correct host and lookup base.
3. Identify the exact location where that version of Slate expects its search term.
4. Update `URL_TEMPLATE` while preserving the search-state format; retain the intended placeholder.
5. Reload the extension via `chrome://extensions`.
6. Test names, multiple words, punctuation, and any required login/authorization behavior.

Avoid adding credentials, API tokens, or private student information to source code or example URLs. Do not assume the current base GUID or URL structure works in another institution's Slate instance.

### Compatibility caveats

- A Slate search-route or hash-state change may break this integration.
- The configured lookup base may become unavailable or be replaced.
- Search results still depend on normal Slate authentication, lookup permissions, and data availability.
- The code does not use user-configurable settings, site-specific routing, or multiple lookups.
- Replacing the first literal `X` is intentionally simple; changing the template to include more than one placeholder would require revisiting the implementation.
- If the user's selection contains only whitespace, `selectionText` may be truthy before trimming and the extension may open a lookup with an empty query.

## Manifest and API details

| Item | Value / role |
| --- | --- |
| `manifest_version` | `3` |
| `name` | `Slate Context Search` |
| `version` | `1.0` |
| Background | `background.js` as extension service worker |
| Permission | `contextMenus` only |
| Tab navigation | `chrome.tabs.create`; no `tabs` permission needed for creating a new tab |
| Icons | 16, 32, 48, and 128 pixel PNGs |
| `web_accessible_resources` | Only the four icon paths, exposed for `<all_urls>` |

The `web_accessible_resources` declaration is broader than this simple background-only operation obviously needs. It does not supply host permissions, but websites may request those declared icon assets as web-accessible resources. Consider removing or narrowing it in a future tested version if nothing external consumes those resources. The published v1.0 source is **unchanged**.

## Source map

| Path | Responsibility |
| --- | --- |
| `manifest.json` | Declares MV3, extension metadata, permission, service worker, and icons |
| `background.js` | Creates context menu, encodes selection, opens lookup tab |
| `icons/icon16.png` | 16×16 extension icon |
| `icons/icon32.png` | 32×32 extension icon |
| `icons/icon48.png` | 48×48 extension icon |
| `icons/icon128.png` | 128×128 extension icon |

## Local development

1. Download or clone this repository.
2. In Chrome, open `chrome://extensions` and enable **Developer mode**.
3. Choose **Load unpacked** and point it at `search-slate`.
4. Edit `background.js` or `manifest.json` with a text editor.
5. Select **Reload** on the extension card.
6. Open the service worker's inspect link or extension **Errors** panel to diagnose runtime issues.

### Basic syntax check

If Node.js is installed:

```bash
node --check background.js
```

This checks JavaScript parsing only; it does not simulate Chrome APIs or authenticate with Slate.

## Manual acceptance checklist

- [ ] Chrome loads the extension without manifest errors and displays version **1.0**.
- [ ] The context menu shows **Search Slate** when normal webpage text is highlighted.
- [ ] A simple name (e.g. `Jane Smith`) opens a new tab to the configured Slate lookup.
- [ ] Leading/trailing spaces in the selection do not become part of the search phrase.
- [ ] Multiple words and special characters (e.g. `Smith & Jones`) are correctly URL-encoded.
- [ ] An authorized, signed-in Slate user sees the expected lookup.
- [ ] An unauthenticated user is still subject to the normal Slate sign-in flow.
- [ ] The extension does not open an unrelated URL when another context-menu item is clicked.
- [ ] The extension works after Chrome restart and extension reload.
- [ ] The icon displays correctly in Chrome's extension UI.
- [ ] The intended lookup base remains valid and no sensitive data is exposed in screenshots or shared URLs.

## Publication validation record

Checks performed on the supplied `search_slate.zip` before GitHub publication:

| Check | Result |
| --- | --- |
| ZIP integrity (`unzip -t`) | Passed |
| Manifest V3 and referenced file paths | Valid / present |
| Background JavaScript syntax (`node --check`) | Passed |
| Icon dimensions | 16×16, 32×32, 48×48, 128×128 |
| Source review | No embedded credentials, storage, analytics, or direct network requests |
| Institutional destination | Hardcoded Illinois College Admission Slate host and lookup-base identifier |
| Live Chrome/Slate functional test | **Not performed** |

## Future improvements to consider

The following would change behavior or packaging and were **not** part of this faithful source publication:

- Make the Slate URL template configurable through an options page.
- Support multiple lookup bases or environments.
- Remove or minimize unnecessary web-accessible icon declarations.
- Add tests for URL construction and edge cases.
- Add error handling for tab creation failures or unavailable Slate lookup destinations.
- Optionally incorporate keyboard shortcuts or additional query actions.

## Official references

- [Context menus](https://developer.chrome.com/docs/extensions/reference/api/contextMenus)
- [Tabs API](https://developer.chrome.com/docs/extensions/reference/api/tabs)
- [Manifest V3 service workers](https://developer.chrome.com/docs/extensions/develop/concepts/service-workers)
- [Web-accessible resources](https://developer.chrome.com/docs/extensions/reference/manifest/web-accessible-resources)
