# Read Selection Aloud

A lightweight Google Chrome extension that reads highlighted text aloud from the right-click context menu. It uses Chrome's built-in text-to-speech (TTS) interface and provides a simple settings page for choosing a voice, speaking speed, pitch, and volume.

**Version:** 1.2.0 · **Platform:** Google Chrome · **Extension format:** Manifest V3 · **Dependencies:** None

> This is the source-code release for manual installation. It is not currently a Chrome Web Store listing.

## Features

- **Read highlighted text:** Select a word, sentence, or passage, right-click, and choose **Read selection aloud**.
- **Choose a preferred voice:** Use Chrome's default voice or select from available voices reported by your browser. The list displays the language and whether Chrome reports a voice as online or on-device.
- **Tune the sound:** Control speed, pitch, and volume separately.
- **Preview before saving:** Hear a sample sentence using the currently selected options.
- **Remember preferences:** Save settings locally on that Chrome installation.
- **Quick access:** Clicking the extension's toolbar icon opens its settings page.
- **Interrupt the previous reading:** Starting a new selection stops the current TTS playback first.

No webpage content script, account, server, or external JavaScript package is required.

## Install from GitHub

Chrome installs this project as an **unpacked extension**:

1. On GitHub, select **Code → Download ZIP** for the repository, or download the project source another way.
2. Extract the downloaded ZIP to a **permanent folder** on your computer.
3. Locate the **`read-selection-aloud`** subfolder. The folder you select must contain `manifest.json` directly; do not choose the overall `chrome-extensions` repository folder.
4. In Chrome, open `chrome://extensions`.
5. Enable **Developer mode** using the switch in the upper-right corner.
6. Select **Load unpacked** and choose the extracted `read-selection-aloud` folder.
7. Look for **Read Selection Aloud** in your extensions list. Optionally pin it using Chrome's Extensions (puzzle-piece) menu.

You can also extract the original source ZIP, if you have it, and load its folder containing `manifest.json`. Chrome's **Load unpacked** option expects a folder, not a ZIP file.

**Important:** Keep the extracted folder in place. If you move or delete it, Chrome may no longer be able to load the extension.

Chrome's official [unpacked-extension instructions](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked) provide additional help.

## How to use

1. Open a regular webpage containing text.
2. Highlight the text you want to hear.
3. Right-click the selection.
4. Choose **Read selection aloud**.
5. Chrome speaks the selected text using your saved settings.

The context-menu item appears for a selection; it does not read an entire page automatically. Some Chrome-internal or otherwise restricted pages may not support extension actions.

**To start a different passage:** Highlight it and choose **Read selection aloud** again. This stops the previous reading before starting the new selection.

**To open settings:** Click the extension's toolbar icon, or open its **Details → Extension options** from `chrome://extensions`.

## Settings

| Setting | Default | Supported range | Notes |
| --- | --- | --- | --- |
| Preferred voice | Chrome default | Available Chrome TTS voices | Available choices differ by operating system and installed speech engines. |
| Speed | 1.0× | 0.5×–2.0× | Smaller numbers read more slowly. |
| Pitch | 1.0 | 0.0–2.0 | Voice engines may interpret pitch changes differently. |
| Volume | 100% | 0%–100% | Controls TTS volume, in addition to system audio volume. |

On the settings page:

1. Choose a voice and adjust the sliders.
2. Select **Preview** to hear the sample sentence with the current controls.
3. Select **Save settings** to persist your choices.

**Preview does not save settings.** New selections use the last saved settings until you click **Save settings**.

If a previously selected voice is no longer reported by Chrome, the settings page displays it as **currently unavailable**. Choose another voice (or **Chrome default**) and save.

### About online voices

Chrome marks some voices as **online** when the synthesis engine is a remote network resource. Choosing such a voice may send spoken text to that engine and may require network connectivity. For sensitive material, prefer a voice marked **on device** and review your browser/operating-system speech settings. The extension itself makes no direct network requests.

## Permissions and privacy

This extension requests exactly these Chrome permissions:

