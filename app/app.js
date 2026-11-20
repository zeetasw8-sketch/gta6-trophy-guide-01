// Leonida Trophy Atlas: loads app/data/trophies.json, renders the checklist, the roadmap
// and the sources, and keeps the player's progress in localStorage (exportable, importable).
// No network request is ever made except the one relative fetch of the app's own data file.

const STORE_KEY = 'leonida-trophy-atlas-v3';
const PREFS_KEY = 'leonida-trophy-atlas-v3-prefs';
const GRADE_ORDER = { platinum: 0, gold: 1, silver: 2, bronze: 3 };

const $ = (id) => document.getElementById(id);
const cardsEl = $('cards');
const emptyEl = $('empty');

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const sourcesById = new Map(doc.sources.map((s) => [s.id, s]));
const byId = new Map(trophies.map((t) => [t.id, t]));

// --- saved state -------------------------------------------------------------
let earned = new Set(readStoredArray(STORE_KEY).filter((name) => trophies.some((t) => t.name === name)));
const prefs = readPrefs();

function readStoredArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function readPrefs() {
  const fallback = { kind: 'all', grade: 'all', show: 'all', spoilers: true, search: '' };
  try {
    return { ...fallback, ...(JSON.parse(localStorage.getItem(PREFS_KEY) ?? '{}') ?? {}) };
  } catch {
    return fallback;
  }
}

function saveEarned() {
  localStorage.setItem(STORE_KEY, JSON.stringify([...earned]));
}

function savePrefs() {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

// URL params give a shareable starting view (?kind=silver&spoilers=off&search=bank).
// They win over saved prefs for this visit only; the controls then take over.
applyUrlParams();

function applyUrlParams() {
  const params = new URLSearchParams(location.search);
  if (params.has('kind')) prefs.kind = params.get('kind');
  if (params.has('grade')) prefs.grade = params.get('grade');
  if (params.has('show')) prefs.show = params.get('show');
  if (params.has('search')) prefs.search = params.get('search');
  if (params.has('spoilers')) prefs.spoilers = params.get('spoilers') !== 'off';
}

// --- progress ----------------------------------------------------------------
function gradeCounts(list) {
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of list) counts[t.grade] += 1;
  return counts;
}

function renderProgress() {
  const total = trophies.length;
  const got = trophies.filter((t) => earned.has(t.name));
  const counts = gradeCounts(got);
  $('earned-count').textContent = got.length;
  $('progress-fill').style.width = `${Math.round((got.length / total) * 100)}%`;
  $('progress-bar').setAttribute('aria-valuenow', String(got.length));
  $('progress-sub').textContent =
    `Platinum ${counts.platinum}/1 · Gold ${counts.gold}/2 · Silver ${counts.silver}/6 · Bronze ${counts.bronze}/46`;
  const next = trophies.find((t) => !earned.has(t.name));
  $('progress-next').textContent = got.length === total
    ? 'All 55 earned — Leonida Legend. The Platinum is yours.'
    : `Next: ${next.name} — ${shortNextHint(next)}`;
}

function shortNextHint(trophy) {
  if (trophy.id === 28) return 'meditate in Chapter 1 before you leave it — the one missable.';
  if (trophy.kind === 'story') return 'play the story; it unlocks on its own.';
  if (trophy.count) return `${trophy.count} to go — see its guide below.`;
  return 'see its guide below.';
}

// --- roadmap -----------------------------------------------------------------
function renderRoadmap() {
  const phasesEl = $('phases');
  phasesEl.replaceChildren();
  for (const phase of doc.roadmap) {
    const li = document.createElement('li');
    const heading = document.createElement('h3');
    heading.textContent = phase.title;
    const text = document.createElement('p');
    text.textContent = phase.text;
    const chips = document.createElement('div');
    chips.className = 'phase-trophies';
    for (const id of phase.trophies) {
      const chip = document.createElement('span');
      chip.textContent = byId.get(id).name;
      chips.append(chip);
    }
    li.append(heading, text, chips);
    phasesEl.append(li);
  }
}

// --- sources -----------------------------------------------------------------
function renderSources() {
  const list = $('source-list');
  list.replaceChildren();
  for (const source of doc.sources) {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = source.url;
    link.textContent = source.url;
    link.target = '_blank';
    link.rel = 'noopener';
    li.append(document.createTextNode(`${source.name} — `), link);
    list.append(li);
  }
}

// --- cards -------------------------------------------------------------------
function storyHidden(trophy) {
  return prefs.spoilers && trophy.kind === 'story' && !earned.has(trophy.name);
}

function visibleTrophies() {
  const needle = prefs.search.trim().toLowerCase();
  return trophies.filter((t) => {
    if (prefs.kind === 'missable' && !t.missable) return false;
    if (prefs.kind !== 'all' && prefs.kind !== 'missable' && t.kind !== prefs.kind) return false;
    // kind "online" matches nothing: the list has no online trophies, so the
    // filter above already empties it and the empty note below explains why.
    if (prefs.grade !== 'all' && t.grade !== prefs.grade) return false;
    if (prefs.show === 'earned' && !earned.has(t.name)) return false;
    if (prefs.show === 'todo' && earned.has(t.name)) return false;
    if (needle && !`${t.name} ${t.description} ${t.guide}`.toLowerCase().includes(needle)) return false;
    return true;
  });
}

