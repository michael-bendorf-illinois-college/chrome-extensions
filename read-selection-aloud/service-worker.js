// Copyright (c) 2026 Michael Bendorf
// SPDX-License-Identifier: MPL-2.0

const MENU_ID = "read-selection-aloud";
const DEFAULT_SETTINGS = {
  voiceName: "",
  rate: 1,
  pitch: 1,
  volume: 1
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: MENU_ID,
      title: "Read selection aloud",
      contexts: ["selection"]
    });
  });
});

chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== MENU_ID || !info.selectionText) {
    return;
  }

  const settings = await chrome.storage.local.get(DEFAULT_SETTINGS);
  const options = {
    rate: clamp(settings.rate, 0.5, 2, 1),
    pitch: clamp(settings.pitch, 0, 2, 1),
    volume: clamp(settings.volume, 0, 1, 1)
  };

  if (settings.voiceName) {
    options.voiceName = settings.voiceName;
  }

  chrome.tts.stop();
  try {
    await chrome.tts.speak(info.selectionText, options);
  } catch (error) {
    console.error("Unable to read the selection aloud:", error);
  }
});

function clamp(value, minimum, maximum, fallback) {
  const number = Number(value);
  return Number.isFinite(number)
    ? Math.min(maximum, Math.max(minimum, number))
    : fallback;
}
