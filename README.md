# Chrome Extensions

A small collection of independent **Google Chrome Manifest V3 extensions** that make selected text more useful. Highlight text on a webpage, right-click, and choose an action to **hear it read aloud**, **look it up in Slate**, or **search a SHARE member library catalog**.

Each extension is self-contained, can be installed separately, and includes its own installation, configuration, privacy, and development documentation.

> **Distribution:** These are public **source-code releases** for manual installation with Chrome's **Load unpacked** feature. They are **not Chrome Web Store listings**. The repository is licensed under [Mozilla Public License 2.0](LICENSE).

## Extensions at a glance

| Extension | Version | Right-click action | Configuration | Project |
| --- | --- | --- | --- | --- |
| **Read Selection Aloud** | **1.2.0** | **Read selection aloud** — speak highlighted text using Chrome's text-to-speech support | Voice, rate, pitch, and volume | [Open project](read-selection-aloud/) |
| **Search Slate** | **1.1.0** | **Search Slate** — look up selected text in a Slate CRM destination | Slate hostname and a custom four-image PNG toolbar icon pack | [Open project](search-slate/) |
| **Search SHARE** | **1.1.0** | **Search SHARE** — run a keyword search for highlighted text in a SHARE library catalog | SHARE member library shortcut subdomain | [Open project](search-share/) |

All versions above refer to the actual `manifest.json` versions published in this repository.

### Read Selection Aloud

**Listen to highlighted text** without copying it to another app.

- Uses Chrome's built-in text-to-speech API.
- Select a preferred voice and adjust speaking speed, pitch, and volume.
- Preview speech on the settings page; clicking the extension's toolbar icon opens those settings.
- The selected text goes to Chrome's speech service when you use the context-menu command. Some installed voices can use online speech services.

**Details:** [README](read-selection-aloud/README.md) · [Development guide](read-selection-aloud/docs/DEVELOPMENT.md) · [Changelog](read-selection-aloud/CHANGELOG.md)

### Search Slate

**Search a Slate CRM lookup** using a name or phrase selected on a webpage.

- Configurable HTTPS **hostname**; the original default is `admission.ic.edu`.
- Retains the original lookup path and search format while allowing a different Slate host.
- Optional custom **PNG toolbar icon pack**: four separate square images of **16×16, 32×32, 48×48, and 128×128 pixels**, at most **256 KB each**.
- The right-click command is **Search Slate**; Chrome lists the extension as **Slate Context Search**.

**Details:** [README](search-slate/README.md) · [Icon pack guide](search-slate/docs/ICON-PACK.md) · [Development guide](search-slate/docs/DEVELOPMENT.md) · [Changelog](search-slate/CHANGELOG.md)

### Search SHARE

**Search a member library's SHARE catalog** without retyping selected text.