function gradeBadge(trophy) {
  const badge = document.createElement('span');
  badge.className = `grade-badge ${trophy.grade}`;
  badge.textContent = trophy.grade;
  return badge;
}

function tagRow(trophy) {
  const row = document.createElement('div');
  row.className = 'tag-row';
  const kind = document.createElement('span');
  kind.className = 'tag';
  kind.textContent = trophy.kind === 'story' ? 'Story' : trophy.kind === 'collectibles' ? 'Collectibles' : 'Activities';
  row.append(kind);
  if (trophy.missable) {
    const miss = document.createElement('span');
    miss.className = 'tag missable';
    miss.textContent = '⚠ Missable';
    row.append(miss);
  }
  if (trophy.hidden) {
    const hid = document.createElement('span');
    hid.className = 'tag hidden-tag';
    hid.textContent = 'Hidden on PS5';
    row.append(hid);
  }
  if (trophy.count) {
    const count = document.createElement('span');
    count.className = 'tag count-tag';
    count.textContent = trophy.count >= 1000 ? `$${trophy.count.toLocaleString('en-US')}` : `× ${trophy.count}`;
    row.append(count);
  }
  return row;
}

function sourceLine(trophy) {
  const line = document.createElement('p');
  line.className = 'card-sources';
  line.append(document.createTextNode('Sources: '));
  trophy.sources.forEach((id, index) => {
    const source = sourcesById.get(id);
    if (!source) return;
    if (index > 0) line.append(document.createTextNode(' · '));
    const link = document.createElement('a');
    link.href = source.url;
    link.textContent = source.name.split(' — ')[0];
    link.title = source.name;
    link.target = '_blank';
    link.rel = 'noopener';
    line.append(link);
  });
  return line;
}

function trophyCard(trophy) {
  const card = document.createElement('article');
  card.className = 'card' + (earned.has(trophy.name) ? ' earned' : '');
  card.dataset.name = trophy.name;

  const head = document.createElement('div');
  head.className = 'card-head';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(trophy.name);
  box.setAttribute('aria-label', `Earned: ${trophy.name}`);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(trophy.name);
    else earned.delete(trophy.name);
    saveEarned();
    renderAll();
  });
  const titleBox = document.createElement('div');
  titleBox.className = 'card-title';
  const title = document.createElement('h3');
  title.textContent = storyHidden(trophy) ? '??? — hidden story trophy' : trophy.name;
  titleBox.append(title);
  if (!storyHidden(trophy)) {
    const official = document.createElement('p');
    official.className = 'official';
    official.textContent = `“${trophy.description}”`;
    titleBox.append(official);
  }
  head.append(box, titleBox, gradeBadge(trophy));
  card.append(head, tagRow(trophy));

  if (storyHidden(trophy)) {
    const note = document.createElement('p');
    note.className = 'spoiler-note';
    note.textContent = 'Spoiler hidden until earned — turn “Hide story spoilers” off above, or tick the box once you have earned it in the game.';
    card.append(note);
  } else {
    const label = document.createElement('p');
    label.className = 'guide-label';
    label.textContent = 'Guide';
    const guide = document.createElement('p');
    guide.className = 'guide';
    guide.textContent = trophy.guide;
    card.append(label, guide, sourceLine(trophy));
  }
  return card;
}

function renderCards() {
  const list = visibleTrophies();
  cardsEl.replaceChildren(...list.map(trophyCard));
  emptyEl.hidden = list.length !== 0;
  $('result-count').textContent = `Showing ${list.length} of 55 trophies · ${earned.size} earned`;
}

function renderAll() {
  renderProgress();
  renderCards();
}

// --- controls ----------------------------------------------------------------
function syncControls() {
  $('search').value = prefs.search;
  $('kind').value = prefs.kind;
  $('grade').value = prefs.grade;
  $('show').value = prefs.show;
  $('spoilers').checked = prefs.spoilers;
}

$('search').addEventListener('input', (event) => { prefs.search = event.target.value; savePrefs(); renderCards(); });
$('kind').addEventListener('change', (event) => { prefs.kind = event.target.value; savePrefs(); renderCards(); });
$('grade').addEventListener('change', (event) => { prefs.grade = event.target.value; savePrefs(); renderCards(); });
$('show').addEventListener('change', (event) => { prefs.show = event.target.value; savePrefs(); renderCards(); });
$('spoilers').addEventListener('change', (event) => { prefs.spoilers = event.target.checked; savePrefs(); renderCards(); });

$('export').addEventListener('click', () => {
  const payload = {
    app: 'Leonida Trophy Atlas',
    game: 'Grand Theft Auto VI',
    exportedAt: new Date().toISOString(),
    earned: [...earned].sort(),
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'leonida-trophy-progress.json';
  link.click();
  URL.revokeObjectURL(url);
});

$('import').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const names = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(names)) throw new Error('no earned list');
    const known = new Set(trophies.map((t) => t.name));
    const imported = names.filter((name) => known.has(name));
    if (imported.length === 0) throw new Error('no known trophies');
    earned = new Set(imported);
    saveEarned();
    renderAll();
  } catch {
    alert('That file is not a Leonida Trophy Atlas progress export.');
  }
  event.target.value = '';
});

$('reset').addEventListener('click', () => {
  if (!confirm('Clear all earned trophies? This only clears this browser.')) return;
  earned = new Set();
  saveEarned();
  renderAll();
});

// --- boot --------------------------------------------------------------------
renderRoadmap();
renderSources();
syncControls();
renderAll();
