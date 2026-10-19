// Copyright (c) 2026 Michael Bendorf
// SPDX-License-Identifier: MPL-2.0

"use strict";

// Run from this folder's parent with: node tests/verify.js
// No dependencies and no live catalog requests.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");
const manifest = JSON.parse(read("manifest.json"));

function makeEvent() {
  const listeners = [];
  return {
    listeners,
    addListener(handler) { listeners.push(handler); },
    async emit(...args) {
      for (const handler of listeners) await handler(...args);
    }
  };
}

function configContext() {
  const context = vm.createContext({});
  vm.runInContext(read("config.js"), context, { filename: "config.js" });
  return context;
}

function evaluate(context, expression) {
  return vm.runInContext(expression, context);
}

function backgroundHarness(initialValue) {
  const installed = makeEvent();
  const clicked = makeEvent();
  const action = makeEvent();
  const menuCreates = [];
  const newTabs = [];
  let openedOptions = 0;
  let savedValue = initialValue;
  let failRead = false;

  const chrome = {
    runtime: {
      onInstalled: installed,
      openOptionsPage() { openedOptions += 1; }
    },
    contextMenus: {
      create(input) { menuCreates.push(input); },
      onClicked: clicked
    },
    action: { onClicked: action },
    tabs: {
      create(input) { newTabs.push(input); }
    },
    storage: {
      local: {
        async get(key) {
          if (failRead) throw new Error("Storage unavailable");
          return { [key]: savedValue };
        }
      }
    }
  };
  const context = vm.createContext({
    chrome,
    console: { warn() {} },
    importScripts(filename) {
      assert.equal(filename, "config.js");
      vm.runInContext(read(filename), context, { filename });
    }
  });
  vm.runInContext(read("background.js"), context, { filename: "background.js" });

  return {
    installed, clicked, action, menuCreates, newTabs,
    optionsCount: () => openedOptions,
    setSaved: (value) => { savedValue = value; },
    setFailRead: (value) => { failRead = value; }
  };
}

function makeElement(value = "") {
  const handlers = {};
  const classes = new Set();
  return {
    value,
    textContent: "",
    disabled: false,
    focused: false,
    classList: {
      contains(value) { return classes.has(value); },
      toggle(value, enabled) {
        if (enabled) classes.add(value);
        else classes.delete(value);
      }
    },
    addEventListener(name, fn) { handlers[name] = fn; },
    async trigger(name, event = {}) {
      assert.equal(typeof handlers[name], "function", "Missing event: " + name);
      await handlers[name](event);
    },
    focus() { this.focused = true; }
  };
}

async function optionsHarness(initialValue, options = {}) {
  const elements = {
    subdomain: makeElement(),
    "destination-preview": makeElement(),
    status: makeElement(),
    save: makeElement(),
    "reset-subdomain": makeElement(),
    "settings-form": makeElement()
  };
  const stored = { shareSubdomain: initialValue };
  let saveCount = 0;
  let failWrite = false;
  let failRead = false;
  const chrome = {
    storage: {
      local: {
        async get(key) {
          if (failRead) throw new Error("Cannot load");
          return { [key]: stored[key] };
        },
        async set(data) {
          if (failWrite) throw new Error("Cannot save");
          Object.assign(stored, data);
          saveCount += 1;
        }
      }
    }
  };
  const context = vm.createContext({
    chrome,
    console: { warn() {} },
    document: {
      getElementById(id) {
        assert.ok(elements[id], "Unknown element: " + id);
        return elements[id];
      }
    }
  });
  vm.runInContext(read("config.js"), context, { filename: "config.js" });
  vm.runInContext(read("options.js"), context, { filename: "options.js" });
  // The module starts its asynchronous settings load during evaluation.
  await new Promise((resolve) => setImmediate(resolve));
  return {
    elements, stored,
    saves: () => saveCount,
    failSave: (value) => { failWrite = value; },
    failLoad: (value) => { failRead = value; },
    reload: async () => { await evaluate(context, "loadSettings()"); }
  };
}

let passed = 0;
async function test(name, callback) {
  await callback();
  passed += 1;
  console.log("✓ " + name);
}

