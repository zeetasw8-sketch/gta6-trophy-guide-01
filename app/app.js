// Vice City Trophy Atlas — offline tracker for the 55 GTA VI trophies.
// Loads only data/trophies.json from its own folder; progress lives in localStorage.
const KEY = 'vice-city-trophy-atlas-v4';
const params = new URLSearchParams(location.search);

const doc = await (await fetch('data/trophies.json')).json();
const TROPHIES = doc.trophies;
const SOURCES = doc.sources;

const KIND_LABEL = {
  story: 'Story', strangers: 'Strangers & side', activities: 'Activities',
  robbery: 'Robbery & crime', collection: 'Collection', world: 'Hidden moments',
  platinum: 'Platinum & 100%',
};
const GRADE_LABEL = { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };

let saved = {};
try { saved = JSON.parse(localStorage.getItem(KEY) ?? '{}'); } catch { saved = {}; }
let earned = new Set(Array.isArray(saved.earned) ? saved.earned.filter((n) => Number.isInteger(n)) : []);
let spoilerOn = params.get('spoiler') === 'off' ? false : (saved.spoiler ?? true);
let selectedId = null;

const $ = (id) => document.getElementById(id);
const listEl = $('list'), panelBody = $('panel-body');

function persist() {
  localStorage.setItem(KEY, JSON.stringify({ earned: [...earned].sort((a, b) => a - b), spoiler: spoilerOn }));
}
function isHidden(t) { return t.hidden && spoilerOn && !earned.has(t.id); }
function stars(n) { return '★'.repeat(n) + '☆'.repeat(5 - n); }
function hoursText(h) { return h === 0 ? '—' : (Number.isInteger(h) ? `${h} h` : `${h} h`); }
function sourceLink(key) {
  const s = SOURCES[key];
  if (!s) return key;
  return s.url ? `<a href="${s.url}" target="_blank" rel="noopener">${s.name}</a>` : s.name;
}
function countText(t) {
  if (t.count == null) return '';
  if (t.id === 52) return ' · $250,000';
  if (t.id === 53) return ' · $100,000';
  return ` · ${t.count}`;
}

