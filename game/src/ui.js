(function (root) {
'use strict';
// PORTFOLIO-001/002 화면. 상태는 session 서비스가 소유하고, 여기서는 view를 그리고 명령을 보낼 뿐이다.
// 판정·경제 계산을 하지 않는다. 화면 전용 상태(ui)는 저장하지 않는다.
const Game = root.FirmGame, Audio = root.FirmAudio, Gloss = root.FirmGlossary;
const SAVE_KEY = 'thefirm.portfolio.v2';
const $ = sel => document.querySelector(sel);
const app = $('#app'), modalRoot = $('#modal'), popRoot = $('#pops'), toastRoot = $('#toasts');

let game = Game.createGame();
let ui = freshUi();
function freshUi() { return { intro: 0, memo: false, modal: null, seenSeq: 0, shown: 0, seenShown: 0, speed: 'normal', watching: false, lastCred: null, lastScene: null, showTitle: false }; }

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
const STEPS = [['intro', '상담'], ['office', '사무소의 한 주'], ['plan', '변론 계획'], ['court', '공판'], ['result', '결산']];
function stepIndex(scene) { return scene === 'weekend' ? 1 : scene === 'result' && ui.watching ? 3 : STEPS.findIndex(s => s[0] === scene); }
function frame(v, body, right) {
  const at = stepIndex(v.scene);
  return '<header class="top"><button class="brand" data-act="title" aria-label="처음 화면으로">THE FIRM<small>법률사무소</small></button>' +
    '<ol class="rail">' + STEPS.map((s, i) => '<li class="' + (i < at ? 'done' : i === at ? 'now' : '') + '"><i>0' + (i + 1) + '</i>' + s[1] + '</li>').join('') + '</ol>' +
    '<div class="top-right">' + (right || '') + '<button class="icon" data-act="mute" aria-label="소리 켜기/끄기">' + (Audio.isMuted() ? '소리 꺼짐' : '소리 켜짐') + '</button></div></header>' +
    '<main class="scene scene-' + (v.scene === 'result' && ui.watching ? 'court' : v.scene) + (ui.entering ? ' enter' : '') + '">' + body + '</main>';
}
const portrait = (id, cls) => '<span class="face ' + (cls || '') + '" style="background-image:url(assets/art/' + (['lee', 'kim', 'park', 'han'].includes(id) ? 'staff-' + id + '.jpg' : 'silhouette.svg') + ')"></span>';

// ---------- 타이틀 ----------
function title(v) {
  const saved = readSave(), canResume = v.scene !== 'title' || (saved && saved.scene !== 'title');
  return '<main class="title' + (ui.entering ? ' enter' : '') + '"><div class="title-card"><p class="kicker">변호사 시뮬레이션 · 플레이 10~15분</p><h1>THE FIRM</h1>' +
    '<p class="lead">작은 법률사무소의 한 주, 그리고 한 번의 재판.<br>누구에게 무엇을 맡겼는지가 법정에 들고 갈 계획서를 정합니다.</p>' +
    '<div class="title-actions">' + (canResume ? '<button class="btn primary" data-act="resume" data-primary>이어서 하기</button><button class="btn" data-act="new">처음부터</button>' : '<button class="btn primary" data-act="new" data-primary>시작하기</button>') + '</div>' +
    '<ul class="title-points"><li><b>맡긴다</b>네 사람의 시간을 사건에 나눕니다</li><li><b>고친다</b>변호사가 쓴 변론 계획서를 펜으로 고치고 날인합니다</li><li><b>지켜본다</b>공판은 계획대로 흐르고, 결정적인 순간에만 당신을 부릅니다</li></ul>' +
    '<p class="fine">한국을 닮은 가상의 법 세계입니다. 절차와 형량은 게임을 위해 단순화했으며 법률 조언이 아닙니다.' + (v.runs ? ' · 완주 ' + v.runs + '회' : '') + ' <button class="link" data-act="mute">' + (Audio.isMuted() ? '소리 켜기' : '소리 끄기') + '</button></p></div></main>';
}

// ---------- 상담 ----------
function intro(v) {
  const c = v.caseInfo.presentation.consultation, memo = v.caseInfo.presentation.memo;
  if (ui.memo) {
    return frame(v, '<section class="memo paper"><p class="kicker">사건 메모 · 정민호</p><h2>상해 사건을 맡았습니다</h2>' +
      '<div class="memo-grid"><div><h3>무슨 일인가</h3><ul>' + memo.background.map(x => '<li>' + gloss(x) + '</li>').join('') + '</ul></div>' +
      '<div><h3>검찰의 주장</h3><p>' + gloss(memo.prosecution) + '</p><h3>의뢰인의 말</h3><p class="quote">“' + esc(memo.client) + '”</p></div></div>' +
      '<div class="memo-next"><h3>이번 주 사무소가 할 일</h3><p>공판은 다음 주입니다. 그 전에 <b>자료 정리 → 기록 검토</b>를 끝내야 합니다. 기록 검토가 제때 끝나야 담당 변호사가 쓰는 변론 계획서에 확인한 자료가 많이 채워집니다. 사무소에는 다른 사건도 있습니다.</p></div>' +
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
const CHECKS = n => '기본 확인 항목 <b>' + n + '</b>개';
function outlookCard(v) {
  const o = v.outlook, firm = v.firm, org = firm.tasks.find(t => t.id === 'jung-organize'), rev = firm.tasks.find(t => t.id === 'jung-review');
  const f = id => v.forecast.tasks.find(t => t.taskId === id), name = id => (firm.staff.find(s => s.id === id) || { name: '미배정' }).name;
  const link = t => '<div class="chain-item ' + STATUS[f(t.id).status][1] + '"><small>' + esc(t.title.split(' · ')[1]) + ' · ' + esc(name(t.assignee)) + '</small><b>' + (t.completedDay !== null ? dayLabel(firm, t.completedDay) + ' 완료' : dayLabel(firm, f(t.id).predictedCompletionDay) + ' 예상') + '</b><span>기한 ' + dayLabel(firm, t.dueDay) + '</span></div>';
  return '<section class="card outlook tier-' + o.tierId + '"><div><p class="kicker">정민호 변론 계획서 전망</p><p class="big">' + CHECKS(o.budget) + '</p><p class="muted">' + esc(o.settled ? o.label : OUTLOOK_TEXT[o.tierId]) + '</p></div>' +
    '<div class="chain">' + link(org) + '<i>→</i>' + link(rev) + '<i>→</i><div class="chain-item goal"><small>다음 주</small><b>제1회 공판</b><span>기본 확인 ' + o.budget + '개</span></div></div></section>';
}
function intakeCard(v) {
  const it = v.firm.intake; if (it.status !== 'pending') return '';
  const a = game.previewFirm({ type: 'ACCEPT_INTAKE' }), d = game.previewFirm({ type: 'DECLINE_INTAKE' });
  const opt = (p, act, label, extra) => '<button class="choice" data-act="' + act + '"><b>' + label + '</b><span>' + extra + '</span><span>주말 예상 현금 ' + won(p.forecast.projectedCash) + '</span><span class="' + (lateCount(p.forecast) ? 'warn' : '') + '">기한 넘길 업무 ' + lateCount(p.forecast) + '건</span><span>기본 확인 항목 ' + p.outlook.budget + '개</span></button>';
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
      '<span class="fx"><small>확인 항목</small><b class="' + (db > 0 ? 'ok' : db < 0 ? 'bad' : '') + '">' + p.outlook.budget + '개</b></span></button>';
  }).join('');
  const pr = [1, 2, 3].map(n => '<button class="seg ' + (t.priority === n ? 'on' : '') + '" data-act="priority" data-task="' + taskId + '" data-n="' + n + '">' + ['먼저', '보통', '나중'][n - 1] + '</button>').join('');
  return '<div class="sheet wide"><p class="kicker">담당 조정</p><h2>' + esc(t.title) + '</h2><p class="muted">남은 양 ' + (t.requiredHours - t.doneHours) + '시간 · 기한 ' + dayLabel(firm, t.dueDay) + (t.roles.includes('admin') ? '' : ' · 변호사만 할 수 있는 업무') + '. 맡기기 전에 결과를 비교하세요.</p>' +
    '<div class="cands">' + rows + '</div><div class="prio"><span>같은 사람이 여러 일을 맡았을 때의 순서</span><div class="segs">' + pr + '</div></div>' +
    '<div class="actions"><button class="btn" data-act="closeModal">닫기</button></div></div>';
}

// ---------- 한 주 마감 ----------
function weekend(v) {
  const s = v.summary, firm = v.firm, p = v.prep, kept = firm.tasks.filter(t => t.completedDay !== null && t.completedDay <= t.dueDay).length;
  return frame(v, '<section class="weekend"><p class="kicker">6/19 금 · 한 주 마감</p><h1>사무소의 한 주가 끝났습니다</h1>' +
    '<div class="tiles"><div><small>현금</small><b>' + won(s.cash) + '</b><span>' + signed(s.cash - firm.openingCash) + '</span></div><div><small>기한 안에 끝낸 업무</small><b>' + kept + ' / ' + firm.tasks.length + '</b><span>' + (s.refundPaid ? '윤지훈 환급 ' + won(s.refundPaid) : firm.intake.status === 'accepted' ? '윤지훈 약속 지킴' : '윤지훈 사건 거절') + '</span></div>' +
    '<div class="tier-' + p.tierId + '"><small>정민호 기록 검토</small><b>' + esc(p.label.replace('기록 검토를 ', '').replace('기록 검토가 ', '')) + '</b><span>계획서 확인 항목 기본 ' + p.budget + '개</span></div></div>' +
    '<p class="because">' + esc(p.detail) + ' 주말 동안 김현우 변호사가 정민호 사건의 변론 계획서 초안을 씁니다. 공판은 월요일입니다.</p>' +
    '<div class="actions"><button class="btn primary" data-act="beginPlan" data-primary>초안을 받아 본다</button></div></section>');
}

// ---------- 변론 계획서 ----------
const STANCE_MARK = { S_SIG_CONTACT: ['밀침은 인정한다.', '다쳤다는 연결을 다툰다.'], S_SIG_RESERVE: ['접촉 경위는', '기록으로 확인하게 한다.'], S_SIG_DENY: ['밀친 적이', '없다고 다툰다.'] };
const img = id => 'assets/art/staff-' + id + '.jpg';
function statRow(stats) { return '<div class="stats">' + stats.map(x => '<div class="stat-i ' + x.tier + '" title="' + esc(x.use) + '"><small>' + esc(x.label) + '</small><b>' + x.value + '</b></div>').join('') + '</div>'; }
function planBoard(v) {
  const P = v.plan, plan = P.plan, L = P.lawyers.find(l => l.id === plan.lawyerId), stat = id => L.stats.find(x => x.id === id).value;
  const used = plan.checks.length, edited = f => plan.edited.includes(f);
  const stance = STANCE_MARK[plan.stance], focus = P.focus.find(f => f.id === plan.focus);
  const wname = id => P.witnesses.find(w => w.id === id).name;
  const changed = (f, cur) => edited(f) && P.draft[f] !== cur;
  const policy = '<button class="policy" data-act="choose" data-k="stance"><span class="ps-label">방침' + (changed('stance', plan.stance) ? ' <span class="pen">내가 고침</span>' : '') + '</span><h1>' + esc(stance[0]) + '<br><mark>' + esc(stance[1]) + '</mark></h1></button>' +
    '<div class="policy-sub"><span>주력 쟁점 <b>' + esc(focus.short) + '</b>' + (changed('focus', plan.focus) ? ' <span class="pen">고침</span>' : '') + '</span><span>' + Object.entries(focus.time).map(([w, n]) => esc(wname(w)) + ' 질문 ' + n).join(' · ') + '</span><button class="link" data-act="choose" data-k="focus" style="color:var(--pen-600)">주력 바꾸기</button></div>';
  const full = used >= plan.slots;
  const checks = P.checks.map(c => {
    const drafted = P.draft.checks.includes(c.id), mine = c.on && !drafted, dropped = !c.on && drafted;
    const why = mine ? '<span class="pen">직접 넣음</span>' : dropped ? '<span class="pen">뺌</span>' : c.on ? '' : full ? '<span class="why">칸이 가득 참</span>' : '<span class="why">넣을 수 있음</span>';
    return '<button class="check ' + (c.on ? 'on' : 'off') + (mine ? ' mine' : '') + '" data-act="toggleCheck" data-id="' + c.id + '" ' + (!c.on && full ? 'aria-disabled="true"' : '') + ' aria-pressed="' + c.on + '"><span class="box"></span><span><b class="' + (dropped ? 'struck' : '') + '">' + gloss(c.label) + '</b><span class="l">' + esc(c.line) + '</span></span>' + why + '</button>';
  }).join('');
  const wits = P.witnesses.map(w => '<div class="wit"><div><b>' + esc(w.name) + '</b><small>' + esc(w.role) + '</small></div><div>' + esc(w.goal) + '</div><div class="q">질문<b>' + focus.time[w.id] + '</b></div></div>').join('');
  const advice = P.settles
    ? '<div class="advice">' + P.advice.map(a => '<button class="adv ' + (plan.advice === a.id ? 'on' : '') + '" data-act="advice" data-id="' + a.id + '"><span class="box"></span>' + esc(a.short) + (plan.advice === a.id && changed('advice', a.id) ? ' <span class="pen">내 조언</span>' : '') + '</button>').join('') + '</div>'
    : '<p class="paper-muted" style="margin-top:10px">합의 상담을 하지 않습니다. 하려면 위 확인 항목에 <b>합의 상담</b>을 넣으세요(칸 하나를 씁니다).</p>';
  const threats = P.threats.map(t => '<div class="threat">' + (t.ready ? '<span class="mk">대비함</span>' : '<span class="stamp-mini">미확인</span>') + '<q>' + esc(t.text) + '</q><span class="ans">' + (t.ready ? esc(t.answer) : esc(t.counterLabel) + '을(를) 확인하지 않아 받아칠 자료가 없다') + '</span></div>').join('');
  const ready = P.threats.filter(t => t.ready).length;
  const sign = '이 초안은 ' + esc(L.name) + '의 <b>기록 분석 ' + stat('analysis') + '</b>에서 나왔습니다. ' + (stat('analysis') >= 14 ? '기록을 꼼꼼히 읽어 확인 칸을 하나 더 채웠습니다. ' : '') + '사무소의 기록 검토가 ' + (P.tierId === 'on_time' ? '제때 끝나' : P.tierId === 'late' ? '하루 늦어' : '끝나지 않아') + ' 기본 ' + P.prep.budget + '칸입니다.';
  const asksTxt = P.asks ? '공판 중 당신에게 물을 순간 <b>' + P.asks + '번</b> 예상<br>' + esc(L.name) + ' 법정 대응 ' + stat('court') : '<b>' + esc(L.name) + '이(가) 끝까지 진행</b><br>법정 대응 ' + stat('court') + ' · 묻지 않습니다';
  return frame(v, '<section class="desk plan"><div class="desk-note"><h1>변론 계획서에 날인하면 공판이 시작됩니다</h1><span>' + gloss('공판은 계획대로 흐릅니다. 날인 전에 펜으로 고치세요.') + '</span></div>' +
    '<article class="sheet-paper plan-sheet">' +
    '<header class="ps-head"><span>변론 계획서 · 초안 · 2026고단1182 정민호(상해)</span><span>작성 ' + esc(L.name) + ' · 6/20 토 · 제1회 공판 6/22 월</span></header>' +
    '<div class="ps-body"><div class="ps-main">' +
      '<div class="ps-author"><div class="clip"><img src="' + img(L.id) + '" alt="' + esc(L.name) + ' 변호사"></div><div><div class="author-name">' + esc(L.name) + '<small>' + L.years + '년차 · ' + esc(L.specialty) + '</small></div>' + statRow(L.stats) + '<p class="author-note">' + esc(L.note) + ' 출정 비용 ' + won(L.fee) + '</p></div><button class="paper-btn" data-act="lawyers">담당 바꾸기</button></div>' +
      '<div>' + policy + '</div>' +
      '<div><div class="ps-label">' + gloss('확인 항목') + ' <span class="count">' + used + ' / ' + plan.slots + '</span>' + (used < plan.slots ? '<span class="pen">' + (plan.slots - used) + '칸 비었음</span>' : '') + '</div><div class="checks">' + checks + '</div></div>' +
      '<div><div class="ps-label">증인에게 확인할 것</div>' + wits + '</div>' +
      '<div><div class="ps-label">' + gloss('합의') + ' · ' + esc(P.offer.from) + ' ' + esc(P.offer.amount) + '</div><p class="offer">' + esc(P.offer.text) + '</p>' + advice + '</div>' +
    '</div><aside class="ps-margin" aria-label="검사의 예고"><div class="ps-label">검사 윤가람이 할 말 <span class="count">' + ready + ' / ' + P.threats.length + '</span></div>' + threats +
      '<p class="paper-muted" style="font-size:12.5px">검사는 1년차입니다. 예고한 말은 공판에서 그대로 나옵니다.</p></aside></div>' +
    '<footer class="ps-foot"><p class="signature">' + sign + '</p><div class="seal-wrap"><p class="txt">' + asksTxt + '</p><button class="seal" data-act="seal" aria-label="이 계획서에 날인하고 공판에 들어간다">날인</button></div></footer>' +
    '</article></section>');
}
function lawyersModal(v) {
  const P = v.plan, cur = P.plan.lawyerId;
  const rows = P.lawyers.map(l => '<button class="lp" data-act="pickLawyer" data-id="' + l.id + '" ' + (l.id === cur ? 'disabled' : '') + '><img src="' + img(l.id) + '" alt=""><span class="who"><b>' + esc(l.name) + (l.id === cur ? ' · 지금 담당' : '') + '</b><span>' + esc(l.note) + '</span><span class="lp-stats">' + l.stats.map(x => '<span class="' + x.tier + '">' + esc(x.label) + ' ' + x.value + '</span>').join('') + '</span></span>' +
    '<span class="fx"><small>확인 항목</small><b>' + l.slots + '</b></span><span class="fx"><small>당신에게 물음</small><b>' + l.asks + '번</b></span><span class="fx"><small>출정 비용</small><b style="font-size:16px">' + won(l.fee) + '</b></span></button>').join('');
  return '<div class="sheet wide"><p class="kicker">담당 바꾸기</p><h2>누구를 법정에 세울까요</h2><p class="muted">담당을 바꾸면 그 변호사가 초안을 처음부터 다시 씁니다. 고친 내용은 사라집니다.</p><div class="lawyer-pick">' + rows + '</div>' +
    '<p class="fine">기록 분석 14 이상: 확인 항목 +1 · 신문 15 이상: 증인마다 질문 +1 · 법정 대응 13 이상: 유도신문에 스스로 이의 · 협상 13 이상: 합의 상담을 초안에 넣음</p><div class="actions"><button class="btn" data-act="closeModal">닫기</button></div></div>';
}
function chooseModal(v, k) {
  const P = v.plan, plan = P.plan;
  const list = k === 'stance' ? P.stances.map(x => ({ id: x.id, title: x.short, sub: x.id === 'S_SIG_DENY' ? '의뢰인은 “몸은 건드리지 않았다”고 했습니다. 영상과 맞지 않으면 신뢰를 잃습니다.' : x.id === 'S_SIG_RESERVE' ? '입장을 밝히지 않고 검찰의 입증을 지켜봅니다.' : '밀침은 다투지 않고 상해와의 연결만 다툽니다.' }))
    : P.focus.map(x => ({ id: x.id, title: x.short, sub: Object.entries(x.time).map(([w, n]) => P.witnesses.find(y => y.id === w).name + ' 질문 ' + n).join(' · ') }));
  return '<div class="sheet"><p class="kicker">' + (k === 'stance' ? gloss('모두진술') + ' · 방침' : '주력 쟁점') + '</p><h2>' + (k === 'stance' ? '법정에서 무엇을 다툴까요' : '누구에게 더 오래 물을까요') + '</h2><div class="opt-list">' +
    list.map(o => '<button class="choice ' + (plan[k] === o.id ? 'on' : '') + '" data-act="setPlan" data-k="' + k + '" data-id="' + o.id + '"><b>' + esc(o.title) + '</b><span>' + esc(o.sub) + '</span></button>').join('') + '</div><div class="actions"><button class="btn" data-act="closeModal">닫기</button></div></div>';
}

// ---------- 공판: 계획대로 흐르고, 결정적인 순간에만 묻는다 ----------
function speakerOf(v, id) {
  const t = v.court.trial, pr = v.caseInfo.presentation, w = t.definition.witnesses.find(x => x.id === id);
  if (w) return { name: w.name, role: w.role.split(' · ')[0], cls: 'witness' };
  const L = v.plan.lawyers.find(l => l.id === v.plan.plan.lawyerId);
  return ({ JUDGE: { name: '재판장', role: '', cls: 'judge' }, PROSECUTOR: { name: pr.prosecutors[v.caseInfo.prosecutorId].name, role: '검사', cls: 'pros' }, DEFENSE: { name: L.name, role: '변호인', cls: 'def' }, CLIENT: { name: pr.client.name, role: '피고인', cls: 'client' }, VICTIM: { name: pr.victim.name, role: '피해자', cls: 'witness' } })[id] || { name: id, role: '', cls: '' };
}
function credWords(n) { return n >= 3 ? ['믿고 지켜보는 중', 'ok'] : n === 2 ? ['조금 지켜보는 중', 'warn'] : ['신뢰가 낮음 — 다음 반대신문 질문 1번 감소', 'bad']; }
function courtRecords(v) {
  const recs = v.court.trial.displayRecords.filter(r => r.lines && r.lines.length), from = recs.findIndex(r => r.kind === 'trial_open');
  return recs.slice(Math.max(0, from));
}
function recordHtml(v, r, fresh) {
  const lines = r.lines.map(l => { const s = speakerOf(v, l.speaker); return '<div class="line ' + s.cls + '"><span class="spk">' + esc(s.name) + (s.role ? '<small>' + esc(s.role) + '</small>' : '') + '</span><p>' + gloss(l.text) + '</p></div>'; }).join('');
  const marks = (r.memo ? '<span class="note ' + (r.tone || 'neutral') + '">재판장 메모 · ' + esc(r.memo) + '</span>' : '') + (r.credibility < 0 ? '<span class="note bad">재판장의 신뢰가 낮아졌습니다</span>' : '') + (r.kind === 'objection' && r.source === 'defense' ? '<span class="note ' + (r.ruling === 'sustained' ? 'defense' : 'bad') + '">이의 ' + (r.ruling === 'sustained' ? '인용' : '기각') + '</span>' : '') + (r.missed ? '<span class="note bad">놓친 것 · ' + esc(r.missed) + '</span>' : '');
  return '<div class="rec k-' + r.kind + (fresh ? ' fresh' : '') + '">' + lines + (marks ? '<div class="marks">' + marks + '</div>' : '') + '</div>';
}
function askPanel(v) {
  const a = v.ask, L = v.plan.lawyers.find(l => l.id === v.plan.plan.lawyerId), w = v.court.trial.definition.witnesses.find(x => x.id === a.witnessId);
  return '<div class="ask-panel"><img src="' + img(L.id) + '" alt="' + esc(L.name) + '"><div><p class="who"><b>' + esc(L.name) + '</b>법정 대응 ' + L.stats.find(x => x.id === 'court').value + ' · 판단을 넘깁니다</p>' +
    '<p class="hand">검사님 질문, 이거 그냥 둬도 될까요?</p><blockquote>“' + esc(a.question[1] || a.question) + '”</blockquote>' +
    '<p class="muted" style="margin-bottom:12px">' + gloss('증인 ' + w.name + ' 씨가 직접 보거나 맡은 범위 밖의 결론을 "네" 한마디로 받아 내려는 질문이면 유도신문입니다. 맞는 이의는 불리한 답변을 막고, 빗나간 이의는 재판장의 신뢰를 깎습니다.') + '</p>' +
    '<div class="row"><button class="btn primary" data-act="decide" data-v="1" data-primary>이의 있습니다</button><button class="btn" data-act="decide" data-v="0">그냥 둡니다</button></div></div></div>';
}
function sidePanel(v) {
  const t = v.court.trial, p = t.projection, w = t.witness, cred = credWords(p.credibility), P = v.plan, L = P.lawyers.find(l => l.id === P.plan.lawyerId);
  const who = w ? '<section class="card witness-card">' + portrait(null, 'lg') + '<h3>' + esc(w.name) + '</h3><p class="muted">' + esc(w.role) + '</p></section>' : '';
  const issues = p.issues.map(i => '<div class="issue band-' + i.band + '"><div><b>' + esc(i.title) + '</b><span class="chip band-' + i.band + '">' + esc(v.court.bandLabels[i.band] || i.band) + '</span></div><ul>' + i.notes.slice(-2).map(n => '<li class="' + n.tone + '">' + esc(n.text) + '</li>').join('') + '</ul></div>').join('');
  return who + '<section class="card"><div class="card-head"><h2>재판장 메모</h2></div>' + issues + '<p class="cred ' + cred[1] + '">' + gloss('재판장의 신뢰') + ' · ' + cred[0] + '</p></section>' +
    '<section class="card plan-pin"><small>날인한 계획 · ' + esc(L.name) + '</small><b>' + esc(STANCE_MARK[P.plan.stance].join(' ')) + '</b><span>확인 ' + P.plan.checks.length + '개 · 대비한 예고 ' + P.threats.filter(x => x.ready).length + ' / ' + P.threats.length + '</span></section>';
}
function courtScene(v) {
  const recs = courtRecords(v), shown = Math.min(ui.shown, recs.length), done = shown >= recs.length;
  const body = recs.slice(0, shown).map((r, i) => recordHtml(v, r, i >= ui.seenShown)).join('');
  ui.seenShown = shown;
  const finished = v.scene === 'result';
  const bar = !done ? '<div class="waiting"><i></i>공판이 진행 중입니다 · ' + shown + ' / ' + recs.length + '<button class="link" data-act="skipAhead" style="margin-left:auto">' + (v.ask ? '결정할 순간까지 넘기기' : '선고 직전까지 넘기기') + '</button></div>'
    : v.ask ? askPanel(v) : finished ? '<div class="ask center"><p>' + esc(v.court.trial.legalProcedure.sentencingDate) + '</p><button class="btn primary big" data-act="toResult" data-primary>판결과 결산을 본다</button></div>' : '';
  const head = '<div class="court-head"><p><b>제1회 공판</b>계획대로 진행합니다. 결정적인 순간에만 멈춥니다.</p><div class="speed" role="group" aria-label="진행 속도"><button class="' + (ui.speed === 'normal' ? 'on' : '') + '" data-act="speed" data-v="normal">보통</button><button class="' + (ui.speed === 'fast' ? 'on' : '') + '" data-act="speed" data-v="fast">빠르게</button></div></div>';
  return frame(v, '<div class="court-grid"><div class="col stage auto">' + head + '<div class="scroll" id="scroll">' + body + '</div><div class="bar-wrap">' + bar + '</div></div><aside class="col side">' + sidePanel(v) + '</aside></div>');
}
let playTimer = null;
function schedulePlay() {
  clearTimeout(playTimer);
  const v = game.view();
  if (!v.court || !(v.scene === 'court' || (v.scene === 'result' && ui.watching)) || ui.showTitle || ui.modal) return;
  const total = courtRecords(v).length;
  if (ui.shown >= total) return;
  playTimer = setTimeout(() => { ui.shown += 1; Audio.play('tick'); render(); }, ui.speed === 'fast' ? 420 : 1150);
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
    '<section class="ledger"><h2>사무소 결산</h2><div class="tiles"><div><small>한 주 현금 변화</small><b>' + signed(s.weekDelta) + '</b><span>마감 ' + won(s.weekCash) + '</span></div><div><small>' + gloss('성공보수') + '</small><b>' + signed(s.successFee) + '</b><span>' + esc(o.headline) + '</span></div><div><small>출정 비용</small><b>' + signed(-s.courtFee) + '</b><span>' + esc(v.plan.lawyers.find(l => l.id === v.plan.plan.lawyerId).name) + ' 하루</span></div><div><small>최종 현금</small><b>' + won(s.finalCash) + '</b><span>기한 지킨 업무 ' + s.promisesKept + ' / ' + s.promisesTotal + '</span></div><div class="tier-' + v.prep.tierId + '"><small>계획서 확인 항목</small><b>' + v.plan.plan.checks.length + ' / ' + v.plan.plan.slots + '개</b><span>' + esc(v.prep.label) + '</span></div></div>' +
    '<div class="actions"><button class="btn" data-act="records">공판 기록 전체</button><button class="btn" data-act="retry">계획서를 고쳐 다시</button><button class="btn primary" data-act="new" data-primary>새 한 주를 시작한다</button></div><p class="fine">' + esc(v.court.pack.disclaimer) + '</p></section>');
}

// ---------- 그리기 ----------
const SCENES = { title, intro, office, weekend, plan: planBoard, court: courtScene, result };
function modalHtml(v) {
  const m = ui.modal;
  if (m.type === 'report') return reportModal(v);
  if (m.type === 'assign') return assignModal(v, m.id);
  if (m.type === 'lawyers') return lawyersModal(v);
  if (m.type === 'choose') return chooseModal(v, m.id);
  if (m.type === 'records') return '<div class="sheet wide"><p class="kicker">공판 기록</p><h2>말과 답변, 순서대로</h2><div class="scroll plain">' + courtRecords(v).map(r => recordHtml(v, r, false)).join('') + '</div><div class="actions"><button class="btn primary" data-act="closeModal" data-primary>닫기</button></div></div>';
  return '';
}
function render() {
  const v = game.view();
  const watchingCourt = v.scene === 'court' || (v.scene === 'result' && ui.watching);
  const sceneKey = ui.showTitle ? 'title' : watchingCourt ? 'court' : v.scene + (v.scene === 'intro' && ui.memo ? ':memo' : '');
  ui.entering = ui.lastScene !== sceneKey;
  if (ui.entering) { if (sceneKey === 'result') Audio.play('gavel'); ui.lastScene = sceneKey; window.scrollTo(0, 0); }
  const modalKey = ui.modal ? ui.modal.type + (ui.modal.id || '') : null, modalEnter = modalKey !== ui.modalKey; ui.modalKey = modalKey;
  app.innerHTML = ui.showTitle ? title(v) : (watchingCourt ? courtScene(v) : SCENES[v.scene](v));
  modalRoot.innerHTML = ui.modal ? '<div class="backdrop' + (modalEnter ? ' enter' : '') + '" data-act="closeModal"></div><div class="modal' + (modalEnter ? ' enter' : '') + '" role="dialog" aria-modal="true">' + modalHtml(v) + '</div>' : '';
  closePops();
  if (v.court && watchingCourt) {
    const recs = courtRecords(v).slice(0, ui.shown), p = v.court.trial.projection, last = recs[recs.length - 1];
    if (last && last.seq > ui.seenSeq) {
      if (last.credibility < 0) { toast('재판장의 신뢰가 낮아졌습니다' + (last.memo ? ' — ' + last.memo : ''), 'bad'); Audio.play('alert'); }
      else if (last.tone === 'defense') Audio.play('gain');
      if (last.kind === 'cross_start' && last.warned) toast('신뢰가 낮아 이번 반대신문 질문이 1번 줄었습니다', 'bad');
      ui.seenSeq = last.seq;
    }
    ui.lastCred = p.credibility;
    const sc = $('#scroll'); if (sc) sc.scrollTop = sc.scrollHeight;
  }
  const focusEl = (ui.modal ? modalRoot : app).querySelector('[data-primary]:not([disabled])'); if (focusEl) focusEl.focus({ preventScroll: true });
  schedulePlay();
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
  resume() {
    if (game.view().scene !== 'title') { ui.showTitle = false; Audio.play('page'); render(); return; }
    const res = game.load(readSave());
    if (!res.ok) { toast('저장을 읽지 못해 처음부터 시작합니다.', 'bad'); ui = freshUi(); run('newGame'); return; }
    ui = freshUi(); const v = game.view(); if (v.court) { ui.shown = ui.seenShown = courtRecords(v).length; ui.seenSeq = Infinity; } Audio.play('page'); render();
  },
  nextIntro() { const n = game.view().caseInfo.presentation.consultation.lines.length; if (ui.intro < n - 1) ui.intro++; else ui.memo = true; Audio.play('tick'); render(); },
  skipIntro() { ui.memo = true; render(); },
  finishIntro() { run('finishIntro', {}, 'page'); },
  accept() { run('firm', { action: { type: 'ACCEPT_INTAKE' } }, 'tick'); },
  decline() { run('firm', { action: { type: 'DECLINE_INTAKE' } }, 'tick'); },
  advance() { if (run('firm', { action: { type: 'ADVANCE_DAY' } }, 'day')) { ui.modal = { type: 'report' }; render(); } },
  report() { ui.modal = { type: 'report' }; render(); },
  records() { ui.modal = { type: 'records' }; render(); },
  assign(d) { ui.modal = { type: 'assign', id: d.id }; render(); },
  doAssign(d) { ui.modal = null; if (run('firm', { action: { type: 'ASSIGN_TASK', taskId: d.task, staffId: d.staff } }, 'tick')) toast('담당을 바꿨습니다. 전망을 다시 계산했습니다.'); },
  priority(d) { run('firm', { action: { type: 'SET_PRIORITY', taskId: d.task, priority: Number(d.n) } }, 'tick'); },
  closeModal() { ui.modal = null; Audio.play('tick'); render(); },
  beginPlan() { run('beginPlan', {}, 'page'); },
  lawyers() { ui.modal = { type: 'lawyers' }; render(); },
  pickLawyer(d) { ui.modal = null; if (run('editPlan', { field: 'lawyer', value: d.id }, 'page')) toast('담당을 바꿨습니다. 새 담당이 초안을 다시 썼습니다.'); },
  choose(d) { ui.modal = { type: 'choose', id: d.k }; render(); },
  setPlan(d) { const cur = game.view().plan.plan[d.k]; ui.modal = null; if (cur === d.id) { render(); return; } run('editPlan', { field: d.k, value: d.id }, 'tick'); },
  toggleCheck(d) { run('editPlan', { field: 'check', value: d.id }, 'tick'); },
  advice(d) { if (game.view().plan.plan.advice === d.id) return; run('editPlan', { field: 'advice', value: d.id }, 'tick'); },
  seal() { ui.shown = 0; ui.seenShown = 0; ui.seenSeq = 0; ui.watching = true; run('sealPlan', {}, 'gavel'); },
  decide(d) { ui.watching = true; run('decide', { object: d.v === '1' }, 'tick'); },
  speed(d) { ui.speed = d.v; render(); },
  skipAhead() { ui.shown = courtRecords(game.view()).length; render(); },
  toResult() { ui.watching = false; render(); },
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
