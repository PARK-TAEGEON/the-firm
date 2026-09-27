(function () {
'use strict';
// v0.10 Adversarial Trial UI. Presentation only: every state change goes through service.command.
const service = window.FirmTrialService.createTrialService(window.FirmTrialCase);
const $ = s => document.querySelector(s);
const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let seen = 0, lastError = '', draft = { focusId: null, stanceId: null };

function names(view) {
  const r = view.definition.roles, m = { JUDGE: r.judge.name, PROSECUTOR: r.prosecutor.name, DEFENSE: r.defense.name };
  view.definition.witnesses.forEach(w => { m[w.id] = w.name; });
  return m;
}
const isWitness = (view, id) => view.definition.witnesses.some(w => w.id === id);

function run(action, payload) {
  const before = service.projection().records.length;
  const res = service.command(action, payload);
  lastError = res.ok ? '' : res.error;
  if (action === 'reset') { seen = 0; draft = { focusId: null, stanceId: null }; }
  else seen = res.ok ? before : seen;
  render(res.ok ? action : null);
}

// ---------- header ----------
function renderTop(view) {
  const d = view.definition, st = view.state, p = view.projection;
  $('#caseTitle').innerHTML = '<b>' + esc(d.title) + '</b> · ' + esc(d.charge) + ' · 피고인 ' + esc(d.client.name);
  const w = st.cursor ? st.cursor.w : -1;
  const steps = [['prep', '준비'], ['opening', '개회사'], ...d.witnesses.map((x, i) => ['w' + i, x.name]), ['verdict', '판결']];
  const nowKey = st.phase === 'trial' ? (st.cursor.part === 'closed' ? 'verdict' : 'w' + w) : st.phase;
  const order = steps.map(s => s[0]), nowIdx = order.indexOf(nowKey);
  $('#steps').innerHTML = steps.map(([k, label], i) => '<li class="' + (i < nowIdx ? 'done' : i === nowIdx ? 'now' : '') + '"' + (i === nowIdx ? ' aria-current="step"' : '') + '>' + esc(label) + '</li>').join('');
  let g = '';
  if (st.phase === 'trial' || st.phase === 'verdict') {
    const max = d.credibilityMax, low = p.credibility <= 1;
    g += '<div class="gauge' + (low ? ' low' : '') + '" title="재판장이 변호인을 얼마나 신뢰하는가">재판장 신뢰 <span class="pips" aria-label="재판장 신뢰 ' + p.credibility + '/' + max + '">' + Array.from({ length: max }, (_, i) => '<i class="pip' + (i < p.credibility ? ' on' : '') + '"></i>').join('') + '</span></div>';
  }
  if (view.witness && view.witness.time != null && st.cursor.part === 'cross') {
    g += '<div class="gauge" title="남은 반대신문 시간">신문 시간 <span class="pips" aria-label="남은 신문 시간 ' + view.witness.timeLeft + '">' + Array.from({ length: view.witness.time }, (_, i) => '<i class="pip time' + (i < view.witness.timeLeft ? ' on' : '') + '"></i>').join('') + '</span></div>';
  }
  $('#gauges').innerHTML = g;
}

// ---------- left: case file ----------
function renderFile(view, fresh) {
  const cards = view.cards.length
    ? view.cards.map(c => '<div class="card' + (c.rebuttal ? ' rebuttal' : '') + (fresh.cards.includes(c.id) ? ' new' : '') + '"><b>' + esc(c.title) + '</b><p>' + esc(c.text) + '</p></div>').join('')
    : '<p class="empty">아직 확보한 자료가 없습니다. 조사를 해야 법정에서 쓸 수 있습니다.</p>';
  const ex = view.exhibits.map(x => '<div class="exhibit' + (x.revealed ? '' : ' sealed') + '"><span class="tag">검찰</span><div><b>' + esc(x.title) + '</b><p>' + (x.revealed ? esc(x.content) : '내용 미열람') + '</p></div></div>').join('');
  const client = view.clientStatements.map((c, i) => '<p class="client' + (i > 0 ? ' new' : '') + '">“' + esc(c.text) + '”</p>').join('');
  const pr = view.definition.roles.prosecutor;
  $('#filePanel').innerHTML =
    '<section><h2 class="section">내 준비 자료</h2>' + cards + '</section>' +
    '<section><h2 class="section">검찰 증거목록</h2>' + ex + '</section>' +
    '<section><h2 class="section">의뢰인 ' + esc(view.definition.client.name) + '</h2>' + client + '</section>' +
    '<section><h2 class="section">상대</h2><p class="opp"><b>' + esc(pr.name) + '</b><br>' + esc(pr.styleLabel) + '</p></section>';
}

// ---------- right: judge memo ----------
function renderMemo(view, freshIds) {
  const st = view.state, p = view.projection;
  const started = st.phase === 'trial' || st.phase === 'verdict';
  const issues = p.issues.map(i => {
    const notes = i.notes.slice(-4).map(n => '<li class="' + esc(n.tone) + (freshIds.has(n.recordId) ? ' fresh' : '') + '">' + esc(n.text) + '</li>').join('');
    const hasTrialNotes = i.notes.length > 0;
    const lean = started && hasTrialNotes ? '<p class="lean ' + i.band + '">' + esc(i.memo) + '</p>' : '<p class="lean pending">아직 심리 전</p>';
    return '<div class="issue"><h3>' + esc(i.title) + '</h3>' + lean + (notes ? '<ul class="notes">' + notes + '</ul>' : '') + '</div>';
  }).join('');
  $('#memoPanel').innerHTML = '<div class="notebook" role="note" aria-label="재판장 메모"><h2>재판장 메모</h2><span class="who-writes">어깨너머로 보이는 수첩</span>' + issues + '</div>' +
    '<p class="memo-foot">승산은 숫자로 보이지 않습니다. 재판장이 무엇을 적고 무엇에 물음표를 치는지 보십시오. <span style="color:#7fa3d6">파란 글씨</span>는 검찰, <span style="color:#d98a6a">붉은 글씨</span>는 변호인에게 유리한 메모입니다.</p>';
}

// ---------- center: stage ----------
function linesOf(records) { return records.flatMap(r => r.lines || []); }
function renderStage(view, newRecords) {
  const st = view.state, nm = names(view);
  if (st.phase === 'prep') return renderPrep(view);
  if (st.phase === 'opening') return renderOpening(view);
  const all = view.records;
  let shown = linesOf(newRecords);
  if (!shown.length) { const last = [...all].reverse().find(r => (r.lines || []).length); shown = last ? last.lines : []; }
  const speaker = shown.length ? shown[shown.length - 1].speaker : null;
  const wid = view.witness ? view.witness.id : view.definition.witnesses[view.definition.witnesses.length - 1].id;
  const wdef = view.definition.witnesses.find(w => w.id === wid);
  const inVerdict = st.phase === 'verdict';
  const who = (side, face, name, sub, extra) => '<div class="who ' + extra + (speaker === side || (side === 'W' && isWitness(view, speaker)) ? ' speaking' : '') + '" data-side="' + side + '"><div class="face" aria-hidden="true">' + esc(face) + '</div><div class="plate">' + esc(name) + '<span>' + esc(sub) + '</span></div></div>';
  const r = view.definition.roles;
  const bench = '<div class="judge-line' + (speaker === 'JUDGE' ? '' : '') + '">' + (speaker === 'JUDGE' ? '▼ 재판장' : '재판장석') + '</div><div class="bench">' +
    who('PROSECUTOR', r.prosecutor.initial, r.prosecutor.name, '검찰', '') +
    who('W', inVerdict ? '⚖' : wdef.initial, inVerdict ? '판결 선고' : wdef.name, inVerdict ? '' : wdef.role, 'witness' + (st.cursor && ['intro', 'closed'].includes(st.cursor.part) && !inVerdict ? ' absent' : '')) +
    who('DEFENSE', r.defense.initial, r.defense.name, '피고인 ' + view.definition.client.name, '') + '</div>';
  const dlg = '<div class="dialogue">' + shown.map((l, i) => '<div class="say ' + (isWitness(view, l.speaker) ? 'W' : esc(l.speaker)) + '" style="animation-delay:' + (i * 0.35) + 's"><div class="spk">' + esc(nm[l.speaker] || l.speaker) + '</div><div class="txt">' + esc(l.text) + '</div></div>').join('') + '</div>';
  const history = linesOf(all);
  const tr = '<details class="transcript"><summary>공판 조서 (' + history.length + ')</summary><ol>' + history.map(l => '<li><b>' + esc(nm[l.speaker] || l.speaker) + '</b>' + esc(l.text) + '</li>').join('') + '</ol></details>';
  let verdict = '';
  if (inVerdict) {
    const v = view.verdict, rv = view.review;
    const list = (xs, empty) => xs.length ? '<ul>' + xs.map(x => '<li>' + esc(x.text) + '</li>').join('') + '</ul>' : '<p class="empty">' + empty + '</p>';
    verdict = '<div class="verdict"><div class="kicker">선고</div><h1 class="' + v.outcome + '" id="verdictTitle" tabindex="-1">' + esc(v.text.title) + '</h1><p>' + esc(v.text.text) + '</p><ul class="findings">' + v.issues.map(i => '<li><b>' + esc(i.title) + '</b><span class="' + i.band + '">' + esc(i.memo) + '</span></li>').join('') + '</ul></div>' +
      '<div class="review" aria-label="복기"><section class="good"><h3>유효했던 것</h3>' + list(rv.effective.slice(0, 5), '뚜렷한 성과가 없었습니다.') + '</section>' +
      '<section class="bad"><h3>역효과</h3>' + list(rv.backfired, '역효과 없음.') + '</section>' +
      '<section class="miss"><h3>놓친 준비</h3>' + list(rv.missed, '놓친 준비 없음.') + '</section></div>';
  }
  $('#stage').innerHTML = (inVerdict ? verdict : bench + dlg) + tr;
}

function renderPrep(view) {
  const d = view.definition, p = view.projection;
  const pips = Array.from({ length: d.prep.budget }, (_, i) => '<i class="pip time' + (i < p.budgetLeft ? ' on' : '') + '"></i>').join('');
  const inv = view.investigations.map(v => '<button class="inv' + (v.done ? ' done' : '') + '" data-action="investigate" data-id="' + esc(v.id) + '"' + (v.done || !v.affordable ? ' disabled' : '') + '><b>' + esc(v.title) + '</b><p>' + esc(v.blurb) + '</p><span class="cost">' + (v.done ? '✓ 완료' : d.prep.unitLabel + ' ×' + v.cost) + '</span></button>').join('');
  $('#stage').innerHTML = '<div class="desk"><h1 id="phaseTitle" tabindex="-1">공판 준비</h1><p class="lead">' + esc(d.prep.deadlineLabel) + '. 모든 조사를 할 시간은 없습니다. 조사한 것만 법정에서 무기가 됩니다.</p>' +
    '<ul class="brief">' + d.briefing.map(b => '<li>' + esc(b) + '</li>').join('') + '</ul>' +
    '<div class="budget">남은 시간 <span class="pips" aria-label="남은 시간 ' + p.budgetLeft + ' ' + esc(d.prep.unitLabel) + '">' + pips + '</span> ' + p.budgetLeft + ' ' + esc(d.prep.unitLabel) + '</div>' +
    '<div class="inv-grid">' + inv + '</div></div>';
}

function renderOpening(view) {
  const o = view.definition.opening;
  const wname = id => view.definition.witnesses.find(w => w.id === id).name;
  const group = (name, title, items, sub) => '<fieldset class="choice-group" style="border:0;padding:0;margin:0 0 22px"><legend><h3>' + title + '</h3></legend><div class="choices">' + items.map(x => '<label class="choice"><input type="radio" name="' + name + '" value="' + esc(x.id) + '"' + (draft[name + 'Id'] === x.id ? ' checked' : '') + '><span>' + esc(x.title) + (sub ? '<small>' + esc(sub(x)) + '</small>' : '') + '</span></label>').join('') + '</div></fieldset>';
  $('#stage').innerHTML = '<div class="desk"><h1 id="phaseTitle" tabindex="-1">개회사</h1><p class="lead">한 번 공개한 입장은 되돌릴 수 없습니다. 검사는 당신의 말과 어긋나는 순간을 기다립니다.</p>' +
    group('focus', '어디에 신문 시간을 쓸 것인가', o.focus, f => Object.entries(f.time).map(([id, t]) => wname(id) + ' ' + t).join(' · ')) +
    group('stance', '칼에 대해 무엇이라고 말할 것인가', o.stance) +
    '<p class="speech" id="speechPreview"></p>' +
    (o.caution ? '<p class="warn">' + esc(o.caution) + '</p>' : '') + '</div>';
}

// ---------- bottom: intervention bar ----------
function renderBar(view) {
  const st = view.state, a = view.actions, cardTitle = id => (view.cards.find(c => c.id === id) || { title: id }).title;
  const err = lastError ? '<p class="warn" role="alert">' + esc(lastError) + '</p>' : '';
  let h = '';
  if (st.phase === 'prep') {
    h = '<div class="bar-head"><span class="label calm">준비</span><span class="sub">조사는 되돌릴 수 없습니다. 시간이 남아도 공판에 들어갈 수 있습니다.</span></div><div class="row"><button class="btn primary" data-action="finishPrep">준비 마치고 공판으로</button></div>';
  } else if (st.phase === 'opening') {
    const ready = draft.focusId && draft.stanceId;
    h = '<div class="bar-head"><span class="label calm">개회사</span><span class="sub">' + (ready ? '입장이 정해졌습니다.' : '두 가지를 모두 고르십시오.') + '</span></div><div class="row"><button class="btn primary" data-action="open"' + (ready ? '' : ' disabled') + '>개회사 하고 공판 시작</button></div>';
  } else if (st.phase === 'verdict') {
    h = '<div class="row"><button class="btn primary" data-action="reset">다시 준비부터</button></div>';
  } else if (st.pending && st.pending.type === 'objection') {
    h = '<div class="bar-head"><span class="label">⏸ 개입 순간</span><span class="sub">검사의 질문에 이의를 제기할 수 있습니다. 근거 없는 이의는 재판장의 신뢰를 잃습니다.</span></div><div class="row"><button class="btn danger" data-action="object">이의 있습니다 — ' + esc(st.pending.ground) + '</button><button class="btn" data-action="pass">넘어간다</button></div>';
  } else if (st.pending && st.pending.type === 'rebuttal') {
    h = '<div class="bar-head"><span class="label">⏸ 재반대신문 기회</span><span class="sub">검사의 수습을 준비한 자료로 되받을 수 있습니다.</span></div><div class="row"><button class="btn danger" data-action="rebut">' + esc(st.pending.title) + '</button><button class="btn" data-action="skipRebut">넘어간다</button></div>';
  } else if (st.cursor.part === 'cross') {
    const ap = a.approaches.map(x => '<button class="btn approach" data-action="approach" data-id="' + esc(x.id) + '"' + (x.available ? '' : ' disabled') + '><b>' + esc(x.title) + '</b><small>' + esc(x.reason || x.hint) + '</small><span class="chips">' + (x.cards.length ? x.cards.map(c => '<span class="chip">' + esc(cardTitle(c)) + '</span>').join('') : x.requires.length ? '<span class="chip miss">자료 필요</span>' : '') + '</span></button>').join('');
    const pr = a.presses.map(x => '<button class="btn press' + (x.kind === 'overreach' ? ' over' : '') + '" data-action="press" data-id="' + esc(x.id) + '"' + (x.available ? '' : ' disabled') + '><em>' + (x.kind === 'overreach' ? '끝까지 몰아붙인다' : '결론을 요구한다') + '</em><span>“' + esc(x.question) + '”</span></button>').join('');
    h = '<div class="bar-head"><span class="label">반대신문 · ' + esc(view.witness.name) + '</span><span class="sub">남은 시간 ' + view.witness.timeLeft + ' · 접근법을 고르고, 근거가 쌓이면 결론을 요구하십시오.</span></div><div class="approach-grid">' + ap + '</div><div class="press-row">' + pr + '<button class="btn quiet" data-action="endCross">이상입니다</button></div>';
  } else if (a.verdict) {
    h = '<div class="bar-head"><span class="label calm">변론 종결</span><span class="sub">모든 증인신문이 끝났습니다.</span></div><div class="row"><button class="btn primary" data-action="verdict">판결 선고</button></div>';
  } else if (a.continue) {
    const part = st.cursor.part, label = part === 'intro' ? '증인 입정' : part === 'redirect' ? '검사 재주신문' : '검사 주신문';
    h = '<div class="bar-head"><span class="label calm">' + label + '</span><span class="sub">흐름을 지켜보십시오. 결정할 순간에 멈춥니다.</span></div><div class="row"><button class="btn primary" data-action="continue">계속 ▸</button></div>';
  }
  $('#bar').innerHTML = err + h;
}

function render(action) {
  const view = service.projection();
  const newRecords = view.records.slice(seen);
  const freshIds = new Set(newRecords.map(r => r.id));
  const freshCards = newRecords.filter(r => r.kind === 'investigation').flatMap(r => r.cards);
  renderTop(view); renderFile(view, { cards: freshCards }); renderMemo(view, freshIds); renderStage(view, newRecords); renderBar(view);
  seen = view.records.length;
  updateSpeech(view);
  const phaseChanged = ['finishPrep', 'open', 'verdict', 'reset'].includes(action);
  if (phaseChanged) { const t = $('#verdictTitle') || $('#phaseTitle'); if (t) t.focus({ preventScroll: true }); window.scrollTo({ top: 0 }); }
  else if (action) { const primary = $('#bar .btn.primary, #bar .btn.danger, #bar .approach:not(:disabled)'); if (primary) primary.focus({ preventScroll: true }); }
}

function updateSpeech(view) {
  const el = $('#speechPreview'); if (!el) return;
  const o = window.FirmTrialCase.opening, f = o.focus.find(x => x.id === draft.focusId), s = o.stance.find(x => x.id === draft.stanceId);
  el.textContent = f || s ? [f && f.text, s && s.text, o.close].filter(Boolean).join(' ') : '입장을 고르면 개회사 문장이 여기에 조립됩니다.';
}

document.addEventListener('click', e => {
  const b = e.target.closest('button[data-action]'); if (!b || b.disabled) return;
  const act = b.dataset.action, id = b.dataset.id;
  if (act === 'investigate') run('investigate', { id });
  else if (act === 'finishPrep') run('finishPrep');
  else if (act === 'open') run('open', { focusId: draft.focusId, stanceId: draft.stanceId });
  else if (act === 'continue') run('continue');
  else if (act === 'object') run('objection', { object: true });
  else if (act === 'pass') run('objection', { object: false });
  else if (act === 'approach') run('approach', { id });
  else if (act === 'press') run('press', { id });
  else if (act === 'endCross') run('endCross');
  else if (act === 'rebut') run('rebut', { use: true });
  else if (act === 'skipRebut') run('rebut', { use: false });
  else if (act === 'verdict') run('verdict');
  else if (act === 'reset') run('reset');
});
document.addEventListener('change', e => {
  if (e.target.name === 'focus') draft.focusId = e.target.value;
  if (e.target.name === 'stance') draft.stanceId = e.target.value;
  updateSpeech(); renderBar(service.projection());
});
document.addEventListener('keydown', e => {
  if ((e.key === ' ' || e.key === 'Enter') && (e.target === document.body || e.target.id === 'phaseTitle')) {
    const c = $('#bar [data-action="continue"]'); if (c) { e.preventDefault(); c.click(); }
  }
});
render();
})();
