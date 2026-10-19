# Development and testing

Technical notes for **Read Selection Aloud v1.2.0**, a Chrome Manifest V3 extension. The original application logic and icons were preserved from the provided ZIP archive; source files later received copyright and MPL 2.0 notices without functional changes.

## Architecture

The extension has two primary execution contexts:

1. **Background service worker** (`service-worker.js`): registers the selection-only context menu on installation/update; receives context-menu clicks; retrieves saved speech preferences; stops any currently speaking text; and invokes Chrome TTS.
2. **Options page** (`options.html`, `options.css`, `options.js`): loads saved preferences, obtains available voices, updates UI labels, previews a sample phrase, and saves changes to local extension storage.

The two contexts communicate indirectly through `chrome.storage.local`; there is no message-passing layer or content script.

### Selected-text playback

1. Chrome supplies a context-menu event with `menuItemId` and `selectionText`.
2. The service worker ignores clicks for other menu IDs and empty text.
3. `chrome.storage.local.get(DEFAULT_SETTINGS)` supplies the saved preferences, falling back to defaults.
4. `rate`, `pitch`, and `volume` are converted to numbers and clamped to safe bounds.
5. If `voiceName` is nonempty, it is passed to `chrome.tts.speak`.
6. `chrome.tts.stop()` interrupts existing speech before the new selection is spoken.
7. The speech call's rejected promise, if any, is logged to the service-worker console.

### Settings and preview

On page initialization, `options.js` reads preferences and calls `chrome.tts.getVoices()`. Voices are sorted by language/name and labeled with language and Chrome's reported remote/on-device indicator. A previously saved but currently unavailable named voice remains visible as an unavailable option.

The range controls display their live values. **Preview** stops existing speech and speaks a fixed sample with *unsaved* values from the form. **Save settings** writes `voiceName`, `rate`, `pitch`, and `volume` through `chrome.storage.local.set` and briefly shows a status message.

### Stored data

| Key | Type | Default | Purpose |
| --- | --- | --- | --- |
| `voiceName` | string | `""` | Empty string selects Chrome's default voice. |
| `rate` | number | `1` | Speaking rate, clamped to 0.5–2.0 for playback. |
| `pitch` | number | `1` | Pitch, clamped to 0–2 for playback. |
| `volume` | number | `1` | Volume, clamped to 0–1 for playback. |

The options UI constrains these ranges using HTML sliders. The background worker additionally clamps stored values when reading them.

## Manifest and permissions

`manifest.json` sets `manifest_version` to `3`, identifies `service-worker.js` as the background service worker, declares `options.html` as the options page, and provides action icons. The toolbar action opens the options page through `chrome.runtime.openOptionsPage()`.

Requested permissions:

- `contextMenus` — selection-only context menu
- `tts` — speech synthesis and voice discovery
- `storage` — local preference persistence

No `host_permissions`, content scripts, remote dependencies, build tools, or web-accessible resources are declared.

## Source file map

| File | Main responsibility |
| --- | --- |
| `manifest.json` | Identity, version, permissions, entrypoints, icons |
| `service-worker.js` | Installation listener, menu handling, TTS playback, clamping |
| `options.html` | Semantic settings form and accessibility labels/status |
| `options.css` | Responsive visual styles, focus indicators, color-scheme support |
| `options.js` | Voice choice, UI readouts, preview, storage |
| `icons/icon-*.png` | 16, 32, 48, and 128 pixel branding images |

## Development workflow

1. Clone or download the repository and locate this `read-selection-aloud` folder.
2. Use `chrome://extensions` → **Developer mode** → **Load unpacked**.
3. Edit source directly; there is no build step.
4. Select **Reload** on the extension's card when changing the manifest or service worker. Refresh the options page after editing its files.
5. Inspect errors from the extension card or the service worker's Developer Tools.

### Static syntax checks

From this directory, with Node.js available:

```bash
node --check service-worker.js
node --check options.js
```

These are syntax checks, **not** full Chrome runtime tests.

### Suggested manual test checklist

- [ ] Chrome loads the unpacked folder without manifest errors and shows version **1.2.0**.
- [ ] A context-menu entry labeled **Read selection aloud** appears when text is selected.
- [ ] No selection-only entry is offered when no text is selected, where Chrome supports this distinction.
- [ ] Selecting a short word and a multi-sentence passage each triggers speech.
- [ ] Starting a second selection stops the previous playback.
- [ ] Clicking the extension toolbar icon opens the settings page.
- [ ] Voice list includes **Chrome default**, and any available named voices show useful labels.
- [ ] Speed controls span 0.5×–2.0×; pitch spans 0–2; volume spans 0%–100%.
- [ ] **Preview** uses the current controls without requiring a save.
- [ ] Changing controls and choosing **Save settings** persists values after closing/reopening settings and restarting Chrome.
- [ ] A saved, now-unavailable voice can be replaced with **Chrome default**.
- [ ] Audio playback, online voices (if used), and restricted-page behavior are tested in the intended environment.
- [ ] No unexpected network requests appear in extension-owned code/console; note that remote TTS engines may use network resources outside the extension.

### Initial release validation record

Checks performed on the supplied archive before first GitHub publication:

| Check | Result |
| --- | --- |
| ZIP integrity (`unzip -t`) | Passed for all nine supplied files |
| Manifest JSON and referenced entrypoint/icon paths | Present and structurally valid |
| JavaScript syntax (`node --check`) | Passed for both JavaScript files |
| PNG headers / dimensions | 16×16, 32×32, 48×48, 128×128 as declared |
| Source review | No hardcoded credentials, direct network calls, or host permissions found |
| Interactive browser playback test | **Not performed** in this publishing environment |

## Constraints and enhancement ideas

These are observations about **v1.2.0**, not promised features:

- No dedicated pause, resume, or stop UI; initiating another reading calls `chrome.tts.stop()`.
- No keyboard shortcut or full-page reading mode.
- No automatic language detection or per-site voice selection.
- No speech history or persistent transcript.
- TTS behavior and voice availability vary by Chrome platform, operating system, and installed speech engines.
- Errors during settings load/save are not surfaced with dedicated recovery UI; runtime errors may need Developer Tools for diagnosis.
- There is no automated unit-test suite or CI workflow in this initial release.

## Helpful Chrome documentation

- [Manifest V3](https://developer.chrome.com/docs/extensions/develop/migrate/what-is-mv3)
- [Extension service workers](https://developer.chrome.com/docs/extensions/develop/concepts/service-workers)
- [Text-to-speech API](https://developer.chrome.com/docs/extensions/reference/api/tts)
- [Local extension storage](https://developer.chrome.com/docs/extensions/reference/api/storage)
- [Context menus API](https://developer.chrome.com/docs/extensions/reference/api/contextMenus)
