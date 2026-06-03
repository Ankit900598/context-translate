# Context Translate

> **Local-only:** We do not deploy, push to GitHub, publish to the Chrome Web Store, or enable paid cloud billing unless you explicitly ask. See **[LOCAL_ONLY.md](LOCAL_ONLY.md)**.

**Chrome v1 (use today):** select text → right-click → **Translate selection**. **Demo mode** works immediately — no API key, no server.

**Windows desktop (.exe):** later — needs [Rust](https://rustup.rs) installed; not required for Chrome v1.

**Google mode (optional):** your API key stays in the browser only if you choose Google in Settings.

## How it works (Chrome v1)

```text
select text → right-click → "Translate selection" → popup (demo chip by default)
```

| Mode | What happens |
|------|----------------|
| **Demo** (default) | Offline sample translations — safe to try immediately |
| **Google** | Your API key → direct call to `translation.googleapis.com` |

No hosted server required. [`apps/api`](apps/api) is optional for future Pro/team hosting.

## Monorepo layout

| Path | What |
|------|------|
| [`packages/core`](packages/core) | `translateText`, mock demo, Google client, cache |
| [`apps/extension`](apps/extension) | Chrome extension (WXT / MV3) |
| [`apps/desktop`](apps/desktop) | Windows tray app (Tauri 2) |
| [`apps/api`](apps/api) | Optional hosted proxy (not needed for v1) |

## Prerequisites (Chrome v1)

- **Node.js 18+** (uses `corepack pnpm` on Windows if `pnpm` is not on PATH)
- **Google Cloud** — only if you switch to Google mode in Settings (optional)

## Chrome v1 — start here

**Demo first** — no API key, no options page on install. Google key field appears only if you pick Google mode.

```powershell
cd C:\Users\HP\Projects\context-translate
.\scripts\chrome-test.ps1
```

1. `chrome://extensions` opens — turn on **Developer mode** → **Load unpacked** → paste path (copied to clipboard)
2. Local [test page](apps/extension/test-page.html) opens — select highlighted text → right-click → **Translate selection**
3. **file:// test page:** on the extension card, enable **Allow access to file URLs** (Details) so the test page works

Or build only: `.\scripts\chrome.ps1`. Full steps: [apps/extension/CHROME_QUICKSTART.md](apps/extension/CHROME_QUICKSTART.md).

## Quick start (Demo mode — no API key)

Uses **`corepack pnpm`** if `pnpm` is not on your PATH (common on Windows).

```powershell
cd C:\Users\HP\Projects\context-translate
.\scripts\verify.ps1
corepack pnpm chrome:dev
```

**Prove runnable locally:**

```powershell
corepack pnpm install
corepack pnpm run build:core
corepack pnpm test
corepack pnpm run build:extension
```

Or: `.\scripts\verify.ps1`

1. Load unpacked extension from `apps/extension/.output/chrome-mv3`
2. Open `apps/extension/test-page.html` (or any site), select text → right-click → **Translate selection**
3. You should see a **demo** translation (chip shows `demo`) — no options page or key required on install

## Google mode (optional — your own key)

Only if you want real Google translations:

1. GCP: enable **Cloud Translation API**, create an **API key**, set a budget alert.
2. Extension **Options** or desktop **Settings**:
   - Mode: **Google Translate** (the API key field appears only after you pick this)
   - Paste API key (stored locally only — Chrome `storage.local` / desktop `localStorage`)
3. Translate again — real Google results.

**Privacy:** In Google mode, selected text goes from your machine to Google’s API. Demo mode does not use the network.

## Windows desktop (later — needs Rust)

Not part of Chrome v1. Install [Rust](https://rustup.rs), then `corepack pnpm dev:desktop` for tray + **Ctrl+Shift+T**. See [`apps/desktop`](apps/desktop) when you are ready.

## Optional hosted API

See [`apps/api/README.md`](apps/api/README.md). Only if you later run a team server with `GOOGLE_TRANSLATE_API_KEY` on the backend.

## Publishing (opt-in — not run by this repo)

Nothing here auto-pushes or deploys. If **you** choose to publish:

- **Git:** `git remote add` / `git push` when you are ready (no script does this for you).
- **GitHub CLI:** `gh repo create` only if you run it yourself — omit `--push` until you intend to push.
- **Chrome Web Store:** manual upload after `corepack pnpm --filter @context-translate/extension zip` (local zip only).

See **[LOCAL_ONLY.md](LOCAL_ONLY.md)** for the full policy.

## Roadmap

- v1.5 — word history, pronunciation
- v2 — Windows shell right-click, optional hosted Pro tier via `apps/api`
- Auth/billing only when scaling past hobby usage

## License

MIT — see [LICENSE](LICENSE).
