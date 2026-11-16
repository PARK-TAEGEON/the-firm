(function (root) {
'use strict';
// PORTFOLIO-001 화면. 상태는 session 서비스가 소유하고, 여기서는 view를 그리고 명령을 보낼 뿐이다.
// 판정·경제 계산을 하지 않는다. 화면 전용 상태(ui)는 저장하지 않는다.
const Game = root.FirmGame, Audio = root.FirmAudio, Gloss = root.FirmGlossary;
const SAVE_KEY = 'thefirm.portfolio.v1';
const $ = sel => document.querySelector(sel);
const app = $('#app'), modalRoot = $('#modal'), popRoot = $('#pops'), toastRoot = $('#toasts');

let game = Game.createGame();
let ui = freshUi();
function freshUi() { return { intro: 0, memo: false, modal: null, seenSeq: 0, opening: {}, opinions: {}, prosecutor: 'novice', lastCred: null, lastScene: null, showTitle: false, confirmPrep: false }; }

// ---------- 작은 도구 ----------
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const won = n => (n < 0 ? '−' : '') + '₩' + Math.abs(Math.round(n)).toLocaleString('ko-KR');
const signed = n => (n > 0 ? '+' : n < 0 ? '−' : '') + '₩' + Math.abs(Math.round(n)).toLocaleString('ko-KR');
const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토'];
function dayLabel(firm, index) {
  if (index == null) return '이번 주 안에 못 끝냄';
  const iso = firm.dates[Math.min(index, firm.dates.length - 1)], d = new Date(iso + 'T00:00:00');
  return (d.getMonth() + 1) + '/' + d.getDate() + ' ' + WEEKDAY[d.getDay()];
}
// 용어에 설명 버튼을 단다. 한 문단에서 같은 용어는 한 번만 건다.
function gloss(text) {
  const seen = new Set();
  return esc(text).replace(Gloss.pattern, m => {
    if (seen.has(m)) return m; seen.add(m);
    return '<span class="term" tabindex="0" role="button" data-term="' + m + '">' + m + '</span>';
  });
}
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(game.exportSave())); } catch (e) { /* 저장소를 쓸 수 없으면 이번 창에서만 진행 */ } }
function readSave() { try { const raw = localStorage.getItem(SAVE_KEY); return raw ? JSON.parse(raw) : null; } catch (e) { return null; } }
function toast(text, kind) {
  const el = document.createElement('div'); el.className = 'toast ' + (kind || ''); el.textContent = text;
  toastRoot.appendChild(el); setTimeout(() => el.classList.add('out'), 4200); setTimeout(() => el.remove(), 4800);
}
function run(action, payload, sound) {
  const res = game.command(action, payload);
  if (!res.ok) { toast(res.error, 'bad'); Audio.play('alert'); return false; }
  if (sound) Audio.play(sound);
  save(); render(); return true;
}
const court = (action, payload, sound) => run('court', { action: 'trial', payload: { action, payload: payload || {} } }, sound);

// ---------- 공통 틀 ----------
const STEPS = [['intro', '상담'], ['office', '사무소의 한 주'], ['prep', '공판 준비'], ['court', '법정'], ['result', '결산']];
function stepIndex(scene) { return scene === 'weekend' ? 1 : STEPS.findIndex(s => s[0] === scene); }
function frame(v, body, right) {
  const at = stepIndex(v.scene);
  return '<header class="top"><button class="brand" data-act="title" aria-label="처음 화면으로">THE FIRM<small>법률사무소</small></button>' +
    '<ol class="rail">' + STEPS.map((s, i) => '<li class="' + (i < at ? 'done' : i === at ? 'now' : '') + '"><i>0' + (i + 1) + '</i>' + s[1] + '</li>').join('') + '</ol>' +
    '<div class="top-right">' + (right || '') + '<button class="icon" data-act="mute" aria-label="소리 켜기/끄기">' + (Audio.isMuted() ? '소리 꺼짐' : '소리 켜짐') + '</button></div></header>' +
    '<main class="scene scene-' + v.scene + (ui.entering ? ' enter' : '') + '">' + body + '</main>';
}
const portrait = (id, cls) => '<span class="face ' + (cls || '') + '" style="background-image:url(assets/art/' + (['lee', 'kim', 'park', 'han'].includes(id) ? 'staff-' + id + '.jpg' : 'silhouette.svg') + ')"></span>';

// ---------- 타이틀 ----------
function title(v) {
  const saved = readSave(), canResume = v.scene !== 'title' || (saved && saved.scene !== 'title');
  return '<main class="title' + (ui.entering ? ' enter' : '') + '"><div class="title-card"><p class="kicker">변호사 시뮬레이션 · 플레이 10~15분</p><h1>THE FIRM</h1>' +
    '<p class="lead">작은 법률사무소의 한 주, 그리고 한 번의 재판.<br>누구에게 무엇을 맡겼는지가 법정에서 쥘 자료를 정합니다.</p>' +
    '<div class="title-actions">' + (canResume ? '<button class="btn primary" data-act="resume" data-primary>이어서 하기</button><button class="btn" data-act="new">처음부터</button>' : '<button class="btn primary" data-act="new" data-primary>시작하기</button>') + '</div>' +
    '<ul class="title-points"><li><b>맡긴다</b>네 사람의 시간을 사건에 나눕니다</li><li><b>준비한다</b>제때 끝난 검토만큼 조사할 시간이 생깁니다</li><li><b>다툰다</b>준비한 자료로 증인의 말을 좁힙니다</li></ul>' +
    '<p class="fine">한국을 닮은 가상의 법 세계입니다. 절차와 형량은 게임을 위해 단순화했으며 법률 조언이 아닙니다.' + (v.runs ? ' · 완주 ' + v.runs + '회' : '') + ' <button class="link" data-act="mute">' + (Audio.isMuted() ? '소리 켜기' : '소리 끄기') + '</button></p></div></main>';
}

