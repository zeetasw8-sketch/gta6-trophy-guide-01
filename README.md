# Leonida Trophy Atlas — GTA VI trophy guide & tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01) [![rank](https://make.fun/badge/gta6-trophy-guide-01/zeetasw8-sketch/gta6-trophy-guide-01/rank.svg)](https://make.fun/c/gta6-trophy-guide-01) [![reward](https://make.fun/badge/gta6-trophy-guide-01/zeetasw8-sketch/gta6-trophy-guide-01/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

An offline, open-source trophy guide and tracker for **Grand Theft Auto VI** on PlayStation 5 — built for the [gta6-trophy-guide-01 bounty on make.fun](https://make.fun/c/gta6-trophy-guide-01) ($250, 50 paid places).

## What it is

A static web app (HTML + CSS + JS, no build step, no network) that opens in a desktop browser and works with the network off:

- **All 55 official trophies** — every name, official description and grade (1 Platinum, 2 Gold, 6 Silver, 46 Bronze), with 28 hidden story trophies flagged.
- **Checklist saved in your browser** (localStorage) — tick trophies off as you earn them, with a live progress bar and count.
- **Export / import** your progress as JSON, plus a reset.
- **Filters** by grade, by kind (Story, Side & Strangers, Activities, Robbery & Crime, Collection & World, Hidden Moments, Platinum & 100%) and by status (earned / remaining), plus search.
- **Spoiler protection** — on by default: hidden story trophies stay masked until you earn them (or turn the toggle off).
- **Platinum roadmap** — four phases in order (story → stranger strands → open-world grind → 100% completion), with hours and the trophies each phase covers.
- **Missable warnings** — the Chapter 1 balcony meditation (Positive Mental Attitude), the time-sensitive Yago race (Strangers & Freaks), and the save discipline that covers the rest. Stated honestly: the game is a day old and no full missable list is proven yet.
- **A guide for every trophy** — written in this project's own words: what to do, where and how, and when it can be missed, each citing its source.

## Run it

```sh
node serve.ts        # serves app/ on http://localhost:8080
```

Or open `app/index.html` directly in a browser. No install, no network.

## How it is graded

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json` with the kit's vendored library, as the kit asks:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Screenshots in `screenshots/` are real screens of the app running (1280×800): the checklist, the Platinum roadmap, a trophy guide panel, and the Silver filter view.

## Verified (rebuild, 20 Nov 2026)

Playwright Chromium headless: 55 cards render, 0 external requests, 0 console/page errors. Spoiler OFF reveals "Just Like Paradise"; search "vault" returns 1 result (Maximum Withdrawal); export downloads `gta6-trophy-progress.json` and import restores it; 3 missable cards, 7 source links, 4 roadmap phases. `makefun check` run from the level-27 kit before submission.

## Data & sources

Trophy names, descriptions, grades and hidden flags are the official PlayStation 5 list as published 18 November 2026 (Exophase / PSNProfiles). Methods and counts were drawn from the sources listed in the app's Sources & Notes tab (Planet GTA 6, Output Lag, Push Square, KeenGamer, TrueAchievements) and are cited per trophy. All guide text is this project's own words — nothing copies another guide's text.

## Disclaimer

Unofficial fan project. Not affiliated with, endorsed by, or connected to Rockstar Games. No Rockstar logos or official artwork are used. Grand Theft Auto and GTA are trademarks of Take-Two Interactive.

## License

MIT — see [LICENSE](LICENSE).