| Permission | Why it is needed |
| --- | --- |
| `contextMenus` | Add **Read selection aloud** to the right-click menu when text is selected. |
| `tts` | Ask Chrome's speech engine to speak text and list available voices. |
| `storage` | Store the preferred voice, speed, pitch, and volume through `chrome.storage.local`. |

**What the supplied code does:**

- Receives selected text only when you invoke its context-menu item, then passes that text to `chrome.tts.speak`.
- Stores only the four speech preferences listed above, locally within Chrome.
- Contains no analytics, advertisements, tracking, direct HTTP requests, content scripts, or user-account integration.
- Does not maintain a history or log of selected text.
- Does not request broad site access or host permissions.

**Important privacy limitation:** Speech synthesis is provided by Chrome, your operating system, or another installed speech engine. A remote voice may process selected text outside your device. This repository does not control the privacy practices of those engines.

Preferences use `chrome.storage.local` rather than Chrome's synchronized extension storage. Removing the extension ordinarily clears its local extension storage.

## Troubleshooting

| Problem | What to try |
| --- | --- |
| **Read selection aloud** is missing | Highlight text first; confirm the extension is enabled at `chrome://extensions`; reload the extension. Chrome-internal pages can restrict extensions. |
| No sound | Check system and browser audio, raise the extension's volume, select **Chrome default**, and try **Preview**. |
| A named voice fails | The voice may have been removed or is unavailable. Reopen settings, choose a currently listed voice or **Chrome default**, and save. |
| Settings seem not to apply | Select **Save settings** after previewing; your next selection uses the saved values. |
| Playback sounds unnatural | Try a different voice and return speed/pitch to 1.0. Speech engines vary in how they handle these controls. |
| Extension cannot be loaded | Select the folder containing `manifest.json`, not the ZIP file or parent repository folder. Check the **Errors** button in `chrome://extensions`. |
| Extension stops working after moving files | Put the unpacked source back at its original location, or remove and load the extension from the new folder. |

For service-worker errors: open `chrome://extensions`, find the extension, and inspect the **service worker** link or the **Errors** button. For settings-page errors, open Developer Tools on the options page.

## Project contents

```text
read-selection-aloud/
├── manifest.json         Chrome Manifest V3 metadata and permissions
├── service-worker.js     Context-menu registration and TTS playback
├── options.html          Settings page markup
├── options.css           Settings page styling
├── options.js            Voice list, preview, persistence, and controls
├── icons/
│   ├── icon-16.png
│   ├── icon-32.png
│   ├── icon-48.png
│   └── icon-128.png
├── README.md             Installation, usage, privacy, and troubleshooting
├── CHANGELOG.md          Publication history
└── docs/
    └── DEVELOPMENT.md   Implementation notes and manual test checklist
```

The application behavior and four bundled icons match the supplied **Read Selection Aloud v1.2** archive; the only later source changes are license/copyright comments.

## Development and verification

This is a dependency-free extension: no build, package manager, compilation, or external API key is necessary. Make changes directly to the project files, then use **Reload** on its card in `chrome://extensions`.

See [Development and testing](docs/DEVELOPMENT.md) for the event flow, configuration details, validation already performed, and a repeatable manual test plan.

The supplied v1.2.0 archive was checked for integrity, required manifest references, icon dimensions, and JavaScript syntax. **It has not been tested interactively inside a live Chrome browser in this publication workflow**; please perform the manual checks after installing.

## Distribution and license

This source is publicly hosted on GitHub for visibility and manual installation. It has not been submitted to the Chrome Web Store.

The source code and original included icon artwork are released under the [Mozilla Public License 2.0](LICENSE) (MPL-2.0). **Copyright © 2026 Michael Bendorf.** When distributing modified covered files, make their source code available under MPL 2.0 and retain required notices. Internal-only modifications need not be shared, but contributions are warmly encouraged. See the [repository license overview](../README.md#license-attribution-and-status).

## Reference

- [Chrome Extensions: Load an unpacked extension](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked)
- [Chrome `tts` API](https://developer.chrome.com/docs/extensions/reference/api/tts)
- [Chrome `storage` API](https://developer.chrome.com/docs/extensions/reference/api/storage)
- [Chrome `contextMenus` API](https://developer.chrome.com/docs/extensions/reference/api/contextMenus)