// ---------- 상담 ----------
function intro(v) {
  const c = v.caseInfo.presentation.consultation, memo = v.caseInfo.presentation.memo;
  if (ui.memo) {
    return frame(v, '<section class="memo paper"><p class="kicker">사건 메모 · 정민호</p><h2>상해 사건을 맡았습니다</h2>' +
      '<div class="memo-grid"><div><h3>무슨 일인가</h3><ul>' + memo.background.map(x => '<li>' + gloss(x) + '</li>').join('') + '</ul></div>' +
      '<div><h3>검찰의 주장</h3><p>' + gloss(memo.prosecution) + '</p><h3>의뢰인의 말</h3><p class="quote">“' + esc(memo.client) + '”</p></div></div>' +
      '<div class="memo-next"><h3>이번 주 사무소가 할 일</h3><p>공판은 다음 주입니다. 그 전에 <b>자료 정리 → 기록 검토</b>를 끝내야 합니다. 기록 검토가 기한 안에 끝나면 공판 전 조사에 반나절 4번을, 늦으면 3번, 못 끝내면 2번만 쓸 수 있습니다. 사무소에는 다른 사건도 있습니다.</p></div>' +
      '<div class="actions"><button class="btn primary" data-act="finishIntro" data-primary>사무소로 간다</button></div></section>');
  }
  const line = c.lines[ui.intro], sp = c.speakers.find(s => s.id === line.speaker), mine = line.speaker === 'DEFENSE';
  return frame(v, '<section class="stage-photo" style="background-image:url(assets/art/office_lounge.jpg)"><div class="place"><small>사무실 회의실</small>첫 상담</div>' +
    '<div class="dialogue ' + (mine ? 'mine' : '') + '">' + portrait(null) + '<div class="say"><b>' + esc(sp.name) + '</b><small>' + esc(sp.detail) + '</small><p key="' + ui.intro + '">' + gloss(line.text) + '</p></div>' +
    '<div class="dialogue-foot"><span>' + (ui.intro + 1) + ' / ' + c.lines.length + '</span><button class="link" data-act="skipIntro">건너뛰기</button><button class="btn primary" data-act="nextIntro" data-primary>계속</button></div></div></section>');
}

