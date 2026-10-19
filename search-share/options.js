// Copyright (c) 2026 Michael Bendorf
// SPDX-License-Identifier: MPL-2.0

const subdomainInput = document.getElementById("subdomain");
const destinationPreview = document.getElementById("destination-preview");
const statusElement = document.getElementById("status");
const saveButton = document.getElementById("save");

function setStatus(message, isError = false) {
  statusElement.textContent = message;
  statusElement.classList.toggle("error", isError);
}

function renderDestination() {
  const label = normalizeShareSubdomain(subdomainInput.value);
  destinationPreview.textContent = isValidShareSubdomain(label)
    ? "https://" + label + "." + SHARE_CONFIG.catalogDomain
    : "Enter one valid library subdomain to preview its address.";
}

async function loadSettings() {
  try {
    const saved = await chrome.storage.local.get(SHARE_CONFIG.storageKey);
    const label = saved[SHARE_CONFIG.storageKey];

    if (label == null) {
      subdomainInput.value = SHARE_CONFIG.defaultSubdomain;
    } else if (isValidShareSubdomain(label)) {
      subdomainInput.value = normalizeShareSubdomain(label);
    } else {
      subdomainInput.value = SHARE_CONFIG.defaultSubdomain;
      setStatus("An invalid saved subdomain was ignored. Review and save your choice.", true);
    }
  } catch (error) {
    subdomainInput.value = SHARE_CONFIG.defaultSubdomain;
    setStatus("Could not load saved settings; showing the default.", true);
    console.warn("Search SHARE settings load failed:", error);
  }
  renderDestination();
}

document.getElementById("settings-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const label = normalizeShareSubdomain(subdomainInput.value);

  if (!isValidShareSubdomain(label)) {
    setStatus("Enter only the library's shortcut subdomain (1–63 letters, digits or hyphens).", true);
    subdomainInput.focus();
    return;
  }

  saveButton.disabled = true;
  try {
    await chrome.storage.local.set({ [SHARE_CONFIG.storageKey]: label });
    subdomainInput.value = label;
    renderDestination();
    setStatus("Saved. Future Search SHARE commands use this library.");
  } catch (error) {
    setStatus("Could not save settings. Please try again.", true);
    console.warn("Search SHARE settings save failed:", error);
  } finally {
    saveButton.disabled = false;
  }
});

document.getElementById("reset-subdomain").addEventListener("click", () => {
  subdomainInput.value = SHARE_CONFIG.defaultSubdomain;
  renderDestination();
  setStatus("Default selected. Choose Save settings to apply it.");
});

subdomainInput.addEventListener("input", () => {
  renderDestination();
  setStatus("");
});

loadSettings();
