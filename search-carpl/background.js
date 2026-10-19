// background.js
const URL_TEMPLATE = "https://carp.illshareit.com/Union/Search?view=list&showCovers=on&lookfor=Z&searchIndex=Keyword&searchSource=local";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "search-carpl",
    title: "Search CarPL",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "search-carpl" && info.selectionText) {
    const query = encodeURIComponent(info.selectionText.trim());
    const targetUrl = URL_TEMPLATE.replace("Z", query);
    chrome.tabs.create({ url: targetUrl });
  }
});
