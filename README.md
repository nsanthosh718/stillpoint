# Stillpoint

The quiet center of a loud day. A single-page React app powered by Claude Fable 5
that follows your day's natural arc:

| Arc | Feature | AI |
|-----|---------|-----|
| Morning | Brain dump → prioritized top-3 plan with a worry reframe | Claude |
| Midday | Calendar/task triage: keep, shorten, decline, focus block | Claude |
| Anytime | Guided box-breathing micro-break (4-4-4-4) | Local |
| Move | Pilates + air-rower sessions sized to your minutes & energy, with weekly log | Claude |
| Evening | Reflection journal → mood score, win, insight + 14-day trend | Claude |

All data lives in `localStorage`. No backend, no accounts.

## Quick start

```bash
npm install
cp .env.example .env   # add your Anthropic API key
npm run dev
```

## Configuration

- `VITE_ANTHROPIC_API_KEY` — your Anthropic API key
- `VITE_ANTHROPIC_MODEL` — defaults to `claude-fable-5`; swap to
  `claude-sonnet-4-6` or `claude-haiku-4-5-20251001` for cheaper runs

## Security note

For local/personal use the app calls the Anthropic API directly from the
browser using the `anthropic-dangerous-direct-browser-access` header. If you
deploy this publicly, move the API call behind a tiny proxy (Cloudflare
Worker, Fly.io FastAPI route, or Azure Function) so your key never ships to
the client, and delete that header from `src/lib/claude.js`.

## Architecture

```
src/
  lib/claude.js      # Messages API client + strict-JSON helper
  lib/storage.js     # namespaced localStorage + dated logs
  features/          # one file per day-arc feature
  App.jsx            # shell, time-aware default tab
```

Each AI feature is a system prompt + JSON contract, so tuning behavior is a
one-file edit. Add a new feature by dropping a component into `features/` and
registering it in the `TABS` array.

## Roadmap ideas

- Export mood log to CSV
- PWA manifest for home-screen install
- Optional Google Calendar read via MCP/proxy for automatic triage input
