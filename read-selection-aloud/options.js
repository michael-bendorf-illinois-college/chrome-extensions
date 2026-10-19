// Copyright (c) 2026 Michael Bendorf
// SPDX-License-Identifier: MPL-2.0

const DEFAULT_SETTINGS = {
  voiceName: "",
  rate: 1,
  pitch: 1,
  volume: 1
};

const elements = {
  voice: document.querySelector("#voice"),
  voiceNote: document.querySelector("#voice-note"),
  rate: document.querySelector("#rate"),
  rateValue: document.querySelector("#rate-value"),
  pitch: document.querySelector("#pitch"),
  pitchValue: document.querySelector("#pitch-value"),
  volume: document.querySelector("#volume"),
  volumeValue: document.querySelector("#volume-value"),
  preview: document.querySelector("#preview"),
  save: document.querySelector("#save"),
  status: document.querySelector("#status")
};

let statusTimer;

document.addEventListener("DOMContentLoaded", initialize);
elements.rate.addEventListener("input", updateReadouts);
elements.pitch.addEventListener("input", updateReadouts);
elements.volume.addEventListener("input", updateReadouts);
elements.preview.addEventListener("click", previewVoice);
elements.save.addEventListener("click", saveSettings);

async function initialize() {
  const [settings, voices] = await Promise.all([
    chrome.storage.local.get(DEFAULT_SETTINGS),
    chrome.tts.getVoices()
  ]);

  populateVoices(voices, settings.voiceName);
  elements.rate.value = settings.rate;
  elements.pitch.value = settings.pitch;
  elements.volume.value = settings.volume;
  updateReadouts();
}

function populateVoices(voices, selectedVoice) {
  elements.voice.replaceChildren();
  elements.voice.add(new Option("Chrome default", ""));

  const sortedVoices = [...voices].sort((first, second) =>
    ((first.lang || "") + " " + (first.voiceName || "")).localeCompare(
      (second.lang || "") + " " + (second.voiceName || "")
    )
  );

  for (const voice of sortedVoices) {
    const details = [voice.lang, voice.remote ? "online" : "on device"]
      .filter(Boolean)
      .join(", ");
    const label = details
      ? voice.voiceName + " — " + details
      : voice.voiceName;
    elements.voice.add(new Option(label, voice.voiceName));
  }

  const voiceExists = sortedVoices.some(
    (voice) => voice.voiceName === selectedVoice
  );

  if (selectedVoice && !voiceExists) {
    elements.voice.add(
      new Option(selectedVoice + " — currently unavailable", selectedVoice)
    );
  }

  elements.voice.value = selectedVoice || "";
  elements.voiceNote.textContent = voices.length
    ? voices.length + " voice" + (voices.length === 1 ? "" : "s") + " available in Chrome."
    : "No named voices were reported; Chrome's default voice will still work.";
}

function getSettingsFromForm() {
  return {
    voiceName: elements.voice.value,
    rate: Number(elements.rate.value),
    pitch: Number(elements.pitch.value),
    volume: Number(elements.volume.value)
  };
}

function getSpeechOptions() {
  const settings = getSettingsFromForm();
  const options = {
    rate: settings.rate,
    pitch: settings.pitch,
    volume: settings.volume
  };

  if (settings.voiceName) {
    options.voiceName = settings.voiceName;
  }

  return options;
}

function updateReadouts() {
  elements.rateValue.textContent = Number(elements.rate.value).toFixed(1) + "×";
  elements.pitchValue.textContent = Number(elements.pitch.value).toFixed(1);
  elements.volumeValue.textContent =
    Math.round(Number(elements.volume.value) * 100) + "%";
}

async function previewVoice() {
  chrome.tts.stop();
  try {
    await chrome.tts.speak(
      "This is a preview of your selected reading voice.",
      getSpeechOptions()
    );
  } catch (error) {
    showStatus("That voice could not be played.", true);
  }
}

async function saveSettings() {
  await chrome.storage.local.set(getSettingsFromForm());
  showStatus("Settings saved.");
}

function showStatus(message, isError = false) {
  clearTimeout(statusTimer);
  elements.status.textContent = message;
  elements.status.style.color = isError ? "#b3261e" : "";
  statusTimer = setTimeout(() => {
    elements.status.textContent = "";
  }, 3000);
}
