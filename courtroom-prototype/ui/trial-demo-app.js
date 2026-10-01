(function () {
'use strict';
// DEMO-001 UI. Presentation only: every state change goes through session.command. No scores, no verdict logic here.
const session = window.FirmDemoSession.createDemoSession({ cases: [window.FirmDemoCase], daily: window.FirmDemoDailyCases, pack: window.FirmDemoKoPack });
const $ = s => document.querySelector(s);
const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let seen = 0, lastError = '';
let draft = { caseId: null, prosecutorId: null, dailyId: null, focusId: null, stanceId: null, consultOpen: false };

function names(t) {
  const r = t.definition.roles, m = { JUDGE: r.judge.name, PROSECUTOR: r.prosecutor.name, DEFENSE: r.defense.name, CLIENT: '의뢰인', VICTIM: '피해자 측' };
  t.definition.witnesses.forEach(w => { m[w.id] = w.name; });
  return m;
}
const isWitness = (t, id) => t.definition.witnesses.some(w => w.id === id);

function run(action, payload) {
  const before = session.projection().trial ? session.projection().trial.records.length : 0;
  const res = session.command(action, payload);
  lastError = res.ok ? '' : res.error;
  if (action === 'reset' || action === 'start') { seen = 0; draft = Object.assign(draft, { focusId: null, stanceId: null, consultOpen: false, dailyId: null }); }
  else seen = res.ok ? before : seen;
  render(res.ok ? (action === 'trial' ? payload.action : action) : null);
}
const trial = (action, payload) => run('trial', { action, payload });

// ---------- header ----------
function renderTop(view) {
  const st = view.state;
  $('#app').classList.toggle('select', st.phase === 'select');
  if (st.phase === 'select') {
    $('#caseTitle').innerHTML = '<b>사건 파일</b> · 맡을 사건과 상대 검사를 고르십시오';
    $('#steps').innerHTML = ''; $('#gauges').innerHTML = '';
    return;
  }
  const t = view.trial, d = t.definition, ts = t.state, p = t.projection;
  $('#caseTitle').innerHTML = '<b>' + esc(d.title) + '</b> · ' + esc(d.charge) + ' · 상대 ' + esc(view.prosecutor.label);
  const w = ts.cursor ? ts.cursor.w : -1;
  const steps = [['prep', '준비'], ['opening', '개회사'], ...d.witnesses.map((x, i) => ['w' + i, x.name]), ['verdict', '판결']];
  const nowKey = ts.phase === 'trial' ? (ts.cursor.part === 'closed' ? 'verdict' : 'w' + w) : ts.phase;
  const nowIdx = steps.map(s => s[0]).indexOf(nowKey);
  $('#steps').innerHTML = steps.map(([k, label], i) => '<li class="' + (i < nowIdx ? 'done' : i === nowIdx ? 'now' : '') + '"' + (i === nowIdx ? ' aria-current="step"' : '') + '>' + esc(label) + '</li>').join('');
  let g = '';
  if (ts.phase === 'trial' || ts.phase === 'verdict') {
    const max = d.credibilityMax, low = p.credibility <= 1;
    g += '<div class="gauge' + (low ? ' low' : '') + '" title="재판장이 변호인을 얼마나 신뢰하는가">재판장 신뢰 <span class="pips" aria-label="재판장 신뢰 ' + p.credibility + '/' + max + '">' + Array.from({ length: max }, (_, i) => '<i class="pip' + (i < p.credibility ? ' on' : '') + '"></i>').join('') + '</span></div>';
  }
  if (t.witness && t.witness.time != null && ts.cursor.part === 'cross') {
    g += '<div class="gauge" title="남은 반대신문 시간">신문 시간 <span class="pips" aria-label="남은 신문 시간 ' + t.witness.timeLeft + '">' + Array.from({ length: t.witness.time }, (_, i) => '<i class="pip time' + (i < t.witness.timeLeft ? ' on' : '') + '"></i>').join('') + '</span></div>';
  }
  $('#gauges').innerHTML = g;
}

// ---------- left: case file ----------
function renderFile(view, freshCards) {
  if (view.state.phase === 'select') { $('#filePanel').innerHTML = ''; return; }
  const t = view.trial;
  const cards = t.cards.length
    ? t.cards.map(c => '<div class="card' + (c.rebuttal ? ' rebuttal' : '') + (freshCards.includes(c.id) ? ' new' : '') + '"><b>' + esc(c.title) + '</b><p>' + esc(c.text) + '</p></div>').join('')
    : '<p class="empty">아직 확보한 자료가 없습니다. 확보한 자료는 법정 질문에 연결해야 기록에 반영됩니다.</p>';
  const ex = t.exhibits.map(x => '<div class="exhibit' + (x.revealed ? '' : ' sealed') + '"><span class="tag">검찰</span><div><b>' + esc(x.title) + '</b><p>' + (x.revealed ? esc(x.content) : '내용 미열람') + '</p></div></div>').join('');
  const client = t.clientStatements.map((c, i) => '<p class="client' + (i > 0 ? ' new' : '') + '">“' + esc(c.text) + '”</p>').join('');
  const st = view.settlement;
  const settle = st ? '<section><h2 class="section">합의</h2><p class="opp">' + (st.filed ? '<b style="color:var(--ok)">' + esc(st.documentLabel) + ' 제출됨</b><br>재판은 계속됩니다.' : st.consult ? '합의 불성립 — 의뢰인의 결정' : '피해자 측 제안 검토 전') + '</p></section>' : '';
  $('#filePanel').innerHTML =
    '<section><h2 class="section">내 준비 자료</h2>' + cards + '</section>' +
    '<section><h2 class="section">검찰 증거목록</h2>' + ex + '</section>' +
    '<section><h2 class="section">의뢰인</h2>' + client + '</section>' + settle +
    '<section><h2 class="section">상대</h2><p class="opp"><b>' + esc(view.prosecutor.label) + '</b><br>' + esc(view.prosecutor.sub) + '</p></section>';
}

// ---------- right: judge memo ----------
function renderMemo(view, freshIds) {
  if (view.state.phase === 'select') { $('#memoPanel').innerHTML = ''; return; }
  const t = view.trial, st = t.state, p = t.projection;
  const started = st.phase === 'trial' || st.phase === 'verdict';
  const issues = p.issues.map(i => {
    const notes = i.notes.slice(-4).map(n => '<li class="' + esc(n.tone) + (freshIds.has(n.recordId) ? ' fresh' : '') + '">' + esc(n.text) + '</li>').join('');
    const lean = started && i.notes.length ? '<p class="lean ' + i.band + '">' + esc(i.memo) + '</p>' : '<p class="lean pending">아직 심리 전</p>';
    return '<div class="issue"><h3>' + esc(i.title) + '</h3>' + lean + (notes ? '<ul class="notes">' + notes + '</ul>' : '') + '</div>';
  }).join('');
  $('#memoPanel').innerHTML = '<div class="notebook" role="note" aria-label="재판장 메모"><h2>재판장 메모</h2><span class="who-writes">어깨너머로 보이는 수첩</span>' + issues + '</div>' +
    '<p class="memo-foot">승산은 숫자로 보이지 않습니다. 밑줄은 입증됨, 물음표는 다툼 있음, 물결선은 의심입니다. <span style="color:#7fa3d6">파란 글씨</span>는 검찰, <span style="color:#d98a6a">붉은 글씨</span>는 변호인에게 유리한 메모입니다.</p>';
}

// ---------- center ----------
function renderSelect(view) {
  const sig = view.files.filter(f => f.kind === 'signature'), daily = view.files.filter(f => f.kind === 'daily');
  if (!draft.caseId && sig.length) draft.caseId = sig[0].id;
  const c = sig.find(x => x.id === draft.caseId);
  const open = daily.find(x => x.id === draft.dailyId);
  const sigCards = sig.map(f => '<div class="file-card signature"><span class="kicker">' + esc(f.file.kicker) + ' · ' + esc(f.charge) + '</span><b>' + esc(f.title) + '</b><p>' + esc(f.file.summary) + '</p></div>').join('');
  const dailyCards = daily.map(f => '<button class="file-card daily" data-action="daily" data-id="' + esc(f.id) + '" aria-expanded="' + (draft.dailyId === f.id) + '"><span class="kicker">일상 사건 · ' + esc(f.area) + '</span><b>' + esc(f.title) + '</b><p>요약 보기</p></button>').join('');
  const dailyOpen = open ? '<div class="daily-open" role="region" aria-label="일상 사건 요약"><h3>' + esc(open.title) + '</h3><p>' + esc(open.summary) + '</p><p>전망 <span class="forecast">' + esc(open.forecast) + '</span> — ' + esc(open.forecastWhy) + '</p><p class="note">일상 사건은 담당자가 자동으로 처리합니다. 이 데모에서는 요약만 보여 줍니다.</p><button class="btn quiet" data-action="daily" data-id="">닫기</button></div>' : '';
  const pros = c.prosecutors.map(x => '<label class="choice"><input type="radio" name="prosecutor" value="' + esc(x.id) + '"' + (draft.prosecutorId === x.id ? ' checked' : '') + '><span>' + esc(x.label) + '<small>' + esc(x.sub) + '</small></span></label>').join('');
  $('#stage').innerHTML = '<div class="desk"><h1 id="phaseTitle" tabindex="-1">사건 파일</h1><p class="lead">이번 주 책상 위의 사건입니다. 대표 사건은 직접 변론합니다.</p>' +
    '<div class="files">' + sigCards + '<div class="daily-list">' + dailyCards + '</div></div>' + dailyOpen +
    '<fieldset class="choice-group" style="border:0;padding:0;margin:0 0 8px"><legend><h3>상대 검사</h3></legend><div class="choices" style="grid-template-columns:repeat(2,1fr)">' + pros + '</div></fieldset>' +
    '<p class="note">' + esc(c.prosecutorNote) + '</p></div>';
}

function linesOf(records) { return records.flatMap(r => r.lines || []); }
function renderStage(view, newRecords) {
  if (view.state.phase === 'select') return renderSelect(view);
  const t = view.trial, st = t.state, nm = names(t);
  if (st.phase === 'prep') return renderPrep(view);
  if (st.phase === 'opening') return renderOpening(view);
  const all = t.records;
  let shown = linesOf(newRecords);
  if (!shown.length) { const last = [...all].reverse().find(r => (r.lines || []).length); shown = last ? last.lines : []; }
  const speaker = shown.length ? shown[shown.length - 1].speaker : null;
  const wid = t.witness ? t.witness.id : t.definition.witnesses[t.definition.witnesses.length - 1].id;
  const wdef = t.definition.witnesses.find(w => w.id === wid);
  const inVerdict = st.phase === 'verdict';
  const who = (side, face, name, sub, extra) => '<div class="who ' + extra + (speaker === side || (side === 'W' && isWitness(t, speaker)) ? ' speaking' : '') + '" data-side="' + side + '"><div class="face" aria-hidden="true">' + esc(face) + '</div><div class="plate">' + esc(name) + '<span>' + esc(sub) + '</span></div></div>';
  const r = t.definition.roles;
  const bench = '<div class="judge-line">' + (speaker === 'JUDGE' ? '▼ 재판장' : '재판장석') + '</div><div class="bench">' +
    who('PROSECUTOR', r.prosecutor.initial, r.prosecutor.name, '검찰', '') +
    who('W', wdef.initial, wdef.name, wdef.role, 'witness' + (st.cursor && ['intro', 'closed'].includes(st.cursor.part) ? ' absent' : '')) +
    who('DEFENSE', r.defense.initial, r.defense.name, '피고인 측', '') + '</div>';
  const dlg = '<div class="dialogue">' + shown.map((l, i) => '<div class="say ' + (isWitness(t, l.speaker) ? 'W' : esc(l.speaker)) + '" style="animation-delay:' + (i * 0.35) + 's"><div class="spk">' + esc(nm[l.speaker] || l.speaker) + '</div><div class="txt">' + esc(l.text) + '</div></div>').join('') + '</div>';
  const history = [...linesOf(view.records), ...linesOf(all)];
  const tr = '<details class="transcript"><summary>공판 조서 (' + history.length + ')</summary><ol>' + history.map(l => '<li><b>' + esc(nm[l.speaker] || l.speaker) + '</b>' + esc(l.text) + '</li>').join('') + '</ol></details>';
  $('#stage').innerHTML = (inVerdict ? renderOutcome(view) : bench + dlg) + tr;
}

function renderOutcome(view) {
  const o = view.outcome;
  const clear = o.key === 'acquittal' || o.key === 'dismissal';
  const list = (xs, empty) => xs.length ? '<ul>' + xs.map(x => '<li>' + esc(x.text) + '</li>').join('') + '</ul>' : '<p class="empty">' + esc(empty) + '</p>';
  const basis = o.judgment.article || (o.offense && o.offense.article) || '';
  const sentence = o.sentence ? '<div class="sentence"><span class="tag">' + esc(o.sentence.disclaimer) + ' · ' + esc(o.sentence.premise) + '</span><div><b>' + esc(o.sentence.label) + '</b> — ' + esc(o.sentence.text) + '</div><p>' + esc(o.sentence.reason) + '</p></div>' : '';
  const why = o.shaken.length ? '<div class="why"><h3>“다툼 있음”인데 왜 유죄인가</h3>' + o.shaken.map(x => '<p>' + esc(x) + '</p>').join('') + '</div>' : '';
  return '<div class="outcome"><div class="kicker">선고 · ' + esc(view.prosecutor.label) + '</div>' +
    '<h1 class="' + (clear ? 'clear' : 'convict') + '" id="verdictTitle" tabindex="-1">' + esc(o.judgment.label) + '</h1>' +
    (o.offense && o.convicted ? '<div class="sub">' + esc(o.offense.label) + (o.sentence ? ' · ' + esc(o.sentence.text) : '') + '</div>' : '') +
    '<p>' + esc(o.text) + '</p>' + (basis ? '<p class="basis">' + esc(basis) + ' · ' + esc(view.pack.label) + ' · 조문 표기는 법률 검수 전</p>' : '') +
    '<ul class="findings">' + o.issues.map(i => '<li><b>' + esc(i.title) + '</b><span class="' + i.band + '">' + esc(i.bandLabel) + ' — ' + esc(i.memo) + '</span></li>').join('') + '</ul>' +
    sentence + why + '</div>' +
    '<p class="review-text">' + esc(o.reviewText) + '</p>' +
    '<div class="review four" aria-label="복기"><section class="good"><h3>당신이 뚫은 것</h3>' + list(o.broke.slice(0, 5), '뚜렷하게 뚫은 곳이 없었습니다.') + '</section>' +
    '<section class="opp"><h3>상대가 막은 것</h3>' + list(o.blocked, '검사가 막거나 다시 세운 것은 없었습니다.') + '</section>' +
    '<section class="bad"><h3>역효과</h3>' + list(o.backfired, '역효과 없음.') + '</section>' +
    '<section class="miss"><h3>놓친 준비</h3>' + list(o.missed, '놓친 준비 없음.') + '</section></div>' +
    '<p class="next"><b>다음에 시도해 볼 것</b>' + esc(o.next) + '</p>';
}

function renderSettlement(view) {
  const st = view.settlement; if (!st) return '';
  let body = '<p class="offer">“' + esc(st.offer.text) + '”</p><p class="note">' + esc(st.note) + '</p>';
  if (st.consult) {
    const nm = { CLIENT: '의뢰인', DEFENSE: '변호인', VICTIM: '피해자 측' };
    body += '<ul class="talk">' + st.consult.lines.map(l => '<li class="' + esc(l.speaker) + '"><b>' + esc(nm[l.speaker]) + '</b>' + esc(l.text) + '</li>').join('') + '</ul>' +
      (st.filed ? '<p class="result ok">합의 성립 · ' + esc(st.documentLabel) + ' 제출. 재판은 계속됩니다.</p>' : '<p class="result no">합의 불성립 — 의뢰인의 결정입니다.</p>');
  } else if (draft.consultOpen && st.available) {
    const c = window.FirmDemoCase.settlement;
    body += '<ul class="talk"><li class="CLIENT"><b>의뢰인</b>' + esc(c.clientQuestion) + '</li><li class="DEFENSE"><b>변호인</b>' + esc(c.lawyerAnswer) + '</li></ul>' +
      '<p class="note">어떻게 조언하시겠습니까? 결정은 의뢰인이 합니다. 상담은 한 번입니다.</p><div class="advice">' +
      st.advice.map(a => '<button class="btn" data-action="consult" data-id="' + esc(a.id) + '">' + esc(a.title) + '</button>').join('') + '</div>';
  } else {
    body += '<div class="row" style="margin-top:8px"><button class="btn danger" data-action="openConsult"' + (st.available ? '' : ' disabled') + '>의뢰인과 상담하기 (' + esc(st.unitLabel) + ' ×' + st.cost + ')</button>' + (st.reason ? '<span class="note">' + esc(st.reason) + '</span>' : '') + '</div>';
  }
  return '<section class="settle" aria-label="합의 제안"><h3>피해자 측 합의 제안 · ' + esc(st.offer.amount) + '</h3>' + body + '</section>';
}

function renderPrep(view) {
  const t = view.trial, d = t.definition, p = t.projection;
  const pips = Array.from({ length: d.prep.budget }, (_, i) => '<i class="pip time' + (i < p.budgetLeft ? ' on' : '') + '"></i>').join('');
  const inv = t.investigations.map(v => '<button class="inv' + (v.done ? ' done' : '') + '" data-action="investigate" data-id="' + esc(v.id) + '"' + (v.done || !v.affordable ? ' disabled' : '') + '><b>' + esc(v.title) + '</b><p>' + esc(v.blurb) + '</p><span class="cost">' + (v.done ? '✓ 완료' : d.prep.unitLabel + ' ×' + v.cost) + '</span></button>').join('');
  $('#stage').innerHTML = '<div class="desk"><h1 id="phaseTitle" tabindex="-1">공판 준비</h1><p class="lead">' + esc(d.prep.deadlineLabel) + '. 반나절 네 번을 쓸 수 있습니다. 어떤 쟁점을 다툴지 정하고 자료를 고르세요. ' + esc(view.hint) + '</p>' +
    '<ul class="brief">' + d.briefing.map(b => '<li>' + esc(b) + '</li>').join('') + '</ul>' +
    '<div class="budget">남은 시간 <span class="pips" aria-label="남은 시간 ' + p.budgetLeft + ' ' + esc(d.prep.unitLabel) + '">' + pips + '</span> ' + p.budgetLeft + ' ' + esc(d.prep.unitLabel) + '</div>' +
    renderSettlement(view) +
    '<div class="inv-grid">' + inv + '</div></div>';
}

function renderOpening(view) {
  const o = view.trial.definition.opening;
  const wname = id => view.trial.definition.witnesses.find(w => w.id === id).name;
  const group = (name, title, items, sub) => '<fieldset class="choice-group" style="border:0;padding:0;margin:0 0 22px"><legend><h3>' + title + '</h3></legend><div class="choices">' + items.map(x => '<label class="choice"><input type="radio" name="' + name + '" value="' + esc(x.id) + '"' + (draft[name + 'Id'] === x.id ? ' checked' : '') + '><span>' + esc(x.title) + (sub ? '<small>' + esc(sub(x)) + '</small>' : '') + '</span></label>').join('') + '</div></fieldset>';
  $('#stage').innerHTML = '<div class="desk"><h1 id="phaseTitle" tabindex="-1">개회사</h1><p class="lead">인정할 사실과 다툴 쟁점을 나눌 수 있습니다. 입장만 고르면 증거가 바뀌지는 않습니다. 한 번 공개한 입장은 되돌릴 수 없습니다.</p>' +
    group('focus', '어디에 신문 시간을 쓸 것인가', o.focus, f => Object.entries(f.time).map(([id, n]) => wname(id) + ' ' + n).join(' · ')) +
    group('stance', '밀침에 대해 무엇이라고 말할 것인가', o.stance) +
    '<p class="speech" id="speechPreview"></p>' +
    (o.caution ? '<p class="warn">' + esc(o.caution) + '</p>' : '') + '</div>';
}

// ---------- bottom bar ----------
function renderBar(view) {
  const err = lastError ? '<p class="warn" role="alert">' + esc(lastError) + '</p>' : '';
  let h = '';
  if (view.state.phase === 'select') {
    const ready = draft.caseId && draft.prosecutorId;
    h = '<div class="bar-head"><span class="label calm">사건 선택</span><span class="sub">' + (ready ? '준비가 됐습니다.' : '상대 검사를 고르십시오.') + '</span></div><div class="row"><button class="btn primary" data-action="start"' + (ready ? '' : ' disabled') + '>' + esc(view.files[0].title) + ' 시작</button></div>';
    $('#bar').innerHTML = err + h; return;
  }
  const t = view.trial, st = t.state, a = t.actions, cardTitle = id => (t.cards.find(c => c.id === id) || { title: id }).title;
  if (st.phase === 'prep') {
    h = '<div class="bar-head"><span class="label calm">준비</span><span class="sub">조사는 되돌릴 수 없습니다. 시간이 남아도 공판에 들어갈 수 있습니다.</span></div><div class="row"><button class="btn primary" data-action="finishPrep">준비 마치고 공판으로</button></div>';
  } else if (st.phase === 'opening') {
    const ready = draft.focusId && draft.stanceId;
    h = '<div class="bar-head"><span class="label calm">개회사</span><span class="sub">' + (ready ? '입장이 정해졌습니다.' : '두 가지를 모두 고르십시오.') + '</span></div><div class="row"><button class="btn primary" data-action="open"' + (ready ? '' : ' disabled') + '>개회사 하고 공판 시작</button></div>';
  } else if (st.phase === 'verdict') {
    h = '<div class="row"><button class="btn primary" data-action="reset">사건 파일로 돌아가기</button></div>';
  } else if (st.pending && st.pending.type === 'objection') {
    h = '<div class="bar-head"><span class="label">⏸ 개입 순간</span><span class="sub">질문의 문제를 지적하는 절차입니다. 이의가 받아들여져도 사건 사실이 곧바로 바뀌지는 않습니다. 근거 없는 이의는 재판장의 신뢰를 잃습니다.</span></div><div class="row"><button class="btn danger" data-action="object">이의 있습니다 — ' + esc(st.pending.ground) + '</button><button class="btn" data-action="pass">넘어간다</button></div>';
  } else if (st.pending && st.pending.type === 'rebuttal') {
    h = '<div class="bar-head"><span class="label">⏸ 재반대신문 기회</span><span class="sub">검사가 확인된 한계를 다시 좁혔습니다. 준비한 자료로 되받을 수 있습니다.</span></div><div class="row"><button class="btn danger" data-action="rebut">' + esc(st.pending.title) + '</button><button class="btn" data-action="skipRebut">넘어간다</button></div>';
  } else if (st.cursor.part === 'cross') {
    const ap = a.approaches.map(x => '<button class="btn approach" data-action="approach" data-id="' + esc(x.id) + '"' + (x.available ? '' : ' disabled') + '><b>' + esc(x.title) + '</b><small>' + esc(x.reason || x.hint) + '</small><span class="chips">' + (x.cards.length ? x.cards.map(c => '<span class="chip">' + esc(cardTitle(c)) + '</span>').join('') : x.requires.length ? '<span class="chip miss">자료 필요</span>' : '') + '</span></button>').join('');
    const pr = a.presses.map(x => '<button class="btn press' + (x.kind === 'overreach' ? ' over' : '') + '" data-action="press" data-id="' + esc(x.id) + '"' + (x.available ? '' : ' disabled') + '><em>' + (x.kind === 'overreach' ? '끝까지 몰아붙인다' : '결론을 요구한다') + '</em><span>“' + esc(x.question) + '”</span></button>').join('');
    h = '<div class="bar-head"><span class="label">반대신문 · ' + esc(t.witness.name) + '</span><span class="sub">남은 시간 ' + t.witness.timeLeft + ' · 확인한 내용을 바탕으로 다음 질문을 고르세요. 여기서 마치면 현재 기록이 남습니다.</span></div><div class="approach-grid">' + ap + '</div><div class="press-row">' + pr + '<button class="btn quiet" data-action="endCross">이상입니다</button></div>';
  } else if (a.verdict) {
    h = '<div class="bar-head"><span class="label calm">변론 종결</span><span class="sub">선고 단계로 진행하면 이번 심리에 자료를 더 제출할 수 없습니다.</span></div><div class="row"><button class="btn primary" data-action="verdict">판결 선고</button></div>';
  } else if (a.continue) {
    const part = st.cursor.part, label = part === 'intro' ? '증인 입정' : part === 'redirect' ? '검사 재주신문' : '검사 주신문';
    h = '<div class="bar-head"><span class="label calm">' + label + '</span><span class="sub">흐름을 지켜보십시오. 결정할 순간에 멈춥니다.</span></div><div class="row"><button class="btn primary" data-action="continue">계속 ▸</button></div>';
  }
  $('#bar').innerHTML = err + h;
}

function render(action) {
  const view = session.projection();
  const records = view.trial ? view.trial.records : [];
  const newRecords = records.slice(seen);
  const freshIds = new Set(newRecords.map(r => r.id));
  const freshCards = newRecords.filter(r => r.kind === 'investigation').flatMap(r => r.cards);
  renderTop(view); renderFile(view, freshCards); renderMemo(view, freshIds); renderStage(view, newRecords); renderBar(view);
  seen = records.length;
  updateSpeech();
  const phaseChanged = ['start', 'finishPrep', 'open', 'verdict', 'reset'].includes(action);
  if (phaseChanged) { const el = $('#verdictTitle') || $('#phaseTitle'); if (el) el.focus({ preventScroll: true }); window.scrollTo({ top: 0 }); }
  else if (action) { const primary = $('#bar .btn.primary, #bar .btn.danger, #bar .approach:not(:disabled)'); if (primary) primary.focus({ preventScroll: true }); }
}

function updateSpeech() {
  const el = $('#speechPreview'); if (!el) return;
  const view = session.projection(), o = window.FirmDemoCase.variants[view.state.prosecutorId].opening;
  const f = o.focus.find(x => x.id === draft.focusId), s = o.stance.find(x => x.id === draft.stanceId);
  el.textContent = f || s ? [f && f.text, s && s.text, o.close].filter(Boolean).join(' ') : '입장을 고르면 개회사 문장이 여기에 조립됩니다.';
}

document.addEventListener('click', e => {
  const b = e.target.closest('button[data-action]'); if (!b || b.disabled) return;
  const act = b.dataset.action, id = b.dataset.id;
  if (act === 'daily') { draft.dailyId = id || null; render(null); }
  else if (act === 'start') run('start', { caseId: draft.caseId, prosecutorId: draft.prosecutorId });
  else if (act === 'openConsult') { draft.consultOpen = true; render(null); }
  else if (act === 'consult') run('consult', { adviceId: id });
  else if (act === 'investigate') trial('investigate', { id });
  else if (act === 'finishPrep') trial('finishPrep');
  else if (act === 'open') trial('open', { focusId: draft.focusId, stanceId: draft.stanceId });
  else if (act === 'continue') trial('continue');
  else if (act === 'object') trial('objection', { object: true });
  else if (act === 'pass') trial('objection', { object: false });
  else if (act === 'approach') trial('approach', { id });
  else if (act === 'press') trial('press', { id });
  else if (act === 'endCross') trial('endCross');
  else if (act === 'rebut') trial('rebut', { use: true });
  else if (act === 'skipRebut') trial('rebut', { use: false });
  else if (act === 'verdict') trial('verdict');
  else if (act === 'reset') run('reset');
});
document.addEventListener('change', e => {
  if (e.target.name === 'prosecutor') draft.prosecutorId = e.target.value;
  if (e.target.name === 'focus') draft.focusId = e.target.value;
  if (e.target.name === 'stance') draft.stanceId = e.target.value;
  updateSpeech(); renderBar(session.projection());
});
document.addEventListener('keydown', e => {
  if ((e.key === ' ' || e.key === 'Enter') && (e.target === document.body || e.target.id === 'phaseTitle')) {
    const c = $('#bar [data-action="continue"]'); if (c) { e.preventDefault(); c.click(); }
  }
});
render();
})();
