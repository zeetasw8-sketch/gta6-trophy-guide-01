// Leonida Trophy Atlas — offline tracker. No network calls; data is local trophies.json.
// Progress lives only in this browser (localStorage). Nothing is uploaded anywhere.
const STORE_KEY = 'gta6-trophy-guide-v1';
const CATEGORY_LABELS = {
  story: 'Story', side: 'Side & Strangers', activities: 'Activities',
  robbery: 'Robbery & Crime', collection: 'Collection & World',
  moments: 'Hidden Moments', platinum: 'Platinum & 100%',
};
const GRADE_LETTER = { platinum: 'P', gold: 'G', silver: 'S', bronze: 'B' };

let DATA = null;
let earned = new Set();

function loadEarned() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((n) => Number.isInteger(n)));
  } catch {
    return new Set();
  }
}
function saveEarned() {
  localStorage.setItem(STORE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

const $ = (sel) => document.querySelector(sel);
const grid = $('#grid');

async function main() {
  const res = await fetch('data/trophies.json');
  DATA = await res.json();
  earned = loadEarned();
  wireControls();
  applyUrlParams();
  renderAll();
}

function wireControls() {
  for (const id of ['search', 'grade-filter', 'category-filter', 'status-filter', 'spoiler']) {
    document.getElementById(id).addEventListener('input', renderList);
    document.getElementById(id).addEventListener('change', renderList);
  }
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => switchView(tab.dataset.view));
  });
  document.getElementById('export-btn').addEventListener('click', exportProgress);
  document.getElementById('import-btn').addEventListener('click', () => document.getElementById('import-file').click());
  document.getElementById('import-file').addEventListener('change', importProgress);
  document.getElementById('reset-btn').addEventListener('click', () => {
    if (confirm('Clear all earned trophies? This cannot be undone.')) {
      earned = new Set();
      saveEarned();
      renderAll();
    }
  });
  document.getElementById('panel-close').addEventListener('click', closePanel);
  document.getElementById('panel-backdrop').addEventListener('click', closePanel);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePanel(); });
}

function applyUrlParams() {
  const p = new URLSearchParams(location.search);
  const view = p.get('view');
  if (view && document.querySelector(`.tab[data-view="${view}"]`)) switchView(view);
  if (p.get('spoiler') === 'off') document.getElementById('spoiler').checked = false;
  if (p.get('grade')) document.getElementById('grade-filter').value = p.get('grade');
  if (p.get('category')) document.getElementById('category-filter').value = p.get('category');
  if (p.get('status')) document.getElementById('status-filter').value = p.get('status');
  if (p.get('search')) document.getElementById('search').value = p.get('search');
  const open = Number(p.get('open'));
  if (open) setTimeout(() => openPanel(open), 150);
}

function switchView(view) {
  document.querySelectorAll('.tab').forEach((t) => {
    const on = t.dataset.view === view;
    t.classList.toggle('active', on);
    t.setAttribute('aria-selected', String(on));
  });
  document.querySelectorAll('.view').forEach((v) => v.classList.toggle('active', v.id === 'view-' + view));
}

function isMissable(t) {
  return DATA.missable.some((m) => m.trophy === t.id);
}
function missableNote(t) {
  return DATA.missable.find((m) => m.trophy === t.id) || null;
}

function filteredTrophies() {
  const q = document.getElementById('search').value.trim().toLowerCase();
  const grade = document.getElementById('grade-filter').value;
  const cat = document.getElementById('category-filter').value;
  const status = document.getElementById('status-filter').value;
  return DATA.trophies.filter((t) => {
    if (grade !== 'all' && t.grade !== grade) return false;
    if (cat !== 'all' && t.category !== cat) return false;
    if (status === 'earned' && !earned.has(t.id)) return false;
    if (status === 'remaining' && earned.has(t.id)) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))) return false;
    return true;
  });
}

function renderStats() {
  const n = earned.size;
  const pct = Math.round((n / DATA.trophies.length) * 100);
  document.getElementById('stat-earned').textContent = n;
  document.getElementById('stat-pct').textContent = pct + '%';
  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('progress-note').textContent =
    n === 0 ? '0 of 55 earned — the Platinum, Vice Got a Price!, is 54 trophies away.'
    : n === 55 ? 'All 55 earned — Vice Got a Price! is yours. Leonida Legend.'
    : `${n} of 55 earned — ${55 - n} to go until the Platinum.`;
}

