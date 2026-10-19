importScripts("config.js");

const SHARE_CONTEXT_MENU_ID = "search-share";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: SHARE_CONTEXT_MENU_ID,
    title: "Search SHARE",
    contexts: ["selection"]
  });
});

// The toolbar button provides a quick way to configure the library shortcut.
chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});

async function getShareSubdomain() {
  try {
    const saved = await chrome.storage.local.get(SHARE_CONFIG.storageKey);
    const value = saved[SHARE_CONFIG.storageKey];

    return isValidShareSubdomain(value)
      ? normalizeShareSubdomain(value)
      : SHARE_CONFIG.defaultSubdomain;
  } catch (error) {
    // Storage errors should not prevent users from searching the default catalog.
    console.warn("Search SHARE could not read its settings:", error);
    return SHARE_CONFIG.defaultSubdomain;
  }
}

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== SHARE_CONTEXT_MENU_ID ||
      typeof info.selectionText !== "string") {
    return;
  }

  const selection = info.selectionText.trim();
  if (!selection) return;

  const subdomain = await getShareSubdomain();
  chrome.tabs.create({ url: shareSearchUrl(subdomain, selection) });
});
