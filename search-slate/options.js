// Copyright (c) 2026 Michael Bendorf
// SPDX-License-Identifier: MPL-2.0

"use strict";

const DEFAULT_HOSTNAME = "admission.ic.edu";
const ICON_SIZES = [16, 32, 48, 128];
const MAX_ICON_BYTES = 256 * 1024;
const PNG_PREFIX = "data:image/png;base64,";
const HOSTNAME_PATTERN = /^(?=.{1,253}$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/;
const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];

const elements = {
  hostname: document.querySelector("#hostname"),
  resetHostname: document.querySelector("#reset-hostname"),
  iconFiles: document.querySelector("#icon-files"),
  restoreIcons: document.querySelector("#restore-icons"),
  packState: document.querySelector("#pack-state"),
  save: document.querySelector("#save"),
  status: document.querySelector("#status")
};

let savedPack = null;
let stagedPack = null;
let restoreOriginalIcons = false;
let selectionRevision = 0;
let statusTimer;

document.addEventListener("DOMContentLoaded", initialize);
elements.resetHostname.addEventListener("click", () => {
  elements.hostname.value = DEFAULT_HOSTNAME;
  showStatus("Original hostname selected. Save to apply.");
});
elements.iconFiles.addEventListener("change", stageSelectedIcons);
elements.restoreIcons.addEventListener("click", () => {
  selectionRevision += 1;
  stagedPack = null;
  restoreOriginalIcons = true;
  elements.iconFiles.value = "";
  elements.save.disabled = false;
  renderIconPreview(null);
  showStatus("Original icons selected. Save to apply.");
});
elements.save.addEventListener("click", saveSettings);

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

function isSavedPack(pack) {
  return pack !== null &&
    typeof pack === "object" &&
    !Array.isArray(pack) &&
    ICON_SIZES.every((size) =>
      typeof pack[size] === "string" && pack[size].startsWith(PNG_PREFIX)
    );
}

async function initialize() {
  try {
    const settings = await chrome.storage.local.get({
      slateHostname: DEFAULT_HOSTNAME,
      iconPack: null
    });
    elements.hostname.value = settings.slateHostname;
    if (settings.iconPack && !isSavedPack(settings.iconPack)) {
      showStatus("Saved icons are invalid. Select a new pack or restore originals.", true);
      savedPack = null;
    } else {
      savedPack = settings.iconPack;
    }
    renderIconPreview(savedPack);
  } catch (error) {
    showStatus("Unable to load settings: " + error.message, true);
  }
}

function renderIconPreview(pack) {
  for (const size of ICON_SIZES) {
    const image = document.querySelector("#icon-" + size);
    image.src = pack && pack[size]
      ? pack[size]
      : chrome.runtime.getURL("icons/icon" + size + ".png");
  }
  elements.packState.textContent = pack
    ? "Custom toolbar icon pack selected."
    : "Using the original bundled icons.";
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const value = String(reader.result || "");
      const comma = value.indexOf(",");
      if (comma < 0) {
        reject(new Error("Unable to read " + file.name + " as an image."));
        return;
      }
      resolve(value.slice(comma + 1));
    };
    reader.onerror = () => reject(new Error("Unable to read " + file.name + "."));
    reader.readAsDataURL(file);
  });
}

async function checkPngFile(file) {
  if (file.size < 24 || file.size > MAX_ICON_BYTES) {
    throw new Error(file.name + " must be a PNG no larger than 256 KB.");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!PNG_SIGNATURE.every((byte, index) => bytes[index] === byte)) {
    throw new Error(file.name + " is not a valid PNG file.");
  }

  const header = new DataView(bytes.buffer);
  const width = header.getUint32(16);
  const height = header.getUint32(20);
  if (width !== height || !ICON_SIZES.includes(width)) {
    throw new Error(file.name + " must be exactly 16, 32, 48, or 128 pixels square.");
  }

  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
    if (bitmap.width !== width || bitmap.height !== height) {
      throw new Error("Image dimensions do not match the PNG header.");
    }
  } catch (error) {
    throw new Error(file.name + " could not be decoded as a PNG image.");
  } finally {
    if (bitmap) {
      bitmap.close();
    }
  }

  return {
    size: width,
    dataUrl: PNG_PREFIX + await readFileAsBase64(file)
  };
}

async function stageSelectedIcons() {
  const revision = ++selectionRevision;
  const files = Array.from(elements.iconFiles.files || []);
  if (!files.length) {
    return;
  }

  elements.save.disabled = true;
  try {
    if (files.length !== ICON_SIZES.length) {
      throw new Error("Choose exactly four PNG files: 16, 32, 48, and 128 pixels square.");
    }

    const nextPack = {};
    for (const file of files) {
      const icon = await checkPngFile(file);
      if (nextPack[icon.size]) {
        throw new Error("Two files have the " + icon.size + "×" + icon.size + " dimensions.");
      }
      nextPack[icon.size] = icon.dataUrl;
    }

    const missing = ICON_SIZES.filter((size) => !nextPack[size]);
    if (missing.length) {
      throw new Error("Missing PNG sizes: " + missing.join(", ") + " pixels.");
    }

    if (revision !== selectionRevision) {
      return;
    }
    stagedPack = nextPack;
    restoreOriginalIcons = false;
    renderIconPreview(nextPack);
    showStatus("All four PNGs validated. Save to apply the new toolbar icons.");
  } catch (error) {
    if (revision !== selectionRevision) {
      return;
    }
    stagedPack = null;
    elements.iconFiles.value = "";
    renderIconPreview(restoreOriginalIcons ? null : savedPack);
    showStatus(error.message, true);
  } finally {
    if (revision === selectionRevision) {
      elements.save.disabled = false;
    }
  }
}

async function saveSettings() {
  elements.save.disabled = true;
  try {
    const hostname = normalizeHostname(elements.hostname.value);
    const newPack = restoreOriginalIcons ? null : (stagedPack || savedPack);
    const previous = await chrome.storage.local.get({
      slateHostname: DEFAULT_HOSTNAME,
      iconPack: null
    });

    await chrome.storage.local.set({
      slateHostname: hostname,
      iconPack: newPack
    });

    try {
      const result = await chrome.runtime.sendMessage({ type: "apply-icon-pack" });
      if (!result || !result.ok) {
        throw new Error(result && result.error
          ? result.error
          : "The background service worker did not apply the icons.");
      }
    } catch (error) {
      await chrome.storage.local.set(previous);
      try {
        await chrome.runtime.sendMessage({ type: "apply-icon-pack" });
      } catch (restoreError) {
        console.error("Unable to restore the previous toolbar icon:", restoreError);
      }
      throw new Error("Changes were rolled back: " + error.message);
    }

    savedPack = newPack;
    stagedPack = null;
    restoreOriginalIcons = false;
    elements.hostname.value = hostname;
    elements.iconFiles.value = "";
    renderIconPreview(savedPack);
    showStatus("Settings saved. New Slate searches will use " + hostname + ".");
  } catch (error) {
    showStatus(error.message || "Unable to save settings.", true);
  } finally {
    elements.save.disabled = false;
  }
}

function showStatus(message, isError = false) {
  clearTimeout(statusTimer);
  elements.status.textContent = message;
  elements.status.classList.toggle("error", isError);
  if (!isError) {
    statusTimer = setTimeout(() => {
      elements.status.textContent = "";
    }, 5000);
  }
}