// ---------- 사무소 ----------
const STATUS = { completed: ['끝', 'ok'], on_time: ['기한 안', 'ok'], late: ['기한 넘김', 'bad'], beyond_horizon: ['이번 주 안에 못 끝냄', 'bad'] };
const lateCount = f => f.tasks.filter(t => t.status === 'late' || t.status === 'beyond_horizon').length;
const OUTLOOK_TEXT = { on_time: '지금 배정이면 기록 검토가 기한 안에 끝납니다', late: '지금 배정이면 기록 검토가 기한을 넘깁니다', unfinished: '지금 배정이면 이번 주 안에 기록 검토를 못 끝냅니다' };
function outlookCard(v) {
  const o = v.outlook, firm = v.firm, org = firm.tasks.find(t => t.id === 'jung-organize'), rev = firm.tasks.find(t => t.id === 'jung-review');
  const f = id => v.forecast.tasks.find(t => t.taskId === id), name = id => (firm.staff.find(s => s.id === id) || { name: '미배정' }).name;
  const link = t => '<div class="chain-item ' + STATUS[f(t.id).status][1] + '"><small>' + esc(t.title.split(' · ')[1]) + ' · ' + esc(name(t.assignee)) + '</small><b>' + (t.completedDay !== null ? dayLabel(firm, t.completedDay) + ' 완료' : dayLabel(firm, f(t.id).predictedCompletionDay) + ' 예상') + '</b><span>기한 ' + dayLabel(firm, t.dueDay) + '</span></div>';
  return '<section class="card outlook tier-' + o.tierId + '"><div><p class="kicker">정민호 공판 준비 전망</p><p class="big">반나절 <b>' + o.budget + '</b>번</p><p class="muted">' + esc(o.settled ? o.label : OUTLOOK_TEXT[o.tierId]) + '</p></div>' +
    '<div class="chain">' + link(org) + '<i>→</i>' + link(rev) + '<i>→</i><div class="chain-item goal"><small>다음 주</small><b>제1회 공판</b><span>준비 ' + o.budget + '번</span></div></div></section>';
}
function intakeCard(v) {
  const it = v.firm.intake; if (it.status !== 'pending') return '';
  const a = game.previewFirm({ type: 'ACCEPT_INTAKE' }), d = game.previewFirm({ type: 'DECLINE_INTAKE' });
  const opt = (p, act, label, extra) => '<button class="choice" data-act="' + act + '"><b>' + label + '</b><span>' + extra + '</span><span>주말 예상 현금 ' + won(p.forecast.projectedCash) + '</span><span class="' + (lateCount(p.forecast) ? 'warn' : '') + '">기한 넘길 업무 ' + lateCount(p.forecast) + '건</span><span>공판 준비 ' + p.outlook.budget + '번</span></button>';
  return '<section class="card decision"><p class="kicker">오늘 결정할 일 · 새 의뢰</p><h2>윤지훈 씨가 사건을 맡아 달라고 합니다</h2>' +
    '<p>' + gloss('준비 업무 16시간이 더해집니다. 착수금 ' + won(it.upfront) + ', 준비 보고를 내면 잔금 ' + won(it.balance) + '. 준비 보고가 ' + dayLabel(v.firm, it.dueDay) + '까지 나오지 않으면 착수금의 절반을 돌려줍니다.') + '</p>' +
    '<div class="choices two">' + opt(a, 'accept', '맡는다', '업무 3개 · 16시간 추가') + opt(d, 'decline', '거절한다', '기존 사건에 집중') + '</div><p class="fine">수임 여부를 정해야 하루를 진행할 수 있습니다. 예상은 지금 배정을 유지했을 때의 값입니다.</p></section>';
}
function office(v) {
  const firm = v.firm, fc = v.forecast, pending = firm.intake.status === 'pending';
  const staff = id => firm.staff.find(s => s.id === id);
  const rows = firm.tasks.map(t => {
    const f = fc.tasks.find(x => x.taskId === t.id), st = STATUS[f.status], waits = t.completedDay === null && t.requires.some(r => firm.tasks.find(x => x.id === r).completedDay === null);
    return '<tr class="r-' + st[1] + '"><td><b>' + esc(t.title) + '</b>' + (waits ? '<small>앞 업무가 끝나야 시작</small>' : '') + '</td><td>' + (t.assignee ? portrait(t.assignee, 'sm') + esc(staff(t.assignee).name) : '미배정') + '</td><td class="num">' + (t.requiredHours - t.doneHours) + '시간</td><td>' + dayLabel(firm, t.dueDay) + '</td><td>' + (t.completedDay !== null ? dayLabel(firm, t.completedDay) : dayLabel(firm, f.predictedCompletionDay)) + '</td><td><span class="chip ' + st[1] + '">' + st[0] + '</span></td><td>' + (t.completedDay === null ? '<button class="btn sm" data-act="assign" data-id="' + t.id + '">담당 조정</button>' : '') + '</td></tr>';
  }).join('');
  const people = firm.staff.map(s => {
    const today = fc.today.find(x => x.staffId === s.id), pct = Math.round(100 * today.scheduledHours / s.capacity);
    return '<li>' + portrait(s.id) + '<div><b>' + esc(s.name) + '</b><small>' + (s.role === 'lawyer' ? '변호사' : '사무직원') + ' · ' + esc(s.specialty) + '</small><div class="bar"><i style="width:' + pct + '%"></i></div><small>오늘 ' + today.scheduledHours + ' / ' + s.capacity + '시간 · 맡은 일 ' + today.assignedRemainingHours + '시간' + (today.scheduledHours < s.capacity && today.assignedRemainingHours > today.scheduledHours ? ' · <em>앞 업무 대기</em>' : today.scheduledHours < s.capacity ? ' · <em>손이 빔</em>' : '') + '</small></div></li>';
  }).join('');
  const last = firm.reports[firm.reports.length - 1];
  const right = '<div class="stat"><small>' + dayLabel(firm, firm.dayIndex) + ' · 업무 ' + (firm.dayIndex + 1) + ' / 5일</small><b>' + won(firm.cash) + '</b></div><button class="btn primary" data-act="advance" data-primary ' + (pending ? 'disabled title="새 의뢰를 먼저 결정하세요"' : '') + '>하루 진행</button>';
  return frame(v, '<div class="office-grid"><div class="col">' + intakeCard(v) + outlookCard(v) +
    '<section class="card"><div class="card-head"><h2>이번 주 업무</h2><span class="muted">담당을 바꾸면 다른 업무의 완료일도 달라집니다</span></div><div class="table-wrap"><table class="tasks"><thead><tr><th>업무</th><th>담당</th><th>남은 양</th><th>기한</th><th>완료 예상</th><th>상태</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div></section></div>' +
    '<aside class="col side"><section class="card"><div class="card-head"><h2>오늘의 사람과 시간</h2></div><ul class="people">' + people + '</ul></section>' +
    (last ? '<section class="card"><div class="card-head"><h2>어제 보고</h2><button class="link" data-act="report">자세히</button></div><p class="muted">' + esc(reportLine(firm, last)) + '</p></section>' : '<section class="card hint"><p>' + gloss('한도윤에게 자료 정리를 맡기면 비용은 적게 들지만 하루 3시간씩만 진행됩니다. 변호사에게 맡기면 빨라지는 대신 그 변호사의 다른 사건이 밀립니다.') + '</p></section>') + '</aside></div>', right);
}
function reportLine(firm, r) {
  const hours = r.work.reduce((a, w) => a + w.hours, 0);
  return dayLabel(firm, r.day) + ' · ' + hours + '시간 수행, ' + r.completed.length + '건 완료' + (r.lateTasks.length ? ', 기한 넘긴 업무 ' + r.lateTasks.length + '건' : '') + ' · 현금 ' + signed(r.cashAfter - r.cashBefore);
}
function reportModal(v) {
  const firm = v.firm, r = firm.reports[firm.reports.length - 1], name = id => firm.staff.find(s => s.id === id).name, task = id => firm.tasks.find(t => t.id === id).title;
  return '<div class="sheet"><p class="kicker">업무 보고</p><h2>' + dayLabel(firm, r.day) + '</h2><ul class="report">' +
    r.work.map(w => '<li><span>' + esc(name(w.staffId)) + ' — ' + esc(task(w.taskId)) + '</span><b>' + w.hours + '시간</b></li>').join('') + '</ul>' +
    (r.completed.length ? '<p class="good">끝난 업무: ' + r.completed.map(id => esc(task(id))).join(', ') + '</p>' : '') +
    (r.lateTasks.length ? '<p class="bad">기한을 넘긴 업무: ' + r.lateTasks.map(id => esc(task(id))).join(', ') + '</p>' : '') +
    '<div class="money"><span>입금 ' + won(r.income) + '</span><span>지출 ' + won(r.expenses) + '</span><b>마감 현금 ' + won(r.cashAfter) + '</b></div>' +
    '<div class="actions"><button class="btn primary" data-act="closeModal" data-primary>' + (firm.completed ? '한 주를 마친다' : '다음 날로') + '</button></div></div>';
}
function assignModal(v, taskId) {
  const firm = v.firm, t = firm.tasks.find(x => x.id === taskId), base = v.forecast;
  const rows = firm.staff.filter(s => t.roles.includes(s.role)).map(s => {
    const cur = s.id === t.assignee, p = cur ? { ok: true, forecast: base, outlook: v.outlook } : game.previewFirm({ type: 'ASSIGN_TASK', taskId, staffId: s.id });
    const f = p.forecast.tasks.find(x => x.taskId === taskId), st = STATUS[f.status], dl = lateCount(p.forecast) - lateCount(base), db = p.outlook.budget - v.outlook.budget;
    return '<button class="cand ' + (cur ? 'current' : '') + '" data-act="doAssign" data-task="' + taskId + '" data-staff="' + s.id + '" ' + (cur ? 'disabled' : '') + '>' + portrait(s.id) + '<span class="who"><b>' + esc(s.name) + (cur ? ' · 지금 담당' : '') + '</b><small>하루 ' + s.capacity + '시간 · 시간당 ' + won(s.hourlyCost) + '</small></span>' +
      '<span class="fx"><small>이 업무</small><b class="' + st[1] + '">' + dayLabel(firm, f.predictedCompletionDay) + '</b></span>' +
      '<span class="fx"><small>기한 넘길 업무</small><b class="' + (dl > 0 ? 'bad' : dl < 0 ? 'ok' : '') + '">' + lateCount(p.forecast) + '건' + (dl ? ' (' + (dl > 0 ? '+' : '') + dl + ')' : '') + '</b></span>' +
      '<span class="fx"><small>주말 현금</small><b>' + won(p.forecast.projectedCash) + '</b></span>' +
      '<span class="fx"><small>공판 준비</small><b class="' + (db > 0 ? 'ok' : db < 0 ? 'bad' : '') + '">' + p.outlook.budget + '번</b></span></button>';
  }).join('');
  const pr = [1, 2, 3].map(n => '<button class="seg ' + (t.priority === n ? 'on' : '') + '" data-act="priority" data-task="' + taskId + '" data-n="' + n + '">' + ['먼저', '보통', '나중'][n - 1] + '</button>').join('');
  return '<div class="sheet wide"><p class="kicker">담당 조정</p><h2>' + esc(t.title) + '</h2><p class="muted">남은 양 ' + (t.requiredHours - t.doneHours) + '시간 · 기한 ' + dayLabel(firm, t.dueDay) + (t.roles.includes('admin') ? '' : ' · 변호사만 할 수 있는 업무') + '. 맡기기 전에 결과를 비교하세요.</p>' +
    '<div class="cands">' + rows + '</div><div class="prio"><span>같은 사람이 여러 일을 맡았을 때의 순서</span><div class="segs">' + pr + '</div></div>' +
    '<div class="actions"><button class="btn" data-act="closeModal">닫기</button></div></div>';
}

