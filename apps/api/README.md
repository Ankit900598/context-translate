# Context Translate API (optional — Pro / hosted)

**Not required for v1.** This repo does **not** deploy or enable billing unless you ask — see [LOCAL_ONLY.md](../../LOCAL_ONLY.md).

Extension and desktop use **BYOK**: your Google API key stays on your device and clients call Google directly.

Use this server only if you later want:

- Team-hosted translation (one server key, rate limits)
- Users without their own GCP account
- Centralized billing

## Run locally (optional)

```bash
# From repo root
cp .env.example .env
# Set GOOGLE_TRANSLATE_API_KEY in .env
pnpm dev:api
```

Wire clients to this URL only if you add a "Hosted API" mode in settings (not in v1).
