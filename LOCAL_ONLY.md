# Local-only policy

**We do not deploy, push to GitHub, publish to the Chrome Web Store, or enable paid cloud billing unless you explicitly ask.**

This repo is built for **local development and manual testing** on your machine. Nothing in the default workflow runs those steps for you.

## What stays local (default)

| Action | How |
|--------|-----|
| Install deps | `corepack pnpm install`, `.\scripts\setup.ps1` |
| Build & test | `corepack pnpm verify`, `.\scripts\verify.ps1`, `scripts/verify-all.mjs` |
| Chrome extension | `.\scripts\chrome-test.ps1` or `corepack pnpm chrome:test` — build + load unpacked + local `test-page.html` |
| Chrome build only | `.\scripts\chrome.ps1` or `corepack pnpm chrome` — no deploy |
| file:// test page | After load unpacked: extension **Details** → enable **Allow access to file URLs** |
| Desktop dev | **Later** — needs Rust; `corepack pnpm dev:desktop` when ready |
| Optional API | `corepack pnpm dev:api` — localhost only |

**Demo mode** is the default: offline sample translations, no API key, no network for translation.

## What we do NOT do automatically

- `git push` or `gh repo create … --push`
- Deploy to GCP, Azure, Vercel, etc.
- Chrome Web Store or `wxt zip` upload (zip is a local artifact only if you run it yourself)
- Enabling Cloud Translation API or billing on your Google account

## Optional (only when you ask)

- **GitHub:** push or create a remote yourself — see README “Publishing (opt-in)” if you want example commands.
- **Google mode:** you enable Translation API and paste your own API key in Settings — charges are on your GCP account, not this repo.
- **CI:** `.github/workflows/` runs only if **you** push to GitHub; it builds artifacts, it does not publish to a store or enable billing.

## Scripts audit

All root `package.json` scripts are local-only: `build`, `dev:*`, `chrome`, `chrome:test`, `verify`, `test`. None call `git push`, `gh`, `deploy`, or cloud CLIs.

If an agent or teammate suggests deploy/push/store/billing, treat it as **opt-in** and confirm with you first.