// ---------- 한 주 결산 → 검사 선택 ----------
function weekend(v) {
  const s = v.summary, firm = v.firm, p = v.prep, kept = firm.tasks.filter(t => t.completedDay !== null && t.completedDay <= t.dueDay).length;
  const pros = v.caseInfo.prosecutors.map(x => { const pp = v.caseInfo.presentation.prosecutors[x.id]; return '<button class="choice ' + (ui.prosecutor === x.id ? 'on' : '') + '" data-act="pickPros" data-id="' + x.id + '"><b>' + esc(pp.name) + ' 검사</b><span>' + esc(x.sub) + '</span><span class="' + (x.id === 'veteran' ? 'warn' : '') + '">' + (x.id === 'veteran' ? '어려움 · 미리 낸 자료에 대비해 옵니다' : '처음이라면 이쪽을 권합니다') + '</span></button>'; }).join('');
  return frame(v, '<section class="weekend"><p class="kicker">6/19 금 · 한 주 마감</p><h1>사무소의 한 주가 끝났습니다</h1>' +
    '<div class="tiles"><div><small>현금</small><b>' + won(s.cash) + '</b><span>' + signed(s.cash - firm.openingCash) + '</span></div><div><small>기한 안에 끝낸 업무</small><b>' + kept + ' / ' + firm.tasks.length + '</b><span>' + (s.refundPaid ? '윤지훈 환급 ' + won(s.refundPaid) : firm.intake.status === 'accepted' ? '윤지훈 약속 지킴' : '윤지훈 사건 거절') + '</span></div>' +
    '<div class="tier-' + p.tierId + '"><small>정민호 공판 준비</small><b>반나절 ' + p.budget + '번</b><span>' + esc(p.label) + '</span></div></div>' +
    '<p class="because">' + esc(p.detail) + '</p><h2>상대 검사</h2><div class="choices two">' + pros + '</div>' +
    '<div class="actions"><button class="btn primary" data-act="beginPrep" data-primary>공판 준비를 시작한다</button></div></section>');
}

// ---------- 공판 준비 ----------
const FILING_HELP = { filed: '미리 신청 — 법정에서 바로 쓸 수 있지만 검사가 대비할 수 있습니다', deferred: '보류 — 재판 중에 신청할 수 있습니다. 늦게 내면 재판장의 신뢰가 깎입니다', withheld: '미신청 — 법정에서 쓰지 않습니다' };
function cardsBlock(t, compact) {
  if (!t.cards.length) return '<p class="muted">아직 확보한 자료가 없습니다.</p>';
  return t.cards.map(c => '<article class="evi"><b>' + esc(c.title) + '</b>' + (compact ? '' : '<p>' + esc(c.text) + '</p>') +
    (c.filing === 'required' ? (t.filingOpen ? '<div class="segs">' + ['filed', 'deferred', 'withheld'].map(s => '<button class="seg ' + (c.filingStatus === s ? 'on' : '') + '" data-act="file" data-id="' + c.id + '" data-status="' + s + '" ' + (c.filingStatus === s ? 'disabled' : '') + '>' + esc(t.legalProcedure.filingLabels[s]) + '</button>').join('') + '</div><small>' + esc(FILING_HELP[c.filingStatus] || '') + '</small>' : '<small>' + esc(t.legalProcedure.filingLabels[c.filingStatus] || '') + ' · 변경 마감</small>') : '<small>신청할 필요가 없는 자료입니다</small>') + '</article>').join('');
}
function prep(v) {
  const c = v.court, t = c.trial, p = t.projection, st = c.settlement, total = t.definition.prep.budget;
  const pips = Array.from({ length: total }, (_, i) => '<i class="' + (i < p.budgetLeft ? 'on' : '') + '"></i>').join('');
  const invs = t.investigations.map(x => '<article class="inv ' + (x.done ? 'done' : '') + '"><div><b>' + esc(x.title) + '</b><p>' + esc(x.done ? x.resultLines.join(' ') : x.blurb) + '</p></div>' + (x.done ? '<span class="chip ok">조사함</span>' : '<button class="btn sm" data-act="investigate" data-id="' + x.id + '" ' + (x.affordable ? '' : 'disabled') + '>조사한다</button>') + '</article>').join('');
  let settle = '';
  if (st) {
    settle = '<section class="card"><div class="card-head"><h2>' + gloss('합의 제안') + '</h2><span class="muted">' + esc(st.offer.from) + ' · ' + esc(st.offer.amount) + '</span></div><p>' + gloss(st.offer.text) + '</p><p class="muted">' + esc(st.note) + '</p>' +
      (st.consult ? '<div class="mini-talk">' + st.consult.lines.map(l => '<p><b>' + ({ CLIENT: '정민호', DEFENSE: '나', VICTIM: '오태윤' }[l.speaker] || '') + '</b>' + gloss(l.text) + '</p>').join('') + '</div>' + (st.filed ? '<p class="good">' + gloss('처벌불원서가 재판 전에 제출되었습니다.') + '</p>' : '')
        : '<p class="fine">의뢰인과 상담하면 반나절 1번을 씁니다. 결정은 정민호 씨가 합니다.</p><div class="choices">' + st.advice.map(a => '<button class="choice" data-act="consult" data-id="' + a.id + '" ' + (st.available ? '' : 'disabled') + '><b>' + esc(a.title) + '</b></button>').join('') + '</div>' + (st.available ? '' : '<p class="muted">' + esc(st.reason) + '</p>')) + '</section>';
  }
  const right = '<div class="stat"><small>' + esc(t.definition.prep.deadlineLabel) + ' · 남은 ' + gloss('반나절') + '</small><b class="pips">' + pips + '</b></div><button class="btn primary" data-act="finishPrep" data-primary>준비를 마친다</button>';
  return frame(v, '<div class="office-grid"><div class="col"><section class="card"><div class="card-head"><h2>무엇을 조사할까</h2><span class="muted">조사 하나에 반나절 1번 · ' + esc(v.prep.label) + '</span></div>' + invs + '</section>' + settle + '</div>' +
    '<aside class="col side"><section class="card"><div class="card-head"><h2>확보한 자료</h2></div>' + cardsBlock(t) + '</section>' +
    '<section class="card"><div class="card-head"><h2>검찰이 낸 증거</h2></div>' + t.exhibits.map(x => '<details class="fold"><summary>' + esc(x.title) + '</summary><p>' + esc(x.content) + '</p></details>').join('') + '</section>' +
    '<section class="card"><div class="card-head"><h2>의뢰인의 말</h2></div>' + t.clientStatements.map(x => '<p class="quote">“' + esc(x.text) + '”</p>').join('') + '</section></aside></div>', right);
}

