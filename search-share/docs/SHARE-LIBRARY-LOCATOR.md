# Find your SHARE library's shortcut URL

Search SHARE v1.1.0 uses a **member library shortcut subdomain** to direct selected-text searches to the library's SHARE catalog. The official [SHARE Library Locator](https://www.illshareit.com/) provides those shortcuts.

## What is SHARE?

**SHARE** stands for **Sharing Heartland's Available Resources Equally**. It is the library catalog/automation consortium of the **Illinois Heartland Library System (IHLS)**, supporting member libraries across central and southern Illinois. Participating libraries use shared catalog technology to connect readers and materials. [Learn more from SHARE](https://share.illinoisheartland.org/about).

The library locator is an independent official resource: it displays nearby member libraries and the shortcuts intended for direct access to their Online Patron Access Catalog.

## Find your library

1. Open **https://www.illshareit.com/**.
2. On the **SHARE Library Locator** page, find **Enter your home address**. You may enter a **town and state**, such as `Carlinville, IL`; a precise home address is not usually necessary.
3. Choose a suggested location. The page should then show a map and a **Libraries** list for the surrounding area.
4. Use the **within** selector (6, 12, or 24 miles) to widen the search if needed.
5. Locate your library's listing. Under its address, find its displayed shortcut, such as `carp.illshareit.com`.
6. Copy only the first segment before `.illshareit.com` into **Search SHARE → Settings → Library subdomain**.
7. Choose **Save settings**. The preview should display the complete catalog hostname; future right-click searches will use it.

A town-level query can be sufficient; entering your exact home address may expose extra location details to the locator's mapping service.

### Real examples seen in the locator

Searching around `Carlinville, IL` displayed:

| Library | Listed shortcut | Enter this |
| --- | --- | --- |
| Carlinville Public Library | `carp.illshareit.com` | `carp` |
| Blackburn College | `blca.illshareit.com` | `blca` |

These examples are not a complete directory. Always check the **current shortcut for your own member library**.

## Which characters do I copy?

```text
carp.illshareit.com
^^^^
Only this portion: carp
```

The settings page accepts one DNS label (1–63 letters, digits, or internal hyphens), case-insensitively. For example, a shortcut of `https://blca.illshareit.com/` means you should enter only `blca`.

Do **not** enter:

- `https://carp.illshareit.com` — includes the scheme and full hostname
- `carp.illshareit.com` — full hostname
- `carp/Union/Search` — contains a path
- `carp.illshareit.com/Union/Search?lookfor=book` — contains a search URL

The extension fills in `https://`, `.illshareit.com`, and the catalog search path.

## What the setting changes

For example, with `blca` selected and `The Hobbit` highlighted, Search SHARE opens:

```text
https://blca.illshareit.com/Union/Search?view=list&showCovers=on&lookfor=The%20Hobbit&searchIndex=Keyword&searchSource=local
```

Only the hostname differs from the original single-library version. Search phrases are trimmed and URL-encoded. The other search parameters are retained; results depend on the catalog service.

## Troubleshooting

- **Can't find the library?** Widen the radius, try the library's town, and confirm it participates in SHARE.
- **Full URL won't save?** Enter only the label to the left of `.illshareit.com`.
- **Wrong member catalog?** Compare your saved label with the locator's currently listed shortcut.
- **Catalog fails to load?** Try opening its shortcut directly from the locator. SHARE's external service may be unavailable or have changed its URL format.

## Official sources

- [SHARE Library Locator](https://www.illshareit.com/)
- [About SHARE](https://share.illinoisheartland.org/about)
