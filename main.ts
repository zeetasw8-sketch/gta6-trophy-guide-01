// Leonida Trophy Atlas — hand-in program (Node 22, standard library only).
//
// The guide itself is plain static files: app/ is served as-is, app/index.html opens
// in desktop Chrome and works with the network off, and its trophy list and guides
// live in app/data/trophies.json. This program's only job is to hand that entry in:
// copy app/ and screenshots/ from beside this file into /output (or, outside the
// grader, into MAKEFUN_OUTPUT_DIR) and write /output/dossier.json with the vendored
// make.fun library, exactly as the scorer rebuilds it. Nothing here is installed,
// fetched or generated: the library vendor/makefun-frontend.ts stays untouched,
// because the scorer requires dossier.json to be byte for byte what its own copy
// of the library writes.
//
// Run it locally with:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Serve the app locally with:  node serve.ts   (then open http://localhost:8080)

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The entry must carry 3 or 4 screenshots; refuse to hand in an empty set rather
// than produce a dossier the gate would reject for a missing cover.
const shotDir = join(here, 'screenshots');
const shots = existsSync(shotDir) ? readdirSync(shotDir).filter((name) => !name.startsWith('.')) : [];
if (shots.length < 3 || shots.length > 4) {
  throw new Error(`expected 3 or 4 screenshots in screenshots/, found ${shots.length}`);
}

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(shotDir)) cpSync(shotDir, join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes;
// the others refuse an entry the scorer would refuse (more than 4 screenshots or one
// over 256 KiB; more than 993 files and directories in app/ or 48 MiB of app files:
// app/ counts beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
console.log(`Leonida Trophy Atlas handed in: ${shots.length} screenshots, dossier written to ${join(out, 'dossier.json')}`);
