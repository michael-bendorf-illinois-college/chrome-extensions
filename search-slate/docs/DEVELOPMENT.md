# Development and testing

Technical guide for **Slate Context Search v1.1.0** (right-click command: **Search Slate**).

## What's new in v1.1.0

Version 1.1.0 preserves the version 1.0 lookup URL path, lookup-base ID, and selected-text search-state structure. It adds:

- A user-editable **hostname**, stored in Chrome local extension storage.
- An options page opened by clicking the toolbar action icon.
- Four-file PNG upload, validation, and preview for a **toolbar** icon pack.
- Toolbar icon restoration on extension installation/update and Chrome profile startup.
- Reset controls and rollback if a custom icon cannot be applied.
- Documentation explaining why user images cannot replace the packaged extension identity icon.

The original `icons/icon*.png` files are unchanged.

## Architecture and event flow

### Background service worker: `background.js`

- On `chrome.runtime.onInstalled`, removes stale context-menu entries, creates the **Search Slate** selection menu, and reapplies saved toolbar icons.
- On `chrome.runtime.onStartup`, reapplies the saved toolbar icon pack.
- On `chrome.action.onClicked`, opens the options page.
- On `chrome.contextMenus.onClicked`, reads the saved hostname (or defaults to `admission.ic.edu`), builds the same Slate lookup as v1.0 with the selected text, and opens a new tab.
- On `chrome.runtime.onMessage` with `type: "apply-icon-pack"`, loads the saved icon pack and calls `chrome.action.setIcon`. Returns an explicit success/error response to the options page.

### Options page: `options.html`, `options.css`, `options.js`

- Loads saved `slateHostname` and `iconPack` values from `chrome.storage.local`.
- Validates and normalizes hostnames before saving.
- Accepts exactly four PNG files and matches each by its actual 16/32/48/128 square-pixel dimensions.
- Previews pending icons without applying them until **Save settings**.
- Saves preferences locally, asks the service worker to apply icons, and rolls back the stored preferences if icon application fails.
- Offers staged **Use original** and **Restore original icons** actions.

### Storage data

| Key | Type | Default | Purpose |
| --- | --- | --- | --- |
| `slateHostname` | string | `"admission.ic.edu"` | Hostname used with HTTPS for new searches |
| `iconPack` | object or null | `null` | Four PNG data URLs indexed by `16`, `32`, `48`, `128`; null means bundled icons |

Storage is local to the Chrome installation and is not automatically synchronized to another computer. It contains no search terms or browser activity history.

## Hostname and URL construction

Input is lowercased and trimmed; validation permits DNS-style ASCII labels separated by dots, including hyphens inside labels. It rejects schemes (`https://`), ports, paths, queries, fragments, whitespace, and invalid empty labels.

`buildSearchUrl` creates a URL from the original v1.0 template, replaces the `hostname` component, and replaces the `X` search marker in its encoded Slate hash state with `encodeURIComponent(selectionText.trim())`.

**The original query structure remains fixed:**

- Route: `/manage/lookup/search`
- Query: `joinable=1` and original fixed `base` GUID
- Hash: encoded Slate search state containing the selected query, page, sort, and filter values

If the stored hostname is corrupt or invalid, the service worker logs a warning and uses the original `admission.ic.edu` to avoid an unintended destination. An alternative institution's Slate host may not provide the original lookup-base ID; v1.1.0 deliberately does not expose that ID as a user setting.

## Icon pack pipeline

The picker accepts **four individual PNG files**, not a ZIP. Validation on the options page checks:

1. Exactly four files were chosen.
2. Each file is between 24 bytes and 256 KB.
3. The PNG magic number is present.
4. Width and height in the PNG header are equal and are one of 16, 32, 48, or 128.
5. The browser can decode the image, and decoded dimensions match the header.
6. There is exactly one file for each required size.

After passing checks, `FileReader` converts each PNG to a `data:image/png;base64,...` value. The pack is saved in `chrome.storage.local`, not sent to a remote service.

In the Manifest V3 service worker, `applySavedIconPack`:

1. Retrieves the saved pack.
2. Decodes and revalidates the PNG bytes and dimensions.
3. Creates `ImageData` using `createImageBitmap` and `OffscreenCanvas` for each size.
4. Calls `chrome.action.setIcon({ imageData })` with the four-image dictionary.
5. Restores the original file paths using `chrome.action.setIcon({ path })` when no custom pack is saved.

Chrome's Action API supports a dictionary of icon sizes and OffscreenCanvas-generated image data in service workers. This sets the **toolbar action image**. Packaged `manifest.icons` cannot be replaced at runtime; they remain the extension's installed identity artwork.

### Why four sizes?

The four resolutions correspond to the bundled extension artwork and provide useful raster sources at different display scales. Chrome chooses the most suitable available image for toolbar display density. The 48 and 128 pixel sources are included to provide a complete conventional icon pack, even though the toolbar is normally displayed near 16 device-independent pixels.

