# Leonida Trophy Atlas — GTA VI Trophy Guide & Tracker

[![make.fun bounty](https://img.shields.io/badge/make.fun-gta6--trophy--guide--01-5b2a6e)](https://make.fun/c/gta6-trophy-guide-01)

An offline guide and checklist tracker for all **55 Grand Theft Auto VI trophies** on
PlayStation 5: 1 Platinum, 2 Gold, 6 Silver, 46 Bronze — 28 of them hidden on
PlayStation until earned. No online trophies: the whole list is single-player.

## What it does

- **Every trophy, with its official name, description and grade** exactly as
  PlayStation publishes them (tracked by Exophase and PSNProfiles), plus a guide
  in our own words for each one: what to do, where, how, and when it can be missed.
- **A source beside every guide.** Each trophy's guide names where its facts come
  from (trophy-list trackers, roadmap guides, Rockstar's own site). A source is
  cited, never copied.
- **Roadmap to the Platinum in 4 phases** — story first, then the people, then the
  activities, then the long counts — built from the official descriptions: which
  story chapters and missions, which collectibles and counts, in what order.
- **The one missable trophy, flagged.** Positive Mental Attitude (meditate at all
  18 spots) has its first meditation in Chapter 1. Every other trophy is story,
  replayable, or repeatable in free roam.
- **Tracker:** tick trophies off and progress is saved in the browser
  (localStorage). Export it to a `.json` file and import it back.
- **Filters** by kind (story, missable, collectibles, activities, online), by grade,
  by earned / not earned yet, plus full-text search.
- **Spoiler setting:** story trophy names and descriptions stay hidden until earned.
- **Fully offline:** static files under `app/`, no build step, no network request
  at run time. Served by any static server with `app/` at its root.

## Try it

```sh
node serve.ts        # serves app/ on http://localhost:8080
```

## Check it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts   # writes out/dossier.json
```

The dossier must stay under 1.5 MiB. The app was tested headless in Chromium
(Playwright): 55 cards render, 0 external requests, 0 console or page errors,
spoiler on/off, search, every filter, export + import round-trip, and the
missable flag all pass. Screenshots in `screenshots/` are fresh renders of this
code, taken with the same browser: the checklist with trophies ticked by real
clicks, the roadmap, one trophy's guide with its sources, and the silver filter.

## Files

- `app/index.html` — the guide page
- `app/app.js` — checklist, filters, spoiler setting, export/import, roadmap render
- `app/style.css` — the look (own design, system fonts, no images)
- `app/data/trophies.json` — the 55 trophies, the roadmap, and the source list
- `main.ts` — hand-in program: copies `app/` + `screenshots/` to `/output` and
  writes `/output/dossier.json` (run with `MAKEFUN_OUTPUT_DIR=out node main.ts`)
- `screenshots/` — 4 screenshots of the app, taken by its maker
- `shots.json` — which views the screenshots were taken of

## Sources

The trophy list as reported 18 November 2026 (GGRecon reporting the Exophase
list; Sixshore; HowToVideoGame; GTA Vice City Hub; Of Zen and Computing; Heyday
News), plus Rockstar Games' official GTA VI site and the official Leonida map.
Full links live in the app's Sources section and in `app/data/trophies.json`.

## License

MIT — see `LICENSE`. Unofficial fan guide; not affiliated with Rockstar Games,
Sony or PlayStation. No Rockstar logo, artwork or game screenshot is used.
