# Vice City Trophy Atlas — GTA VI 55-trophy guide & tracker

[![gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/zeetasw8-sketch/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/zeetasw8-sketch/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline web app that guides and tracks all **55 PlayStation 5 trophies** of
Grand Theft Auto VI — every guide written in this atlas's own words and cited
to the published guides it draws on. Built for the
[make.fun bounty](https://make.fun/bounty/gta6-trophy-guide-01)
**gta6-trophy-guide-01** ($250, 50 places paid).

## What it does

- **Checklist of the official 55** — 1 Platinum, 2 Gold, 6 Silver, 46 Bronze,
  with official names, descriptions and grades as PlayStation publishes them
  (frozen 18 Nov 2026; Exophase and PSNProfiles agree on all 55). Saved in the
  browser (localStorage), with export/import of progress as JSON.
- **A cited guide for every trophy** — what to do, where and how, when it can
  be missed, plus difficulty, time estimate and chapter/mission reference.
  Each guide names its sources beside it (PowerPyx, KeenGamer, PushSquare,
  GTASpotter, Insider Gaming, EGamers). Methods no published guide has
  confirmed yet are marked *unconfirmed* instead of invented.
- **Platinum roadmap in 4 phases** — prep and save discipline, story
  (60–80 h), the 100% checklist (~100 h), clean-up (10–20 h) — benchmarked
  against PowerPyx (~200 h, difficulty 4/10).
- **Missable audit** — 1 trophy flagged as possibly missable (Positive Mental
  Attitude: the Chapter 1 balcony meditation) and 7 more to watch, each with
  its reason and source. Everything else is obtainable in one playthrough.
- **Dashboard** — progress %, estimated hours left to Platinum, trophies left
  per grade, missable status.
- **Filters that work** — grade, kind (story / strangers / activities /
  robbery / collection / world / platinum), status, missable-only, live
  search — and **spoiler protection ON by default**, hiding the 28 hidden
  story trophies until earned.
- **Offline by design** — static HTML/CSS/JS, no network requests at all.
  No Rockstar logo or artwork anywhere.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no dependencies. Any static server works — the app only
fetches `data/trophies.json` from its own folder.

Deep links (handy for screenshots and sharing):

- `?view=roadmap` — the Platinum roadmap
- `?view=missable` — the missable audit
- `?view=sources` — sources & notes
- `?open=28` — open the guide for trophy 28
- `?grade=silver`, `?kind=story`, `?q=vault`, `?missable=1`, `?spoiler=off`

## Hand in (what the grader runs)

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

This copies `app/` and `screenshots/` to `out/` and writes
`out/dossier.json` with the kit's vendored `buildDossier`.

## Files

- `app/index.html`, `app/style.css`, `app/app.js` — the guide (written for this entry)
- `app/data/trophies.json` — the official 55 + this atlas's guides, sources, difficulty, time, missable flags
- `screenshots/` — 4 real renders of the app running (1280×800)
- `main.ts` — hand-in program; `serve.ts` — local dev server; `vendor/makefun-frontend.ts` — kit copy, unchanged
- `.makefun/owner.json` — entry owner wallet

## License

MIT — see [LICENSE](LICENSE).