// ---------- 법정 ----------
function speakerOf(v, id) {
  const t = v.court.trial, pr = v.caseInfo.presentation, w = t.definition.witnesses.find(x => x.id === id);
  if (w) return { name: w.name, role: w.role.split(' · ')[0], cls: 'witness' };
  return ({ JUDGE: { name: '재판장', role: '', cls: 'judge' }, PROSECUTOR: { name: pr.prosecutors[v.prosecutorId].name, role: '검사', cls: 'pros' }, DEFENSE: { name: '변호인', role: '나', cls: 'def' }, CLIENT: { name: pr.client.name, role: '피고인', cls: 'witness' }, VICTIM: { name: pr.victim.name, role: '피해자', cls: 'witness' } })[id] || { name: id, role: '', cls: '' };
}
function credWords(n) { return n >= 3 ? ['믿고 지켜보는 중', 'ok'] : n === 2 ? ['조금 지켜보는 중', 'warn'] : ['신뢰가 낮음 — 다음 반대신문 질문 1번 감소', 'bad']; }
function transcript(v) {
  const recs = v.court.trial.displayRecords.filter(r => r.lines && r.lines.length), from = recs.findIndex(r => r.kind === 'trial_open');
  const shown = recs.slice(Math.max(0, from));
  return shown.map(r => {
    const fresh = r.seq > ui.seenSeq;
    const lines = r.lines.map(l => { const s = speakerOf(v, l.speaker); return '<div class="line ' + s.cls + '"><span class="spk">' + esc(s.name) + (s.role ? '<small>' + esc(s.role) + '</small>' : '') + '</span><p>' + gloss(l.text) + '</p></div>'; }).join('');
    const marks = (r.memo ? '<span class="note ' + (r.tone || 'neutral') + '">재판장 메모 · ' + esc(r.memo) + '</span>' : '') + (r.credibility < 0 ? '<span class="note bad">재판장의 신뢰가 낮아졌습니다</span>' : '') + (r.kind === 'objection' && r.source === 'defense' ? '<span class="note ' + (r.ruling === 'sustained' ? 'defense' : 'bad') + '">이의 ' + (r.ruling === 'sustained' ? '인용' : '기각') + '</span>' : '');
    return '<div class="rec k-' + r.kind + (fresh ? ' fresh' : '') + '">' + lines + (marks ? '<div class="marks">' + marks + '</div>' : '') + '</div>';
  }).join('');
}
function actionBar(v) {
  const t = v.court.trial, st = t.state, a = t.actions, pend = st.pending;
  if (pend && pend.type === 'objection') return '<div class="ask"><p><b>검사의 질문입니다.</b> ' + gloss('이의') + '를 제기하겠습니까? 근거는 <b>' + gloss(pend.ground) + '</b>입니다. 증인이 직접 보거나 맡은 범위 안의 질문인지 생각해 보세요.</p><div class="row"><button class="btn primary" data-act="object" data-v="1">이의 있습니다</button><button class="btn" data-act="object" data-v="0" data-primary>넘어간다</button></div></div>';
  if (pend && pend.type === 'rebuttal') return '<div class="ask"><p><b>검사가 수습했습니다.</b> 준비한 자료로 한 번 더 되물을 수 있습니다 — ' + esc(pend.title) + (pend.filingNeeded ? ' <em class="bad">아직 신청하지 않은 자료입니다. 오른쪽 "내 자료"에서 먼저 신청하지 않으면 제지당합니다.</em>' : '') + '</p><div class="row"><button class="btn primary" data-act="rebut" data-v="1" data-primary>자료를 제시한다</button><button class="btn" data-act="rebut" data-v="0">하지 않는다</button></div></div>';
  if (a.closing) return '<div class="ask"><p><b>' + gloss('최후변론') + '</b> — 무엇을 구하겠습니까?</p><div class="choices">' + t.procedure.closingChoices.map(c => '<button class="choice" data-act="closing" data-id="' + c.id + '"><b>' + esc(c.title) + '</b><span>' + esc(c.text) + '</span></button>').join('') + '</div></div>';
  if (a.verdict) return '<div class="ask center"><p>' + esc(t.legalProcedure.sentencingDate) + '</p><button class="btn primary big" data-act="verdict" data-primary>선고를 듣는다</button></div>';
  if (st.cursor.part === 'cross') {
    const left = t.witness.timeLeft;
    const ap = a.approaches.map(x => '<button class="choice ' + (x.used ? 'used' : '') + '" data-act="approach" data-id="' + x.id + '" ' + (x.available ? '' : 'disabled') + '><b>' + esc(x.title) + '</b><span>' + (x.cards.length ? '쓰는 자료: ' + esc(x.hint) : esc(x.reason || x.hint)) + '</span>' + (x.filingNeeded && x.available ? '<span class="warn">신청하지 않은 자료 — 제시하면 제지당합니다</span>' : '') + '</button>').join('');
    const pr = a.presses.map(x => '<button class="choice press ' + x.kind + (x.used ? ' used' : '') + '" data-act="press" data-id="' + x.id + '" ' + (x.available ? '' : 'disabled') + '><b>' + (x.kind === 'limited' ? '확인된 범위까지만 결론을 묻는다' : '더 큰 결론까지 요구한다 · 위험') + '</b><span>“' + esc(x.question) + '”</span>' + (x.available ? '' : '<span>' + esc(x.reason) + '</span>') + '</button>').join('');
    return '<div class="ask"><div class="ask-head"><p><b>' + gloss('반대신문') + '</b> · ' + esc(t.witness.name) + '</p><span class="left ' + (left <= 1 ? 'bad' : '') + '">남은 질문 ' + left + '번' + (left === 1 ? ' · 마지막입니다' : '') + '</span><button class="btn sm" data-act="endCross">신문을 마친다</button></div><h4>근거를 쌓는다</h4><div class="choices">' + ap + '</div><h4>결론을 요구한다</h4><div class="choices">' + pr + '</div></div>';
  }
  return '<div class="ask center"><button class="btn primary big" data-act="continue" data-primary>계속</button></div>';
}
function sidePanel(v) {
  const t = v.court.trial, p = t.projection, w = t.witness, cred = credWords(p.credibility);
  const who = w ? '<section class="card witness-card">' + portrait(null, 'lg') + '<h3>' + esc(w.name) + '</h3><p class="muted">' + esc(w.role) + '</p><p class="fine">' + esc(w.detail || '') + '</p></section>' : '';
  const issues = p.issues.map(i => '<div class="issue band-' + i.band + '"><div><b>' + esc(i.title) + '</b><span class="chip band-' + i.band + '">' + esc(v.court.bandLabels[i.band] || i.band) + '</span></div><p class="muted">' + esc(i.question) + '</p><ul>' + i.notes.slice(-3).map(n => '<li class="' + n.tone + '">' + esc(n.text) + '</li>').join('') + '</ul></div>').join('');
  return who + '<section class="card"><div class="card-head"><h2>재판장 메모</h2></div>' + issues + '<p class="cred ' + cred[1] + '">' + gloss('재판장의 신뢰') + ' · ' + cred[0] + '</p><p class="fine">' + gloss('유죄는 합리적 의심이 남지 않을 만큼 입증되어야 합니다.') + '</p></section>' +
    '<details class="card fold" ' + (t.state.pending && t.state.pending.filingNeeded ? 'open' : '') + '><summary>내 자료 ' + t.cards.length + '개 · ' + gloss('증거 신청') + '</summary>' + cardsBlock(t, true) + '</details>';
}
function openingForm(v) {
  const t = v.court.trial, o = t.definition.opening, names = Object.fromEntries(t.definition.witnesses.map(w => [w.id, w.name]));
  const focus = o.focus.map(f => '<button class="choice ' + (ui.opening.focusId === f.id ? 'on' : '') + '" data-act="pickOpen" data-k="focusId" data-id="' + f.id + '"><b>' + esc(f.title) + '</b><span>' + Object.entries(f.time).map(([w, n]) => esc(names[w]) + ' 질문 ' + n + '번').join(' · ') + '</span></button>').join('');
  const stance = o.stance.map(s => '<button class="choice ' + (ui.opening.stanceId === s.id ? 'on' : '') + '" data-act="pickOpen" data-k="stanceId" data-id="' + s.id + '"><b>' + esc(s.title) + '</b></button>').join('');
  return '<section class="form"><p class="kicker">제1회 공판 · ' + gloss('모두진술') + '</p><h1>어디를 다툴지 밝힙니다</h1><p class="muted">여기서 한 말은 기록에 남습니다. 나중에 뒤집으면 신뢰를 잃습니다.</p>' +
    '<h2>주력 쟁점 — 누구에게 더 오래 물을 것인가</h2><div class="choices">' + focus + '</div><h2>밀침에 대한 입장</h2><div class="choices">' + stance + '</div>' +
    (o.caution ? '<p class="because warn">' + esc(o.caution) + '</p>' : '') +
    '<div class="actions"><button class="btn primary" data-act="open" data-primary ' + (ui.opening.focusId && ui.opening.stanceId ? '' : 'disabled') + '>모두진술을 한다</button></div></section>';
}
function evidenceForm(v) {
  const t = v.court.trial, done = t.exhibits.every(x => ui.opinions[x.id]);
  const rows = t.exhibits.map(x => {
    const cur = ui.opinions[x.id], wn = x.witnessId && t.definition.witnesses.find(w => w.id === x.witnessId).name;
    const help = cur === 'agree' ? (x.witnessId ? '이 진술이 그대로 증거가 됩니다. ' + wn + ' 씨는 법정에 나오지 않습니다.' : '다투지 않고 증거로 받아들입니다.') : cur === 'disagree' ? (x.witnessId ? wn + ' 씨가 증인으로 나옵니다. 반대신문할 수 있습니다.' : '다툴 이유를 대지 못하면 재판장의 신뢰가 깎입니다.') : (x.witnessId ? '사람의 진술을 적은 서류입니다.' : '진술이 아닌 서류·사진입니다.');
    return '<article class="evi row-evi"><div><b>' + esc(x.title) + '</b><p>' + esc(x.content) + '</p><small class="' + (cur === 'disagree' && !x.witnessId ? 'bad' : '') + '">' + esc(help) + '</small></div><div class="segs"><button class="seg ' + (cur === 'agree' ? 'on' : '') + '" data-act="opine" data-id="' + x.id + '" data-v="agree">동의</button><button class="seg ' + (cur === 'disagree' ? 'on' : '') + '" data-act="opine" data-id="' + x.id + '" data-v="disagree">부동의</button></div></article>';
  }).join('');
  return '<section class="form"><p class="kicker">증거 의견</p><h1>검찰 증거에 의견을 냅니다</h1><p class="muted">' + gloss('부동의한 진술조서의 작성자는 증인으로 나옵니다. 한 번 정하면 바꿀 수 없습니다.') + '</p>' + rows +
    '<div class="actions"><button class="btn primary" data-act="opinions" data-primary ' + (done ? '' : 'disabled') + '>의견을 확정한다</button></div></section>';
}
function courtScene(v) {
  const t = v.court.trial, st = t.state;
  if (st.phase === 'opening') return frame(v, openingForm(v));
  if (st.cursor && st.cursor.part === 'evidence') return frame(v, evidenceForm(v));
  return frame(v, '<div class="court-grid"><div class="col stage"><div class="scroll" id="scroll">' + transcript(v) + '</div><div class="bar-wrap">' + actionBar(v) + '</div></div><aside class="col side">' + sidePanel(v) + '</aside></div>');
}