function renderList() {
  const spoilerOn = document.getElementById('spoiler').checked;
  const list = filteredTrophies();
  const hiddenCount = DATA.trophies.filter((t) => t.hidden).length;
  const masked = spoilerOn ? list.filter((t) => t.hidden && !earned.has(t.id)).length : 0;
  document.getElementById('count').textContent =
    `Showing ${list.length} of 55 trophies · ${earned.size} earned`;
  document.getElementById('spoiler-note').textContent = spoilerOn
    ? `Spoiler protection is ON: ${hiddenCount} hidden story trophies stay masked until you earn them (or turn the toggle off). ${masked} masked in this view.`
    : 'Spoiler protection is OFF: hidden story trophies, mission names and the ending are visible.';
  document.getElementById('empty').hidden = list.length !== 0;
  grid.innerHTML = '';
  for (const t of list) {
    grid.appendChild(cardFor(t, spoilerOn));
  }
}

function cardFor(t, spoilerOn) {
  const masked = spoilerOn && t.hidden && !earned.has(t.id);
  const isEarned = earned.has(t.id);
  const el = document.createElement('article');
  el.className = 'card' + (isEarned ? ' earned' : '') + (masked ? ' hidden-card' : '');
  const medal = document.createElement('div');
  medal.className = 'medal ' + t.grade;
  medal.textContent = GRADE_LETTER[t.grade];
  medal.title = t.grade;
  const head = document.createElement('div');
  const h = document.createElement('h3');
  h.textContent = masked ? 'Hidden story trophy' : t.name;
  const desc = document.createElement('p');
  desc.className = 'desc';
  desc.textContent = masked ? 'Hidden until earned — turn spoiler protection off to reveal it.' : t.description;
  head.appendChild(h);
  head.appendChild(desc);
  const top = document.createElement('div');
  top.className = 'card-top';
  top.appendChild(medal);
  top.appendChild(head);
  el.appendChild(top);

  const tags = document.createElement('div');
  tags.className = 'tags';
  const gradeTag = document.createElement('span');
  gradeTag.className = 'tag grade-' + t.grade;
  gradeTag.textContent = t.grade;
  tags.appendChild(gradeTag);
  const catTag = document.createElement('span');
  catTag.className = 'tag';
  catTag.textContent = CATEGORY_LABELS[t.category];
  tags.appendChild(catTag);
  const gsTag = document.createElement('span');
  gsTag.className = 'tag gs';
  gsTag.textContent = t.gamerscore + 'G';
  tags.appendChild(gsTag);
  if (t.hidden) {
    const ht = document.createElement('span');
    ht.className = 'tag hidden-t';
    ht.textContent = 'hidden';
    tags.appendChild(ht);
  }
  if (isMissable(t)) {
    const mt = document.createElement('span');
    mt.className = 'tag missable';
    mt.textContent = 'missable';
    tags.appendChild(mt);
  }
  el.appendChild(tags);

  const foot = document.createElement('div');
  foot.className = 'card-foot';
  const label = document.createElement('label');
  label.className = 'check';
  const cb = document.createElement('input');
  cb.type = 'checkbox';
  cb.checked = isEarned;
  cb.setAttribute('aria-label', 'Mark ' + t.name + ' as earned');
  cb.addEventListener('change', () => {
    if (cb.checked) earned.add(t.id); else earned.delete(t.id);
    saveEarned();
    renderAll();
  });
  label.appendChild(cb);
  label.appendChild(document.createTextNode(isEarned ? 'Earned' : 'Mark earned'));
  foot.appendChild(label);
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'guide-btn';
  btn.textContent = 'Guide';
  btn.disabled = masked;
  btn.addEventListener('click', () => openPanel(t.id));
  foot.appendChild(btn);
  el.appendChild(foot);
  return el;
}

function renderRoadmap() {
  const host = document.getElementById('roadmap');
  host.innerHTML = '';
  for (const phase of DATA.roadmap) {
    const done = phase.trophies.filter((id) => earned.has(id)).length;
    const box = document.createElement('div');
    box.className = 'phase';
    const head = document.createElement('div');
    head.className = 'phase-head';
    const num = document.createElement('span');
    num.className = 'phase-num';
    num.textContent = 'Phase ' + phase.phase;
    const h = document.createElement('h3');
    h.textContent = phase.title;
    const hours = document.createElement('span');
    hours.className = 'hours';
    hours.textContent = phase.hours + ' · ' + done + '/' + phase.trophies.length + ' done';
    head.append(num, h, hours);
    const p = document.createElement('p');
    p.textContent = phase.body;
    const chips = document.createElement('div');
    chips.className = 'phase-trophies';
    for (const id of phase.trophies) {
      const t = DATA.trophies.find((x) => x.id === id);
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'tag' + (earned.has(id) ? ' done' : '');
      chip.textContent = (earned.has(id) ? '✓ ' : '') + t.name + ' (' + t.grade + ')';
      chip.addEventListener('click', () => openPanel(id));
      chips.appendChild(chip);
    }
    box.append(head, p, chips);
    host.appendChild(box);
  }
}

