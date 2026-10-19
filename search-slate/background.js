// background.js
const URL_TEMPLATE = "https://admission.ic.edu/manage/lookup/search?joinable=1&base=4ea0ba73-ced1-4996-a50d-3d861d539c1e#%7B%22q%22:%22X%22,%22pg%22:%220%22,%22sort%22:%22%22,%22filter%22:%5B%5D%7D";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "search-slate",
    title: "Search Slate",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "search-slate" && info.selectionText) {
    const query = encodeURIComponent(info.selectionText.trim());
    const targetUrl = URL_TEMPLATE.replace("X", query);
    chrome.tabs.create({ url: targetUrl });
  }
});