// ---------- 판결과 결산 ----------
function result(v) {
  const o = v.court.outcome, s = v.settlement, pr = v.caseInfo.presentation, list = (title, items, cls) => items && items.length ? '<div class="rev ' + cls + '"><h3>' + title + '</h3><ul>' + items.map(x => '<li>' + gloss(x.text) + '</li>').join('') + '</ul></div>' : '';
  const next = v.caseInfo.nextTry.find(n => n.when.outcome === o.key);
  return frame(v, '<section class="verdict rank-' + s.rank + '"><p class="kicker">판결 선고</p><h1>' + gloss(o.headline) + '</h1><p class="pron">' + esc(o.pronouncement || '') + '</p><p class="lead">' + gloss(o.text) + '</p>' +
    '<p class="stakes">' + esc(o.convicted ? pr.stakes.convicted : pr.stakes.cleared) + '</p>' +
    '<div class="issues">' + o.issues.map(i => '<div class="issue band-' + i.band + '"><div><b>' + esc(i.title) + '</b><span class="chip band-' + i.band + '">' + esc(i.bandLabel) + '</span></div><p class="muted">' + esc(i.memo) + '</p></div>').join('') + '</div>' + (o.shaken || []).map(x => '<p class="because left">' + gloss(x) + '</p>').join('') + '</section>' +
    '<section class="review"><h2>왜 이렇게 됐는가</h2><p class="muted">' + gloss(o.reviewText || '') + '</p><div class="rev-grid">' + list('통한 것', o.broke, 'ok') + list('막지 못한 것', o.passed, 'bad') + list('역효과', o.backfired, 'bad') + list('막힌 것', o.blocked, 'bad') + list('놓친 준비', o.missed, 'warn') + '</div>' +
    '<p class="fine">' + esc(o.closingReview || '') + '</p><p class="because">' + esc((next && next.text) || o.next || '') + '</p></section>' +
    '<section class="ledger"><h2>사무소 결산</h2><div class="tiles"><div><small>한 주 현금 변화</small><b>' + signed(s.weekDelta) + '</b><span>마감 ' + won(s.weekCash) + '</span></div><div><small>' + gloss('성공보수') + '</small><b>' + signed(s.successFee) + '</b><span>' + esc(o.headline) + '</span></div><div><small>최종 현금</small><b>' + won(s.finalCash) + '</b><span>기한 지킨 업무 ' + s.promisesKept + ' / ' + s.promisesTotal + '</span></div><div class="tier-' + v.prep.tierId + '"><small>공판 준비</small><b>반나절 ' + v.prep.budget + '번</b><span>' + esc(v.prep.label) + '</span></div></div>' +
    '<div class="actions"><button class="btn" data-act="records">공판 기록 전체</button><button class="btn" data-act="retry">같은 준비 시간으로 공판만 다시</button><button class="btn primary" data-act="new" data-primary>새 한 주를 시작한다</button></div><p class="fine">' + esc(v.court.pack.disclaimer) + '</p></section>');
}

