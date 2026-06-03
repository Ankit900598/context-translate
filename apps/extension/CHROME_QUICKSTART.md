# Chrome v1 — one path

**Local-only:** build and load unpacked on your machine. No deploy, push, Web Store, or paid APIs unless you choose Google mode yourself. See [LOCAL_ONLY.md](../../LOCAL_ONLY.md).

**Demo mode** is the default — offline sample translations, no API key, no setup prompts on install.

---

## Run today (recommended)

From the repo root:

```powershell
.\scripts\chrome-test.ps1
```

| Step | What you do |
|------|-------------|
| 1 | Script builds → opens `chrome://extensions` |
| 2 | **Developer mode** ON → **Load unpacked** → paste path from clipboard (`apps\extension\.output\chrome-mv3`) |
| 3 | Extension **Details** → enable **Allow access to file URLs** (needed for the local test page) |
| 4 | Test page opens — select <mark>hello world</mark> → right-click → **Translate selection** |
| 5 | Popup shows translation with **demo** in the chip |

Works on normal `https://` sites too (step 3 optional there).

---

## Build only (no test tab)

```powershell
.\scripts\chrome.ps1 -SkipTestPage
```

Same load-unpacked steps; open `apps\extension\test-page.html` yourself if you want.

---

## After code changes

```powershell
.\scripts\chrome.ps1
```

On `chrome://extensions`, click **Reload** on Context Translate.

---

## Optional: Google mode

Not required for v1.

1. `chrome://extensions` → Context Translate → **Extension options**
2. Mode stays **Demo** until you change it
3. Pick **Google Translate** — the API key field appears **only then**
4. Paste your [Cloud Translation API key](https://cloud.google.com/translate/docs/setup) → Save

---

## Dev mode (auto-rebuild)

```powershell
corepack pnpm --filter @context-translate/extension dev
```

Load unpacked once from `.output\chrome-mv3`; click **Reload** on the extension card after background/options changes.

---

## Limits

| Situation | Note |
|-----------|------|
| `chrome://` pages | Extension cannot run there (including the extensions page) |
| PDF in Chrome | Often no selectable text — try a normal webpage first |
| file:// test page | Must enable **Allow access to file URLs** on the extension |

---

## Troubleshooting

| Problem | Fix |
|--------|-----|
| No “Translate selection” in menu | Reload extension; refresh the tab |
| Nothing on test page | Enable **Allow access to file URLs** on the extension |
| Popup error about API key | You chose **Google** without a key — switch back to **Demo** in options |
| “Connection” / API errors | Same — use **Demo** or add a valid key |