async function main() {
  await test("Manifest, options, and packaged assets", () => {
    assert.equal(manifest.manifest_version, 3);
    assert.equal(manifest.name, "Search SHARE");
    assert.equal(manifest.version, "1.1.0");
    assert.equal(manifest.options_page, "options.html");
    assert.equal(manifest.background.service_worker, "background.js");
    assert.deepEqual(manifest.permissions, ["contextMenus", "storage"]);
    assert.equal(manifest.web_accessible_resources, undefined);
    for (const name of ["background.js", "config.js", "options.html",
      "options.css", "options.js", "README.md"]) {
      assert.ok(read(name).length > 0, name);
    }
    for (const size of [16, 32, 48, 128]) {
      assert.ok(fs.existsSync(path.join(root, "icons", "icon" + size + ".png")));
    }
    const html = read("options.html");
    assert.ok(html.indexOf('src="config.js"') < html.indexOf('src="options.js"'));
    assert.ok(html.includes("https://www.illshareit.com/"));
    assert.ok(html.includes("Sharing Heartland"));
  });

  await test("Subdomain normalization and validation boundaries", () => {
    const ctx = configContext();
    assert.equal(evaluate(ctx, 'normalizeShareSubdomain(" BLCA ")'), "blca");
    for (const label of ["a", "carp", "a-b", "a1", "A1-B2", "a".repeat(63)]) {
      assert.equal(evaluate(ctx, "isValidShareSubdomain(" +
        JSON.stringify(label) + ")"), true, label);
    }
    for (const label of ["", ".", "carp.illshareit.com", "https://carp",
      "-carp", "carp-", "ca rp", "a/b", "é", "_carp", "a".repeat(64), 1, null]) {
      assert.equal(evaluate(ctx, "isValidShareSubdomain(" +
        JSON.stringify(label) + ")"), false, String(label));
    }
  });

  await test("Original v1.0 default URL and Unicode/query encoding parity", () => {
    const ctx = configContext();
    for (const phrase of ["The Hobbit", "R & D", "C++?", "café 📚", "  Big Book  "]) {
      const actual = evaluate(ctx, "shareSearchUrl('carp', " +
        JSON.stringify(phrase) + ")");
      const expected = "https://carp.illshareit.com/Union/Search?view=list" +
        "&showCovers=on&lookfor=" + encodeURIComponent(phrase.trim()) +
        "&searchIndex=Keyword&searchSource=local";
      assert.equal(actual, expected);
    }
    assert.equal(evaluate(ctx, "shareSearchUrl('BLCA','librarian')"),
      "https://blca.illshareit.com/Union/Search?view=list&showCovers=on" +
      "&lookfor=librarian&searchIndex=Keyword&searchSource=local");
    // Even a bad direct call cannot direct a search outside illshareit.com.
    assert.ok(evaluate(ctx, "shareSearchUrl('evil.example.com','book')")
      .startsWith("https://carp.illshareit.com/"));
  });

  await test("Menu registration, toolbar settings, and selection filtering", async () => {
    const h = backgroundHarness();
    await h.installed.emit();
    assert.equal(h.menuCreates.length, 1);
    assert.equal(h.menuCreates[0].id, "search-share");
    assert.equal(h.menuCreates[0].title, "Search SHARE");
    assert.equal(Array.from(h.menuCreates[0].contexts).join(","), "selection");
    await h.action.emit();
    assert.equal(h.optionsCount(), 1);
    await h.clicked.emit({ menuItemId: "different", selectionText: "book" });
    await h.clicked.emit({ menuItemId: "search-share", selectionText: " " });
    await h.clicked.emit({ menuItemId: "search-share" });
    assert.equal(h.newTabs.length, 0);
    await h.clicked.emit({ menuItemId: "search-share", selectionText: "  The Hobbit  " });
    assert.equal(h.newTabs.length, 1);
    assert.ok(h.newTabs[0].url.includes("lookfor=The%20Hobbit"));
  });

  await test("Saved library, invalid preference, and storage error fallbacks", async () => {
    const h = backgroundHarness("blca");
    await h.clicked.emit({ menuItemId: "search-share", selectionText: "book" });
    assert.ok(h.newTabs.at(-1).url.startsWith("https://blca.illshareit.com/"));
    h.setSaved("https://evil.example.com/");
    await h.clicked.emit({ menuItemId: "search-share", selectionText: "book" });
    assert.ok(h.newTabs.at(-1).url.startsWith("https://carp.illshareit.com/"));
    h.setFailRead(true);
    await h.clicked.emit({ menuItemId: "search-share", selectionText: "book" });
    assert.ok(h.newTabs.at(-1).url.startsWith("https://carp.illshareit.com/"));
  });

  await test("Options initial value, live preview, normalize-save, and reset", async () => {
    const h = await optionsHarness("blca");
    const e = h.elements;
    assert.equal(e.subdomain.value, "blca");
    assert.equal(e["destination-preview"].textContent, "https://blca.illshareit.com");
    e.subdomain.value = " CARP ";
    await e.subdomain.trigger("input");
    assert.equal(e["destination-preview"].textContent, "https://carp.illshareit.com");
    await e["settings-form"].trigger("submit", { preventDefault() {} });
    assert.equal(h.stored.shareSubdomain, "carp");
    assert.equal(h.saves(), 1);
    assert.ok(e.status.textContent.includes("Saved"));
    e.subdomain.value = "blca";
    await e["reset-subdomain"].trigger("click");
    assert.equal(e.subdomain.value, "carp");
    assert.equal(h.saves(), 1, "Reset must not save immediately");
    await e["settings-form"].trigger("submit", { preventDefault() {} });
    assert.equal(h.saves(), 2);
  });

  await test("Options rejects bad labels and handles storage errors", async () => {
    const h = await optionsHarness("bad.host");
    const e = h.elements;
    assert.equal(e.subdomain.value, "carp");
    assert.ok(e.status.classList.contains("error"));
    e.subdomain.value = "https://wrong.domain";
    await e.subdomain.trigger("input");
    assert.ok(e["destination-preview"].textContent.includes("valid"));
    await e["settings-form"].trigger("submit", { preventDefault() {} });
    assert.equal(h.saves(), 0);
    assert.equal(e.subdomain.focused, true);
    h.failSave(true);
    e.subdomain.value = "blca";
    await e["settings-form"].trigger("submit", { preventDefault() {} });
    assert.equal(h.saves(), 0);
    assert.ok(e.status.classList.contains("error"));
    assert.equal(e.save.disabled, false);
    h.failLoad(true);
    await h.reload();
    assert.equal(e.subdomain.value, "carp");
    assert.ok(e.status.classList.contains("error"));
  });

  console.log("\nAll " + passed + " Search SHARE tests passed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