// ---------- 그리기 ----------
const SCENES = { title, intro, office, weekend, prep, court: courtScene, result };
function render() {
  const v = game.view();
  const sceneKey = ui.showTitle ? 'title' : v.scene + (v.scene === 'intro' && ui.memo ? ':memo' : '') + (v.scene === 'court' ? ':' + v.court.trial.state.phase + ':' + (v.court.trial.state.cursor && v.court.trial.state.cursor.part === 'evidence' ? 'e' : 's') : '');
  ui.entering = ui.lastScene !== sceneKey;
  if (ui.entering) { if (v.scene === 'result' && !ui.showTitle) Audio.play('gavel'); ui.lastScene = sceneKey; window.scrollTo(0, 0); }
  const modalKey = ui.modal ? ui.modal.type + (ui.modal.id || '') : null, modalEnter = modalKey !== ui.modalKey; ui.modalKey = modalKey;
  app.innerHTML = ui.showTitle ? title(v) : SCENES[v.scene](v);
  modalRoot.innerHTML = ui.modal ? '<div class="backdrop' + (modalEnter ? ' enter' : '') + '" data-act="closeModal"></div><div class="modal' + (modalEnter ? ' enter' : '') + '" role="dialog" aria-modal="true">' + (ui.modal.type === 'report' ? reportModal(v) : ui.modal.type === 'assign' ? assignModal(v, ui.modal.id) : ui.modal.type === 'records' ? '<div class="sheet wide"><p class="kicker">공판 기록</p><h2>말과 답변, 순서대로</h2><div class="scroll plain">' + transcript(v) + '</div><div class="actions"><button class="btn primary" data-act="closeModal" data-primary>닫기</button></div></div>' : '') + '</div>' : '';
  closePops();
  if (v.court) {
    const p = v.court.trial.projection, recs = v.court.trial.records, lastRec = recs[recs.length - 1];
    if (ui.lastCred !== null && p.credibility < ui.lastCred) { const why = recs.slice().reverse().find(r => r.credibility < 0); toast('재판장의 신뢰가 낮아졌습니다' + (why && why.memo ? ' — ' + why.memo : ''), 'bad'); Audio.play('alert'); }
    ui.lastCred = p.credibility;
    if (lastRec && lastRec.seq > ui.seenSeq) {
      if (lastRec.kind === 'cross_start' && lastRec.warned) toast('신뢰가 낮아 이번 반대신문 질문이 1번 줄었습니다', 'bad');
      if (lastRec.kind === 'cross_end' && lastRec.timeUp) toast('준비한 질문 횟수를 모두 썼습니다');
      if (lastRec.tone === 'defense' && !ui.modal) Audio.play('gain');
      ui.seenSeq = lastRec.seq;
    }
    const sc = $('#scroll'); if (sc) sc.scrollTop = sc.scrollHeight;
  } else { ui.lastCred = null; ui.seenSeq = 0; }
  const focusEl = (ui.modal ? modalRoot : app).querySelector('[data-primary]:not([disabled])'); if (focusEl) focusEl.focus({ preventScroll: true });
}

