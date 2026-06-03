# Verification (local, no paid services)

**Policy:** [LOCAL_ONLY.md](LOCAL_ONLY.md) — no deploy, `git push`, store publish, or GCP billing unless you ask.

Run from repo root in **PowerShell**. Uses `corepack pnpm` (works when `pnpm` is not on PATH).

```powershell
cd C:\Users\HP\Projects\context-translate
.\scripts\verify.ps1
```

Or step by step:

```powershell
corepack pnpm install
corepack pnpm run build:core   # tsc -p tsconfig.build.json → dist (tests excluded)
corepack pnpm test             # tsx --test tests/*.test.ts (optional: typecheck:test first)
corepack pnpm run build:extension
```

**Expected:**

- `build:core` — `packages/core/dist/` created
- `test` — 3 test files pass via **tsx** (not raw `node --test` on `.ts`)
- `build:extension` — `apps/extension/.output/chrome-mv3/` created

**No** GCP billing, hosting deploy, or API keys required for verify.

## Fixes applied

| Issue | Fix |
|-------|-----|
| `ERR_MODULE_NOT_FOUND` for `*.js` in tests | `tsx --test tests/*.test.ts` (imports `../src/`) |
| `node:test` types in `tsc` | `tsconfig.build.json` (src only, `@types/node`); `tsconfig.test.json` for `tests/` |
| WXT duplicate `content` / `options` entrypoints | CSS/TS in `apps/extension/src/`, only `options.html` in `entrypoints/` |
| `pnpm` not on PATH | Root/scripts use `corepack pnpm` |
| `corepack enable` EPERM | Skip global enable; call `corepack pnpm` directly |

## If install fails

```powershell
node -v   # need 18+
corepack pnpm -v
corepack pnpm install --no-frozen-lockfile
```

Then re-run `.\scripts\verify.ps1`.