function renderMissable() {
  const host = document.getElementById('missable-list');
  host.innerHTML = '';
  for (const m of DATA.missable) {
    const t = DATA.trophies.find((x) => x.id === m.trophy);
    const box = document.createElement('div');
    box.className = 'miss-card';
    const risk = document.createElement('p');
    risk.className = 'risk';
    risk.textContent = 'Risk: ' + m.risk;
    const h = document.createElement('h3');
    h.textContent = t.name + ' — ' + t.grade;
    const p = document.createElement('p');
    p.textContent = m.body;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = 'Open the full guide';
    btn.addEventListener('click', () => openPanel(t.id));
    box.append(risk, h, p, btn);
    host.appendChild(box);
  }
}

function renderSources() {
  const host = document.getElementById('sources');
  host.innerHTML = '';
  for (const s of DATA.sources) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = s.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = s.label + ' — ' + s.url;
    li.appendChild(a);
    host.appendChild(li);
  }
}

function openPanel(id) {
  const t = DATA.trophies.find((x) => x.id === id);
  if (!t) return;
  const body = document.getElementById('panel-body');
  body.innerHTML = '';
  const tags = document.createElement('div');
  tags.className = 'tags';
  for (const [cls, txt] of [
    ['grade-' + t.grade, t.grade],
    ['', CATEGORY_LABELS[t.category]],
    ['gs', t.gamerscore + 'G'],
  ]) {
    const s = document.createElement('span');
    s.className = 'tag ' + cls;
    s.textContent = txt;
    tags.appendChild(s);
  }
  if (t.hidden) {
    const s = document.createElement('span');
    s.className = 'tag hidden-t';
    s.textContent = 'hidden trophy';
    tags.appendChild(s);
  }
  const h = document.createElement('h2');
  h.textContent = t.name;
  const desc = document.createElement('p');
  desc.className = 'desc';
  desc.textContent = 'Official description: “' + t.description + '”';
  const hGuide = document.createElement('h4');
  hGuide.textContent = 'How to earn it';
  const guide = document.createElement('p');
  guide.textContent = t.guide;
  body.append(tags, h, desc, hGuide, guide);
  const note = missableNote(t);
  if (note) {
    const warn = document.createElement('div');
    warn.className = 'warn';
    const strong = document.createElement('strong');
    strong.textContent = 'Missable — ' + note.risk + '. ';
    warn.append(strong, document.createTextNode(note.body));
    body.appendChild(warn);
  }
  const hSrc = document.createElement('h4');
  hSrc.textContent = 'Source';
  const src = document.createElement('p');
  src.className = 'src';
  src.textContent = t.source + ' Full source list: see the Sources & Notes tab.';
  body.append(hSrc, src);
  const label = document.createElement('label');
  label.className = 'check';
  const cb = document.createElement('input');
  cb.type = 'checkbox';
  cb.checked = earned.has(t.id);
  cb.addEventListener('change', () => {
    if (cb.checked) earned.add(t.id); else earned.delete(t.id);
    saveEarned();
    renderAll();
  });
  label.append(cb, document.createTextNode(earned.has(t.id) ? ' Earned — nice work.' : ' Mark as earned'));
  body.appendChild(label);
  document.getElementById('panel').hidden = false;
  document.getElementById('panel-backdrop').hidden = false;
}

function closePanel() {
  document.getElementById('panel').hidden = true;
  document.getElementById('panel-backdrop').hidden = true;
}

function exportProgress() {
  const payload = {
    app: 'Leonida Trophy Atlas',
    game: 'Grand Theft Auto VI',
    exported_at: new Date().toISOString(),
    earned: [...earned].sort((a, b) => a - b),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

function importProgress(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result));
      const ids = Array.isArray(data) ? data : data.earned;
      if (!Array.isArray(ids)) throw new Error('bad file');
      const valid = new Set(DATA.trophies.map((t) => t.id));
      const next = new Set(ids.filter((n) => valid.has(n)));
      earned = next;
      saveEarned();
      renderAll();
      alert(`Imported ${next.size} earned trophies.`);
    } catch {
      alert('That file is not a valid progress export from this guide.');
    }
    event.target.value = '';
  };
  reader.readAsText(file);
}

function renderAll() {
  renderStats();
  renderList();
  renderRoadmap();
  renderMissable();
  renderSources();
}

main();
