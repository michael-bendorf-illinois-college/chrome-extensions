# Search SHARE v1.1.0 — test checklist

## Automated tests

Run from the `search-share` directory:

```bash
node tests/verify.js
```

No dependencies, Chrome installation, or network are needed. Node built-in assertions and a mocked Chrome API cover:

- Manifest name/version, options, permissions, and bundled assets.
- Subdomain normalization, valid/invalid labels, and length boundaries.
- Default URL exact match against the original 1.0 template, including Unicode, spaces, and query delimiters.
- Configured-host URL generation without modifying fixed search parameters.
- Context-menu registration, selected-text dispatch, ignored invalid events.
- Stored subdomain, invalid-data fallback, and storage-read failure.
- Options initial value, destination preview, save, reset, invalid input, and storage errors.

These are **simulated Chrome tests**, not proof of live catalog behavior.

## Manual Google Chrome acceptance

- [ ] Use **Load unpacked** on the `search-share` folder; confirm **Search SHARE 1.1.0**.
- [ ] Verify the purple-book toolbar icon; click it and confirm Settings opens.
- [ ] Read the SHARE description and locator steps; verify links open the official sites.
- [ ] With no preference saved, the preview shows `https://carp.illshareit.com`.
- [ ] Highlight `The Hobbit` on a normal webpage and choose **Search SHARE**. Check the default hostname and `lookfor=The%20Hobbit`.
- [ ] Open the SHARE Locator and enter `Carlinville, IL`, select a suggested place, and verify shortcut addresses appear for nearby libraries.
- [ ] Save a real listed alternative like `blca` and confirm only the hostname changes on another context-menu search.
- [ ] Save uppercase/whitespace ` BLCA ` and confirm normalizing to `blca`.
- [ ] Reject a full URL, full hostname, leading hyphen, slash, and overlong subdomain input.
- [ ] Click **Use default**, inspect the preview, then **Save settings**. Confirm searches use `carp` again.
- [ ] Close/reopen settings and restart Chrome to confirm preference persistence.
- [ ] Test Unicode, punctuation, and ampersands in highlighted text; check encoded `lookfor` value.
- [ ] Check extension **Errors** panel and service worker console.
- [ ] Test options in a narrow window and both light/dark Chrome themes.
- [ ] When upgrading, remove or disable the old `search-carpl` installation and confirm no duplicate context menus.

## Scope

Automated tests validate URL construction and mocked event behavior. Browser integration and external catalog behavior require the manual checks. If SHARE changes the `/Union/Search` endpoint, inspect current catalog URLs before modifying fixed parameters.
