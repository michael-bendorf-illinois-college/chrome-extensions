"use strict";

const DEFAULT_HOSTNAME = "admission.ic.edu";
const HOSTNAME_KEY = "slateHostname";
const ICON_PACK_KEY = "iconPack";
const ICON_SIZES = [16, 32, 48, 128];
const MAX_ICON_BYTES = 256 * 1024;
const PNG_PREFIX = "data:image/png;base64,";
const DEFAULT_ICONS = {
  16: "icons/icon16.png",
  32: "icons/icon32.png",
  48: "icons/icon48.png",
  128: "icons/icon128.png"
};

const URL_TEMPLATE = "https://admission.ic.edu/manage/lookup/search?joinable=1&base=4ea0ba73-ced1-4996-a50d-3d861d539c1e#%7B%22q%22:%22X%22,%22pg%22:%220%22,%22sort%22:%22%22,%22filter%22:%5B%5D%7D";
const HOSTNAME_PATTERN = /^(?=.{1,253}$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/;

function normalizeHostname(value) {
  if (typeof value !== "string") {
    throw new Error("Enter a hostname such as admission.ic.edu.");
  }

  const hostname = value.trim().toLowerCase();
  if (!HOSTNAME_PATTERN.test(hostname)) {
    throw new Error("Use a hostname only: no https://, port, path, spaces, or query.");
  }
  return hostname;
}

function buildSearchUrl(hostname, selectedText) {
  const url = new URL(URL_TEMPLATE);
  url.hostname = normalizeHostname(hostname);
  url.hash = url.hash.replace("X", encodeURIComponent(String(selectedText).trim()));
  return url.href;
}

function iconBlobFromDataUrl(dataUrl, size) {
  if (typeof dataUrl !== "string" || !dataUrl.startsWith(PNG_PREFIX)) {
    throw new Error("The saved " + size + "px icon is not a PNG data URL.");
  }

  const encoded = dataUrl.slice(PNG_PREFIX.length);
  if (!encoded || !/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)) {
    throw new Error("The saved " + size + "px icon has invalid image data.");
  }

  const binary = atob(encoded);
  if (binary.length < 24 || binary.length > MAX_ICON_BYTES) {
    throw new Error("The saved " + size + "px icon is outside the permitted size.");
  }

  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  if (!signature.every((byte, index) => bytes[index] === byte)) {
    throw new Error("The saved " + size + "px icon is not a PNG image.");
  }

  const header = new DataView(bytes.buffer);
  if (header.getUint32(16) !== size || header.getUint32(20) !== size) {
    throw new Error("The saved icon must be exactly " + size + "×" + size + " pixels.");
  }

  return new Blob([bytes], { type: "image/png" });
}

async function getIconImageData(dataUrl, size) {
  const bitmap = await createImageBitmap(iconBlobFromDataUrl(dataUrl, size));
  try {
    if (bitmap.width !== size || bitmap.height !== size) {
      throw new Error("The saved " + size + "px icon dimensions are incorrect.");
    }

    const canvas = new OffscreenCanvas(size, size);
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Unable to prepare the toolbar icon.");
    }
    context.drawImage(bitmap, 0, 0);
    return context.getImageData(0, 0, size, size);
  } finally {
    bitmap.close();
  }
}

async function applySavedIconPack() {
  const settings = await chrome.storage.local.get({ [ICON_PACK_KEY]: null });
  const iconPack = settings[ICON_PACK_KEY];

  if (iconPack === null) {
    await chrome.action.setIcon({ path: DEFAULT_ICONS });
    return;
  }

  if (!iconPack || typeof iconPack !== "object" || Array.isArray(iconPack)) {
    throw new Error("The saved icon pack is invalid.");
  }

  const imageData = {};
  for (const size of ICON_SIZES) {
    imageData[size] = await getIconImageData(iconPack[size], size);
  }
  await chrome.action.setIcon({ imageData });
}

function restoreIconPack() {
  applySavedIconPack().catch((error) => {
    console.error("Unable to restore the Search Slate icon pack:", error);
  });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "search-slate",
      title: "Search Slate",
      contexts: ["selection"]
    });
  });
  restoreIconPack();
});

chrome.runtime.onStartup.addListener(restoreIconPack);

chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== "search-slate" || !info.selectionText) {
    return;
  }

  try {
    const settings = await chrome.storage.local.get({
      [HOSTNAME_KEY]: DEFAULT_HOSTNAME
    });
    let hostname;
    try {
      hostname = normalizeHostname(settings[HOSTNAME_KEY]);
    } catch (error) {
      console.warn("Invalid saved hostname; using the original Slate host:", error);
      hostname = DEFAULT_HOSTNAME;
    }

    await chrome.tabs.create({
      url: buildSearchUrl(hostname, info.selectionText)
    });
  } catch (error) {
    console.error("Unable to open the Slate search:", error);
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || message.type !== "apply-icon-pack") {
    return false;
  }

  applySavedIconPack()
    .then(() => sendResponse({ ok: true }))
    .catch((error) => sendResponse({
      ok: false,
      error: error.message || "Unable to apply the icon pack."
    }));
  return true;
});