function matches(t) {
  const q = $('q').value.trim().toLowerCase();
  if (q) {
    const hay = `${t.name} ${t.description} ${t.chapter} ${t.guide}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  if ($('grade').value !== 'all' && t.grade !== $('grade').value) return false;
  if ($('kind').value !== 'all' && t.kind !== $('kind').value) return false;
  if ($('status').value === 'earned' && !earned.has(t.id)) return false;
  if ($('status').value === 'remaining' && earned.has(t.id)) return false;
  if ($('missable-only').checked && !t.risk) return false;
  return true;
}

function cardEl(t) {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'card' + (earned.has(t.id) ? ' earned' : '') + (selectedId === t.id ? ' selected' : '') + (isHidden(t) ? ' masked' : '');
  card.dataset.id = t.id;
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.id);
  box.setAttribute('aria-label', `Mark ${t.name} as earned`);
  box.addEventListener('click', (e) => e.stopPropagation());
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.id); else earned.delete(t.id);
    persist(); renderAll();
  });
  const body = document.createElement('span');
  if (isHidden(t)) {
    body.innerHTML = `<span class="masked-name">Hidden trophy</span><br><span class="masked-note">Story trophy — hidden until earned (spoiler protection is on).</span><br><span class="card-meta">Turn spoiler protection off, or earn it, to reveal it.</span>`;
  } else {
    const risk = t.risk === 'missable' ? ' <span class="flag-miss">⚠ POSSIBLY MISSABLE</span>'
      : t.risk === 'watch' ? ' <span class="flag-watch">⚠ watch</span>' : '';
    body.innerHTML = `<span class="card-name">${t.name}</span><br><span class="card-desc">${t.description}</span><br><span class="card-meta">${t.chapter} · ${stars(t.difficulty)} · Est. ${hoursText(t.hours)}${countText(t)}${risk}</span>`;
  }
  const badge = document.createElement('span');
  badge.className = 'badge ' + (isHidden(t) ? 'silver' : t.grade);
  badge.textContent = isHidden(t) ? 'Hidden' : GRADE_LABEL[t.grade];
  card.append(box, body, badge);
  card.addEventListener('click', () => { selectedId = t.id; renderAll(); $('panel').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); });
  return card;
}

function renderList() {
  const shown = TROPHIES.filter(matches);
  listEl.replaceChildren(...shown.map(cardEl));
  $('count').textContent = shown.length === TROPHIES.length
    ? `55 trophies — ${earned.size} earned`
    : `Showing ${shown.length} of 55 trophies — ${earned.size} earned`;
}

function renderPanel() {
  const t = TROPHIES.find((x) => x.id === selectedId);
  if (!t) {
    panelBody.innerHTML = '<p class="panel-hint">Pick a trophy on the left to read its guide, sources, difficulty and time.</p>';
    return;
  }
  if (isHidden(t)) {
    panelBody.innerHTML = `<h2>Hidden trophy</h2><p class="official">This is a story trophy. Spoiler protection hides its name, description and guide until you earn it — or until you switch spoiler protection off above.</p><div class="earn"><button type="button" data-act="earn">Mark as earned</button></div>`;
    panelBody.querySelector('[data-act="earn"]').addEventListener('click', () => { earned.add(t.id); persist(); renderAll(); });
    return;
  }
  const risk = t.risk === 'missable'
    ? `<div class="risk-banner missable"><strong>⚠ POSSIBLY MISSABLE</strong>${t.riskNote}</div>`
    : t.risk === 'watch'
      ? `<div class="risk-banner watch"><strong>⚠ WATCH — do this in time</strong>${t.riskNote}</div>` : '';
  const has = earned.has(t.id);
  panelBody.innerHTML = `
    <span class="badge ${t.grade}">${GRADE_LABEL[t.grade]}</span>
    <h2>${t.name}</h2>
    <p class="official">“${t.description}”</p>
    <p class="facts"><span><b>Where:</b> ${t.chapter}</span><span><b>Difficulty:</b> ${stars(t.difficulty)}</span><span><b>Est.:</b> ${hoursText(t.hours)}</span>${t.count != null ? `<span><b>Count:</b> ${t.id === 52 ? '$250,000' : t.id === 53 ? '$100,000' : t.count}</span>` : ''}<span><b>Kind:</b> ${KIND_LABEL[t.kind]}</span></p>
    <p class="src-line">Sources: ${t.sources.map(sourceLink).join(' · ')}</p>
    ${risk}
    <p class="guide">${t.guide}</p>
    <h3>Sources</h3>
    <ul class="sources">${t.sources.map((k) => `<li>${sourceLink(k)}</li>`).join('')}</ul>
    <div class="earn"><button type="button" data-act="earn" class="${has ? 'earned' : ''}">${has ? '✓ Earned — click to unmark' : 'Mark as earned'}</button></div>`;
  panelBody.querySelector('[data-act="earn"]').addEventListener('click', () => {
    if (earned.has(t.id)) earned.delete(t.id); else earned.add(t.id);
    persist(); renderAll();
  });
}

function renderDash() {
  const left = TROPHIES.filter((t) => !earned.has(t.id));
  const hoursLeft = left.reduce((a, t) => a + t.hours, 0);
  const pct = Math.round((earned.size / TROPHIES.length) * 100);
  $('dash-earned').textContent = earned.size;
  $('dash-pct').textContent = `${pct}%`;
  $('dash-fill').style.width = `${pct}%`;
  $('dash-hours').textContent = `≈${Math.round(hoursLeft)} h`;
  const byGrade = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of left) byGrade[t.grade]++;
  $('dash-grades').textContent = `Left — Platinum ${byGrade.platinum} · Gold ${byGrade.gold} · Silver ${byGrade.silver} · Bronze ${byGrade.bronze}`;
  const atRisk = TROPHIES.filter((t) => t.risk === 'missable' && !earned.has(t.id)).length;
  $('dash-risk').textContent = atRisk ? '1 possibly missable' : 'missable trophy earned ✓';
}

function renderMissable() {
  const wrap = $('missable-list');
  const items = TROPHIES.filter((t) => t.risk).sort((a, b) => (a.risk === 'missable' ? 0 : 1) - (b.risk === 'missable' ? 0 : 1) || a.id - b.id);
  wrap.replaceChildren(...items.map((t) => {
    const div = document.createElement('article');
    div.className = 'miss-card ' + t.risk;
    div.innerHTML = `<span class="tag">${t.risk === 'missable' ? '⚠ Possibly missable' : '⚠ Watch'}</span><h3>${t.name} <span class="badge ${t.grade}">${GRADE_LABEL[t.grade]}</span></h3><p>${t.riskNote}</p><p>${t.guide}</p><p class="src">Sources: ${t.sources.map(sourceLink).join(' · ')}</p>`;
    return div;
  }));
}

function renderSources() {
  const wrap = $('source-list');
  wrap.replaceChildren(...Object.values(SOURCES).map((s) => {
    const div = document.createElement('div');
    div.className = 'source-item';
    div.innerHTML = s.url ? `<a href="${s.url}" target="_blank" rel="noopener">${s.name}</a>` : s.name;
    return div;
  }));
}

function renderAll() {
  $('spoiler-label').textContent = spoilerOn ? 'Spoiler protection ON' : 'Spoiler protection OFF';
  renderDash(); renderList(); renderPanel();
}

function showView(name) {
  document.querySelectorAll('.views button').forEach((b) => b.classList.toggle('active', b.dataset.view === name));
  document.querySelectorAll('.view').forEach((v) => v.classList.toggle('active', v.id === `view-${name}`));
}
document.querySelectorAll('.views button').forEach((b) => b.addEventListener('click', () => showView(b.dataset.view)));

for (const id of ['q', 'grade', 'kind', 'status', 'missable-only']) {
  $(id).addEventListener('input', renderList);
  $(id).addEventListener('change', renderList);
}
$('spoiler').addEventListener('change', () => { spoilerOn = $('spoiler').checked; persist(); renderAll(); });

$('export').addEventListener('click', () => {
  const data = { app: 'vice-city-trophy-atlas', exportedAt: new Date().toISOString(), earned: [...earned].sort((a, b) => a - b) };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
$('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const ids = Array.isArray(data) ? data : data.earned;
    const valid = new Set(TROPHIES.map((t) => t.id));
    earned = new Set((ids ?? []).filter((n) => valid.has(n)));
    persist(); renderAll();
  } catch { alert('That file is not a valid progress export.'); }
  e.target.value = '';
});
$('reset').addEventListener('click', () => {
  if (confirm('Clear all earned trophies?')) { earned = new Set(); persist(); renderAll(); }
});

// Deep links for screenshots and sharing: ?view=roadmap|missable|sources, ?open=<id>, ?grade=, ?kind=, ?q=, ?spoiler=off, ?missable=1
if (params.get('view')) showView(params.get('view'));
if (params.get('grade')) $('grade').value = params.get('grade');
if (params.get('kind')) $('kind').value = params.get('kind');
if (params.get('q')) $('q').value = params.get('q');
if (params.get('missable') === '1') $('missable-only').checked = true;
if (params.get('status')) $('status').value = params.get('status');
$('spoiler').checked = spoilerOn;
const openId = Number(params.get('open'));
if (Number.isInteger(openId) && TROPHIES.some((t) => t.id === openId)) selectedId = openId;

renderAll(); renderMissable(); renderSources();
