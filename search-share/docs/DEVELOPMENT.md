# Search SHARE — development guide (v1.1.0)

## Purpose

Manifest V3 extension providing a single selected-text context-menu command, directed to the user's chosen SHARE member library catalog. This is the successor to the original single-library extension; its old code remains in Git history.

No content scripts, bundler, API key, third-party package, or external configuration service is needed.

## Components

| File | Responsibility |
| --- | --- |
| `manifest.json` | MV3 metadata; `contextMenus` and `storage` permissions, icon, options page. |
| `config.js` | Shared default, validation, storage key, and URL construction. |
| `background.js` | Selection context menu, toolbar settings button, persisted setting read, new tab. |
| `options.html` | Accessible form, SHARE explanation, official locator procedure. |
| `options.css` | Responsive, light/dark-aware settings card and visible focus states. |
| `options.js` | Preference load/save/reset, validation, live preview, error feedback. |
| `icons/*.png` | The existing generic purple-book icons in four Chrome-required sizes. |
| `tests/verify.js` | Dependency-free Node regression tests and Chrome API mocks. |

The service worker loads `config.js` through `importScripts("config.js")`, while the settings page loads it via a classic `<script>` tag before `options.js`. If changing to ES modules, update both loading strategies and tests.

## Stored preference

- Area: `chrome.storage.local`.
- Key: `shareSubdomain`.
- Value: a trimmed lowercase **single DNS hostname label** (1–63 characters).
- Default: `carp`, the original Carlinville Public Library shortcut.
- Validation expression: `/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/`.
- The settings page rejects invalid entries.
- The service worker falls back to the default if the saved value is missing/invalid or storage fails.

The fixed suffix `illshareit.com` is never editable. This prevents arbitrary domains, protocols, ports, paths, and query strings from being stored as search destinations. No selected text or history is persisted.

## Search URL

```text
https://{subdomain}.illshareit.com/Union/Search?view=list&showCovers=on&lookfor={encodedSelection}&searchIndex=Keyword&searchSource=local
```

`encodeURIComponent(String(selectedText).trim())` is used on the selected phrase only. The path, query parameter order, and encoding match v1.0 when the default `carp` shortcut is used.

**Do not change fixed catalog query parameters casually.** Their semantics and continued support are controlled by the external SHARE catalog. In particular, `searchSource=local` is preserved for backward compatibility.

## Chrome event flow

1. Install/update event registers menu ID `search-share` for the `selection` context.
2. Toolbar icon click calls `chrome.runtime.openOptionsPage()`.
3. Settings loads a stored label or uses `carp`. Reset fills the default but does not save until the user chooses **Save settings**.
4. On matching context-menu click with nonempty selected text, the worker loads the saved subdomain and opens one catalog tab via `chrome.tabs.create`.
5. Missing/invalid data, storage failure, and empty selection are handled gracefully.

The extension does not need host permissions or the broad `tabs` permission to open a URL. Its former icon `web_accessible_resources` declaration was redundant and has been removed. The PNG icons remain accessible from the extension's own options page.

## Local test workflow

1. Load `search-share` unpacked from `chrome://extensions`.
2. Run `node tests/verify.js` (Node 18+ recommended) with no package install.
3. Reload the extension from Chrome's extensions page after changing files.
4. Follow [TESTING.md](TESTING.md), including the live locator and catalog checks.
5. When releasing, bump the manifest version and update `CHANGELOG.md`, this guide, and `README.md`.

### Transition from v1.0

The current repository tree replaces `search-carpl/` with `search-share/`. Files remain in Git history, not in two parallel current folders. Chrome may see the new unpacked path as a different extension identity: disable/remove the old install before loading the renamed folder to avoid two menus.

## Privacy and maintenance

Only selected text from an explicit user command is sent via a URL to the member catalog. URL encoding is not encryption: the target operator and browser history can record search phrases. The only saved preference is the shortcut label.

This extension is licensed under [MPL 2.0](../LICENSE), Copyright © 2026 Michael Bendorf. External SHARE pages and catalog systems are administered independently.

## References

- [Official SHARE About](https://share.illinoisheartland.org/about)
- [Official SHARE Library Locator](https://www.illshareit.com/)
- [Chrome MV3](https://developer.chrome.com/docs/extensions/develop/migrate/what-is-mv3)
- [Chrome Storage API](https://developer.chrome.com/docs/extensions/reference/api/storage)
- [Chrome Context menus API](https://developer.chrome.com/docs/extensions/reference/api/contextMenus)