// ---------- 용어 설명 (중첩) ----------
let pops = [], popTimer = null;
function closePops(depth) { pops.splice(depth || 0).forEach(p => p.remove()); }
function openPop(el) {
  const term = el.dataset.term, def = Gloss.terms[term]; if (!def) return;
  const inside = el.closest('.pop'), depth = inside ? pops.indexOf(inside) + 1 : 0;
  if (pops[depth] && pops[depth].dataset.for === term) return;
  closePops(depth);
  const pop = document.createElement('div'); pop.className = 'pop'; pop.dataset.for = term; pop.setAttribute('role', 'tooltip');
  pop.innerHTML = '<h4>' + esc(term) + '</h4><p>' + gloss(def.easy).replace(new RegExp('<span class="term"[^>]*data-term="' + term + '">' + term + '</span>'), term) + '</p><p class="in-game"><small>이 게임에서</small>' + gloss(def.game).replace(new RegExp('<span class="term"[^>]*data-term="' + term + '">' + term + '</span>'), term) + '</p>' + (def.law ? '<p class="law">' + esc(def.law) + ' <em>확인 필요</em></p>' : '');
  popRoot.appendChild(pop); pops.push(pop);
  const r = el.getBoundingClientRect(), w = pop.offsetWidth, h = pop.offsetHeight;
  const left = Math.max(12, Math.min(window.innerWidth - w - 12, r.left)), top = r.bottom + h + 12 > window.innerHeight ? Math.max(12, r.top - h - 8) : r.bottom + 8;
  pop.style.left = left + 'px'; pop.style.top = top + 'px';
}
document.addEventListener('mouseover', e => {
  const term = e.target.closest && e.target.closest('.term');
  if (term) { clearTimeout(popTimer); popTimer = setTimeout(() => openPop(term), 180); return; }
  if (e.target.closest && e.target.closest('.pop')) { clearTimeout(popTimer); return; }
  if (pops.length) { clearTimeout(popTimer); popTimer = setTimeout(() => closePops(), 260); }
});

// ---------- 입력 ----------
const acts = {
  title() { ui.modal = null; ui.showTitle = true; closePops(); render(); },
  mute() { Audio.toggle(); render(); },
  new() { ui = freshUi(); run('newGame', {}, 'page'); },
  resume() { if (game.view().scene !== 'title') { ui.showTitle = false; Audio.play('page'); render(); return; } const res = game.load(readSave()); if (!res.ok) { toast('저장을 읽지 못해 처음부터 시작합니다.', 'bad'); ui = freshUi(); run('newGame'); return; } ui = freshUi(); const v = game.view(); if (v.court) ui.seenSeq = v.court.trial.records.length; Audio.play('page'); render(); },
  nextIntro() { const n = game.view().caseInfo.presentation.consultation.lines.length; if (ui.intro < n - 1) ui.intro++; else ui.memo = true; Audio.play('tick'); render(); },
  skipIntro() { ui.memo = true; render(); },
  finishIntro() { run('finishIntro', {}, 'page'); },
  accept() { run('firm', { action: { type: 'ACCEPT_INTAKE' } }, 'tick'); },
  decline() { run('firm', { action: { type: 'DECLINE_INTAKE' } }, 'tick'); },
  advance() { if (run('firm', { action: { type: 'ADVANCE_DAY' } }, 'day')) { ui.modal = { type: 'report' }; render(); } },
  report() { ui.modal = { type: 'report' }; render(); },
  records() { ui.modal = { type: 'records' }; ui.seenSeq = Infinity; render(); },
  assign(d) { ui.modal = { type: 'assign', id: d.id }; render(); },
  doAssign(d) { ui.modal = null; if (run('firm', { action: { type: 'ASSIGN_TASK', taskId: d.task, staffId: d.staff } }, 'tick')) toast('담당을 바꿨습니다. 전망을 다시 계산했습니다.'); },
  priority(d) { run('firm', { action: { type: 'SET_PRIORITY', taskId: d.task, priority: Number(d.n) } }, 'tick'); },
  closeModal() { ui.modal = null; Audio.play('tick'); render(); },
  pickPros(d) { ui.prosecutor = d.id; Audio.play('tick'); render(); },
  beginPrep() { ui.opening = {}; ui.opinions = {}; ui.seenSeq = 0; run('beginPrep', { prosecutorId: ui.prosecutor }, 'page'); },
  investigate(d) { court('investigate', { id: d.id }, 'page'); },
  consult(d) { run('court', { action: 'consult', payload: { adviceId: d.id } }, 'page'); },
  file(d) { court('fileEvidence', { id: d.id, status: d.status }, 'tick'); },
  finishPrep() { const left = game.view().court.trial.projection.budgetLeft; if (left > 0 && !ui.confirmPrep) { ui.confirmPrep = true; toast('반나절이 ' + left + '번 남았습니다. 그래도 마치려면 한 번 더 누르세요.'); return; } ui.confirmPrep = false; court('finishPrep', {}, 'page'); },
  pickOpen(d) { ui.opening[d.k] = d.id; Audio.play('tick'); render(); },
  open() { court('open', ui.opening, 'gavel'); },
  opine(d) { ui.opinions[d.id] = d.v; Audio.play('tick'); render(); },
  opinions() { court('evidenceOpinions', { opinions: ui.opinions }, 'page'); },
  continue() { court('continue', {}, 'tick'); },
  object(d) { court('objection', { object: d.v === '1' }, 'tick'); },
  rebut(d) { court('rebut', { use: d.v === '1' }, 'tick'); },
  approach(d) { court('approach', { id: d.id }, 'tick'); },
  press(d) { court('press', { id: d.id }, 'tick'); },
  endCross() { court('endCross', {}, 'tick'); },
  closing(d) { court('closingArgument', { id: d.id }, 'page'); },
  verdict() { court('verdict'); },
  retry() { ui = freshUi(); run('retryTrial', {}, 'page'); }
};
document.addEventListener('click', e => {
  const term = e.target.closest('.term'); if (term) { e.preventDefault(); e.stopPropagation(); clearTimeout(popTimer); openPop(term); return; }
  if (!e.target.closest('.pop')) closePops();
  const el = e.target.closest('[data-act]'); if (!el || el.disabled) return;
  const fn = acts[el.dataset.act]; if (fn) fn(el.dataset);
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { if (pops.length) closePops(); else if (ui.modal) acts.closeModal(); return; }
  if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('term')) { e.preventDefault(); openPop(e.target); }
});

render();
})(typeof globalThis !== 'undefined' ? globalThis : this);