- **SHARE** means *Sharing Heartland's Available Resources Equally*, the Illinois Heartland Library System's shared library-catalog consortium.
- Configure just the member library's shortcut subdomain; the extension builds a secure `https://{subdomain}.illshareit.com` catalog destination.
- The default is `carp`, the original Carlinville Public Library shortcut; another member's shortcut can be selected in Settings.
- Find the correct value on the official [SHARE Library Locator](https://www.illshareit.com/): search a town, choose a location, and read the shortcut URL displayed under your library.

For example, if the locator shows `blca.illshareit.com`, enter **`blca`** in settings—not the full address.

**Details:** [README](search-share/README.md) · [Library shortcut guide](search-share/docs/SHARE-LIBRARY-LOCATOR.md) · [Manual test checklist](search-share/docs/TESTING.md) · [Development guide](search-share/docs/DEVELOPMENT.md) · [Changelog](search-share/CHANGELOG.md)

## Install an extension in Chrome

These projects are distributed as source, not as installable Chrome Web Store packages.

1. Choose **Code → Download ZIP** on this repository, or clone it using Git.
2. Extract the repository to a folder you intend to keep. A clone needs no extraction.
3. Open **`chrome://extensions`** in Google Chrome.
4. Enable **Developer mode**.
5. Choose **Load unpacked**.
6. Select the **specific extension subfolder** you want, such as `read-selection-aloud`, `search-slate`, or `search-share`. The selected folder must contain its own `manifest.json` directly.
7. Confirm the extension appears and is enabled. Repeat for any other extensions you want.

**Important:** Do not select the top-level `chrome-extensions` repository folder or an unopened ZIP file. Keep the unpacked source directory in place; moving or deleting it can disrupt the installation.

See [Chrome's official instructions for loading an unpacked extension](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked).

## First use and settings

1. Open a regular webpage that contains selectable text.
2. Highlight a word, title, name, or phrase.
3. Right-click the selection and choose the appropriate menu command:
   - **Read selection aloud**
   - **Search Slate**
   - **Search SHARE**
4. For preferences, click the extension's toolbar icon or open **`chrome://extensions` → Details → Extension options**.

Chrome-controlled pages and some other restricted surfaces do not support extension context-menu actions.

Each extension maintains its **own** preferences. They do not share configuration or require a common service.

## Updates and migration

Because these are **unpacked** extensions, they do not update automatically through the Chrome Web Store.

- To update an existing installation, replace/update the source files **in the same installed directory** and click **Reload** for that extension at `chrome://extensions`.
- **Search SHARE** was renamed from the earlier `search-carpl` folder in v1.1.0. If you previously loaded the old folder, disable/remove that installation and load the new `search-share` folder to prevent duplicate context-menu entries. Earlier code remains accessible in Git history.
- Consult each project's changelog and README before upgrading; the project folder and installed extension identity can matter for locally stored preferences.

## Privacy and permissions

All three extensions add a context-menu action for **text you explicitly select**. They do not install content scripts to continuously inspect pages.

| Permission / behavior | Read Selection Aloud | Search Slate | Search SHARE |
| --- | --- | --- | --- |
| `contextMenus` | Selected-text speech command | Selected-text CRM lookup | Selected-text catalog lookup |
| `storage` | Local voice and speech preferences | Local hostname and optional custom icon pack | Local library subdomain |
| `tts` | Uses Chrome's text-to-speech API | Not requested | Not requested |
| Result | Passes selected text to Chrome's speech engine | Opens an external Slate URL with the query | Opens an external SHARE catalog URL with the query |

**Be mindful of selected text.** Search Slate and Search SHARE include your chosen words in a destination URL; those words can appear in browser history and be visible to the target service. Read Selection Aloud uses Chrome's speech support; online voices may process text remotely. Avoid using any of these commands on confidential information.

No extension here includes advertising or analytics code, and none requires you to enter a password or API key into its settings. For detailed permission explanations, see the individual READMEs.

## Repository structure

```text
chrome-extensions/
├── README.md                  This overview
├── read-selection-aloud/       Speech extension v1.2.0
│   ├── manifest.json
│   ├── README.md
│   ├── CHANGELOG.md
│   └── docs/DEVELOPMENT.md
├── search-slate/               Slate search extension v1.1.0
│   ├── manifest.json
│   ├── README.md
│   ├── CHANGELOG.md
│   └── docs/ICON-PACK.md
└── search-share/               SHARE library search extension v1.1.0
    ├── manifest.json
    ├── README.md
    ├── CHANGELOG.md
    ├── docs/SHARE-LIBRARY-LOCATOR.md
    ├── docs/TESTING.md
    └── tests/verify.js
```

The tree above highlights entry points and documentation; extension folders also contain their JavaScript, settings pages, icons, and other source files.

## Development and verification

- All projects use **Chrome Manifest V3** and plain JavaScript, HTML, and CSS; **no build or package installation** is required for basic source changes.
- After editing an unpacked project, use **Reload** at `chrome://extensions`.
- **Search SHARE** includes automated Node-based smoke/regression tests: run `node tests/verify.js` from its folder. They use mocked Chrome APIs and do not require external dependencies.
- **Read Selection Aloud** and **Search Slate** include developer notes and manual verification instructions in their project documentation.
- Automated or static checks do **not** replace testing the extension in Chrome, checking supported voices, or validating the live Slate/SHARE destinations. External services can change.

If reporting a problem, identify the extension and version, Chrome version, reproduction steps, and relevant errors from `chrome://extensions`. Please redact any sensitive text, URLs, or account details from reports.

## Development note

The three extensions in this repository were developed with assistance from OpenAI's ChatGPT, including support for code development and documentation. Michael Bendorf is responsible for the projects' content, release decisions, and ongoing maintenance.

## License, attribution, and status

**License:** The code and original bundled artwork in all three extensions are released under the [Mozilla Public License 2.0 (MPL-2.0)](LICENSE). **Copyright © 2026 Michael Bendorf.** Each extension folder also contains its own copy of `LICENSE`, so the terms remain available when an extension is distributed separately.

MPL 2.0 is a **file-level copyleft** license: you may use, modify, distribute, and commercially incorporate the extensions. If you distribute modified MPL-covered files, you must make those covered files' source code available under MPL 2.0 and preserve required notices. You may keep separate files in a larger work under other terms, consistent with MPL 2.0. **Internal-only changes do not have to be published.** See the full license for authoritative terms.

**Voluntary contribution request:** Even for internal-only improvements, please consider sharing useful fixes, accessibility enhancements, and new features via an issue or pull request. This is an invitation, not an additional license condition.

These are independent convenience tools, not official products of Google Chrome, Slate, SHARE, or Illinois Heartland Library System. Product and organization names are used descriptively.

**Release status:** Current code and documentation are published here on GitHub. The extensions have **not** been submitted to the Chrome Web Store.