The 256 KB per-file limit keeps a complete four-file pack well inside Chrome's standard local storage quota and limits accidental uploads of enormous images.

## Manifest and permissions

| Feature | Manifest/API |
| --- | --- |
| Manifest V3 | `manifest_version: 3` |
| Release | `version: "1.1.0"` |
| Context-menu item | `contextMenus` |
| Local hostname/icon storage | `storage` |
| Background | `background.js` |
| Settings UI | `options_page: "options.html"` |
| Toolbar action | `action.default_title` and `action.default_icon` |
| Bundled identity artwork | `icons` |
| Existing web-accessible resources | Original four packaged PNGs exposed for `<all_urls>` |

The extension does not request `tabs` or host permissions and does not inject scripts into web pages. It navigates to the configured Slate URL using `chrome.tabs.create`.

The original web-accessible icon declaration is retained to avoid unrelated changes in this release. It could be minimized after testing if not needed.

## Source files

| Path | Purpose |
| --- | --- |
| `manifest.json` | v1.1.0 metadata, permissions, options registration |
| `background.js` | Selection search, hostname validation, custom icon restoration |
| `options.html` | Hostname field, PNG picker, instructions, previews, controls |
| `options.css` | Responsive, keyboard-focusable settings page styles |
| `options.js` | File validation, preview, save/reset, storage rollback |
| `icons/icon*.png` | Original unmodified 16/32/48/128 PNG artwork |
| `README.md` | User guide and privacy/installation details |
| `docs/ICON-PACK.md` | Icon image preparation guide |
| `CHANGELOG.md` | Release history |

## Running and testing

No build step or external packages are required.

1. Download/clone the repository.
2. Visit `chrome://extensions` and enable **Developer mode**.
3. Load `search-slate` as an unpacked extension.
4. Modify source and select **Reload** after changing the worker or manifest.
5. Inspect errors from the extension card, its service worker, or the options-page Developer Tools.

For static parsing with Node.js:

```bash
node --check background.js
node --check options.js
```

### Automated checks performed for v1.1.0

The source was syntax-checked and tested using simulated Chrome APIs:

- Original v1.0 search URL parity across plain text and reserved characters.
- Custom hostname normalization, rejection of invalid hosts, and default fallback.
- Context menu registration and toolbar click behavior.
- Custom PNG pack processing into `ImageData` and reset to packaged paths.
- Options-page load/save, four-file validation, duplicate-size rejection, and previews.
- Reset, validation failure, and rollback when applying icons fails.

**These are code-level simulations, not a live browser end-to-end test.** They do not verify authenticated Slate availability or platform-specific PNG rendering.

### Manual browser acceptance checklist

- [ ] Upgrading an existing unpacked v1.0 install to v1.1.0 preserves the normal search with no saved settings.
- [ ] The right-click **Search Slate** item appears only when text is selected.
- [ ] Default hostname search produces the same URL/results as v1.0.
- [ ] Clicking the toolbar icon opens the configuration page.
- [ ] Entering a valid new hostname, saving, and searching uses that host and HTTPS.
- [ ] Trying a scheme, path, port, whitespace, or malformed hostname shows a validation error and does not save.
- [ ] **Use original** restores `admission.ic.edu` after saving.
- [ ] Selecting four correctly sized PNG files shows previews before saving.
- [ ] The toolbar icon updates after saving a custom pack.
- [ ] Missing, duplicate-sized, oversized, wrong-format, or corrupt images are rejected.
- [ ] **Restore original icons** followed by Save returns to bundled artwork.
- [ ] Saved hostname and toolbar icon work after closing/reopening settings, reloading the extension, and restarting Chrome.
- [ ] The Chrome Extensions management listing retains the original packaged identity icon.
- [ ] Error messages are visible if the background worker cannot apply the icon.
- [ ] A user with proper Slate access sees the intended lookup at the configured hostname.
- [ ] Selected text and test screenshots do not disclose sensitive applicant data.

## Known limits and future work

- The fixed lookup-base GUID is not configurable in v1.1.0.
- The icon picker expects **four separate PNG files**, not a ZIP archive.
- Changing the toolbar icon cannot rewrite `manifest.icons` or make a custom icon appear everywhere Chrome shows the extension's identity.
- No Chrome Web Store packaging, automatic updater, or CI pipeline is included.
- If a future Chrome version changes service-worker image decoding behavior, icon restoration may require adjustment.
- Invalid hostname values placed directly in storage are ignored in favor of the default host.
- Further improvements might include multi-institution lookup configuration or an export/import settings facility.

## Official references

- [Chrome Action API](https://developer.chrome.com/docs/extensions/reference/api/action)
- [Chrome Storage API](https://developer.chrome.com/docs/extensions/reference/api/storage)
- [Chrome service workers](https://developer.chrome.com/docs/extensions/develop/concepts/service-workers)
- [Chrome context menus](https://developer.chrome.com/docs/extensions/reference/api/contextMenus)
