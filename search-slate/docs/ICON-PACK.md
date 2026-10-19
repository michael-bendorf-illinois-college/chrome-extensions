# Preparing an icon pack for Search Slate

Search Slate v1.1.0 can use a custom set of toolbar icons supplied through its configuration page. This guide explains how to prepare an acceptable pack.

## Files required

Create **four separate PNG images**, all with square dimensions:

| Suggested filename | Exact pixel dimensions | Maximum size |
| --- | --- | --- |
| `icon16.png` | 16×16 | 256 KB |
| `icon32.png` | 32×32 | 256 KB |
| `icon48.png` | 48×48 | 256 KB |
| `icon128.png` | 128×128 | 256 KB |

The filenames above are suggestions only. The settings page determines each image's role from its actual pixel dimensions, not the name.

**Choose all four individual files at once.** Do not compress them into a ZIP for the options-page picker.

## Supported image format

- **PNG only**. JPEG, GIF, SVG, ICO, WebP, and other formats are not accepted by this version's uploader.
- **Exact dimensions**. A 100×100 file named `icon128.png` will be rejected; filenames cannot substitute for real pixel sizes.
- **Valid, decodable image**. The extension checks both PNG file headers and whether the browser can decode the picture.
- **One file per size**. A duplicate 32×32 image does not replace a missing 48×48 file.
- **No larger than 256 KB each**. Export efficiently sized icons without unnecessary large metadata.

Chrome's unpacked extension artwork also needs PNG files; keeping this set in PNG format is straightforward and portable.

## Design recommendations

- Start with a clean, **square master image** at 512×512 or 1024×1024 pixels.
- Keep the most important shape recognizable at just **16×16 pixels**. Small details and fine text often disappear.
- Use generous contrast so the icon works against both light and dark Chrome themes.
- Prefer a **transparent background**, but transparency is not technically required.
- Leave a little internal breathing room so the main symbol is not clipped.
- Export all four dimensions from the **same artwork** for consistent appearance.
- Inspect the 16×16 image at its real size; consider simplifying tiny details rather than only scaling down.
- Avoid sensitive student, institutional, or copyrighted imagery unless you have permission to use it.

A practical workflow in an image editor:

1. Open the square master artwork.
2. Resize/export one copy at each of 16, 32, 48, and 128 pixels.
3. Save each as PNG, preserving transparency if desired.
4. Confirm the actual pixel dimensions and file sizes.
5. Select all four through the Search Slate settings page.

The [original bundled images](../icons/) are available as working examples of the four required sizes.

## Upload, preview, save, or reset

1. Click the Search Slate toolbar icon to open settings.
2. Under **Toolbar icon pack**, select four PNG files together.
3. Wait for validation. The four previews will update only if the complete pack is valid.
4. Select **Save settings** to apply the icons.
5. To return to the provided artwork, select **Restore original icons** and then **Save settings**.

The image bytes are stored within `chrome.storage.local` on your current Chrome installation. There is no image-hosting service or upload to the repository. Because this storage is local, your personal icon pack does not automatically travel to a different computer.

## Where the new icons appear

The custom pack changes the **Chrome toolbar action icon**, including the extension's icon in Chrome's toolbar/Extensions menu. Chrome's `action.setIcon` API supports different image sizes so it can choose an appropriate image for the display density.

The extension's installed identity icon in `chrome://extensions` is drawn from the packaged `manifest.icons` files and **does not change** when an end user selects a new pack. The **Search Slate** right-click menu entry continues to use its text label.

To permanently replace the packaged identity artwork for all installations, a developer would need to update the PNG files in the extension source and republish a new version.

## Troubleshooting icon packs

| Problem | Explanation |
| --- | --- |
| "Choose exactly four" | You selected fewer or more than four PNG files. |
| "Two files have … dimensions" | Two images are the same supported size; a different required size is missing. |
| "Must be exactly … pixels square" | At least one image is rectangular or uses unsupported dimensions. |
| "Not a valid PNG" | The file extension may say PNG while the underlying bytes use another format. |
| "Could not be decoded" | The PNG data is damaged or the browser cannot decode it. |
| "No larger than 256 KB" | Re-export at the required pixel size with a smaller PNG file. |
| Preview changed, toolbar did not | You still need to click **Save settings**. |
| Changed toolbar, unchanged extension listing | This is a Chrome platform distinction between runtime toolbar icons and manifest identity icons. |

## Chrome documentation

- [Action API and runtime icons](https://developer.chrome.com/docs/extensions/reference/api/action)
- [Manifest icon artwork](https://developer.chrome.com/docs/extensions/reference/manifest/icons)
- [Local extension storage](https://developer.chrome.com/docs/extensions/reference/api/storage)
