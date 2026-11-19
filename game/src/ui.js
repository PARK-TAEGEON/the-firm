(function (root) {
'use strict';
// PORTFOLIO-001/002 화면. 상태는 session 서비스가 소유하고, 여기서는 view를 그리고 명령을 보낼 뿐이다.
// 판정·경제 계산을 하지 않는다. 화면 전용 상태(ui)는 저장하지 않는다.
const Game = root.FirmGame, Audio = root.FirmAudio, Gloss = root.FirmGlossary, Loop = root.FirmLoop;
const SAVE_KEY = 'thefirm.portfolio.v2';
const $ = sel => document.querySelector(sel);
const app = $('#app'), modalRoot = $('#modal'), popRoot = $('#pops'), toastRoot = $('#toasts');

let game = Game.createGame();
const THEME_KEY = 'thefirm.theme';
try { const th = localStorage.getItem(THEME_KEY); if (th) document.documentElement.dataset.theme = th; } catch (e) { /* 저장소 없음 */ }
let ui = freshUi();
function freshUi() { return { planMore: false, read: new Set(), sel: null, inboxTab: 'all', ctrl: {}, intro: 0, memo: false, modal: null, seenSeq: 0, shown: 0, seenShown: 0, speed: 'normal', watching: false, lastCred: null, lastScene: null, showTitle: false }; }

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

// ---------- 툴팁: 화면에는 단어만, 자세한 건 올리거나 누르면 ----------
// tip(제목, 줄들) → data-tip 속성. 줄은 이미 escape된 HTML이어야 한다.
function tip(head, lines) {
  const body = '<b>' + esc(head) + '</b>' + (lines || []).filter(Boolean).map(l => '<span>' + l + '</span>').join('');
  return ' data-tip="' + esc(body) + '" tabindex="0"';
}
const t = s => esc(s);

// ---------- 공통 틀 ----------
const STEPS = [['intro', '상담'], ['office', '사무소'], ['plan', '계획서'], ['court', '공판'], ['result', '결산']];
function stepIndex(scene) { return scene === 'weekend' ? 1 : scene === 'result' && ui.watching ? 3 : STEPS.findIndex(s => s[0] === scene); }
// 매트 위 빛: 월요일 오후의 창빛에서 금요일 밤 스탠드 불빛으로. 남은 날을 분위기로도 보여 준다.
function dayClass(v) {
  if (v.scene === 'office' && v.firm) return ' day-' + Math.min(v.firm.dayIndex, 4);
  return v.scene === 'weekend' || v.scene === 'plan' ? ' day-5' : '';
}
function frame(v, body, right) {
  const at = stepIndex(v.scene);
  return '<header class="top"><button class="brand" data-act="title" aria-label="처음 화면으로">THE FIRM</button>' +
    '<ol class="rail">' + STEPS.map((s, i) => '<li class="' + (i < at ? 'done' : i === at ? 'now' : '') + '">' + s[1] + '</li>').join('') + '</ol>' +
    '<div class="top-right">' + (right || '') + '<button class="icon" data-act="theme"' + tip('색 시안', [document.documentElement.dataset.theme === 'cool' ? '지금: 차가운 남색' : '지금: 따뜻한 기록철']) + ' aria-label="색 시안 바꾸기">◐</button><button class="icon" data-act="mute" aria-label="' + (Audio.isMuted() ? '소리 켜기' : '소리 끄기') + '">' + (Audio.isMuted() ? '♪̸' : '♪') + '</button></div></header>' +
    '<main class="scene scene-' + (v.scene === 'result' && ui.watching ? 'court' : v.scene) + dayClass(v) + (ui.entering ? ' enter' : '') + '">' + body + '</main>';
}
const portrait = (id, cls) => '<span class="face ' + (cls || '') + '" style="background-image:url(assets/art/' + (['lee', 'kim', 'park', 'han'].includes(id) ? 'staff-' + id + '.jpg' : 'silhouette.svg') + ')"></span>';

// ---------- 타이틀 ----------
function title(v) {
  const saved = readSave(), canResume = v.scene !== 'title' || (saved && saved.scene !== 'title');
  return '<main class="title' + (ui.entering ? ' enter' : '') + '"><div class="title-card"><h1>THE FIRM</h1><p class="lead">한 주, 그리고 한 번의 재판</p>' +
    '<div class="title-actions">' + (canResume ? '<button class="btn primary" data-act="resume" data-primary>이어서</button><button class="btn" data-act="new">처음부터</button>' : '<button class="btn primary" data-act="new" data-primary>시작</button>') + '</div>' +
    '<ul class="title-points"><li' + tip('맡긴다', ['네 사람의 시간을 사건에 나눈다']) + '>맡긴다</li><li' + tip('고친다', ['변호사가 쓴 변론 계획서를 펜으로 고치고 날인한다']) + '>고친다</li><li' + tip('지켜본다', ['공판은 계획대로 흐르고, 결정적인 순간에만 부른다']) + '>지켜본다</li></ul>' +
    '<p class="fine"><span' + tip('가상의 법 세계', ['한국을 닮았지만 절차와 형량은 게임을 위해 단순화했다', '법률 조언이 아니다']) + '>가상의 법 세계</span>' + (v.runs ? ' · 완주 ' + v.runs + '회' : '') + '</p></div></main>';
}

// ---------- 상담 ----------
function intro(v) {
  const c = v.caseInfo.presentation.consultation, memo = v.caseInfo.presentation.memo;
  if (ui.memo) {
    const facts = v.caseInfo.memoWords.map((w, i) => '<li' + tip(w, [esc(memo.background[i])]) + '>' + esc(w) + '</li>').join('');
    const people = memo.people.slice(0, 4).map(p => { const name = p.split(/[(:]/)[0].trim(); return '<li' + tip(name, [esc(p)]) + '>' + esc(name) + '</li>'; }).join('');
    return frame(v, '<section class="memo paper"><p class="kicker">사건 메모</p><h2>정민호 · 상해</h2>' +
      '<div class="memo-rows"><div><small>사건</small><ul class="words">' + facts + '</ul></div><div><small>사람</small><ul class="words">' + people + '</ul></div>' +
      '<div><small>검찰</small><ul class="words"><li' + tip('검찰의 주장', [gloss(memo.prosecution)]) + '>밀침 → 상해</li></ul></div><div><small>의뢰인</small><p class="quote">“' + esc(memo.client) + '”</p></div>' +
      '<div><small>이번 주</small><ul class="words"><li' + tip('자료 정리', ['기록 검토를 시작하려면 먼저 끝나야 한다']) + '>자료 정리</li><li class="arrow">→</li><li' + tip('기록 검토', ['제때 끝날수록 변론 계획서에 확인 항목이 많이 채워진다', '기한 6/17 수']) + '>기록 검토</li><li class="arrow">→</li><li' + tip('공판', ['다음 주 월요일']) + '>공판</li></ul></div></div>' +
      '<div class="actions"><button class="btn primary" data-act="finishIntro" data-primary>사무소로</button></div></section>');
  }
  const line = c.lines[ui.intro], sp = c.speakers.find(s => s.id === line.speaker), mine = line.speaker === 'DEFENSE';
  return frame(v, '<section class="stage-photo" style="background-image:url(assets/art/office_lounge.jpg)"><div class="place">첫 상담</div>' +
    '<div class="dialogue ' + (mine ? 'mine' : '') + '">' + portrait(null) + '<div class="say"><b' + tip(sp.name, [esc(sp.detail)]) + '>' + esc(sp.name) + '</b><p key="' + ui.intro + '">' + gloss(line.text) + '</p></div>' +
    '<div class="dialogue-foot"><span>' + (ui.intro + 1) + ' / ' + c.lines.length + '</span><button class="link" data-act="skipIntro">건너뛰기</button><button class="btn primary" data-act="nextIntro" data-primary>계속</button></div></div></section>');
}

// ---------- 사무소 ----------
const STATUS = { completed: ['끝', 'ok'], on_time: ['기한 안', 'ok'], late: ['넘김', 'bad'], beyond_horizon: ['못 끝냄', 'bad'] };
const lateCount = f => f.tasks.filter(t => t.status === 'late' || t.status === 'beyond_horizon').length;
const TIER_WORD = { on_time: '기한 안', late: '기한 넘김', unfinished: '못 끝냄' };
const TRIAL_ISO = '2026-06-22';
const caseOf = taskId => taskId.split('-')[0];
const shortTask = title => title.split(' · ')[1] || title;
function daysUntil(firm, iso) {
  const from = new Date(firm.dates[Math.min(firm.dayIndex, firm.dates.length - 1)] + 'T00:00:00'), to = new Date(iso + 'T00:00:00');
  return Math.round((to - from) / 86400000);
}

// ---------- 사무소: FM식 요약 띠 · 받은 편지함 · 주간 일정표 ----------
function stripCell(key, label, value, sub, tipHtml, cls) {
  return '<div class="cell ' + (cls || '') + '" data-cell="' + key + '"' + tipHtml + '><small>' + label + '</small><b>' + value + '</b>' + (sub ? '<em>' + sub + '</em>' : '') + '</div>';
}
function officeStrip(v) {
  const firm = v.firm, fc = v.forecast, o = v.outlook, must = v.inbox.filter(m => m.must).length, late = lateCount(fc);
  const org = fc.tasks.find(x => x.taskId === 'jung-organize'), rev = fc.tasks.find(x => x.taskId === 'jung-review');
  const when = f => f.status === 'completed' ? '끝' : dayLabel(firm, f.predictedCompletionDay);
  const dd = daysUntil(firm, TRIAL_ISO);
  return '<div class="strip">' +
    stripCell('cash', '현금', won(firm.cash), '주말 ' + won(fc.projectedCash), tip('현금', ['주말 예상 ' + won(fc.projectedCash), '들어올 돈 ' + won(fc.expectedIncome), '나갈 돈 ' + won(fc.totalPlannedCost)])) +
    stripCell('trial', '정민호 공판', '6/22 월', 'D-' + dd, tip('제1회 공판', ['윤가람 검사', '6/22 월 · ' + dd + '일 남음'])) +
    stripCell('budget', '확인 항목', String(o.budget), TIER_WORD[o.tierId], tip('확인 항목 ' + o.budget + '개', ['자료 정리 ' + when(org) + ' → 기록 검토 ' + when(rev), '기록 검토 기한 ' + dayLabel(firm, firm.tasks.find(x => x.id === 'jung-review').dueDay), '기한 안 3 · 넘김 2 · 못 끝냄 1']), o.tierId === 'on_time' ? 'good' : 'bad') +
    stripCell('late', '넘길 업무', String(late), '전체 ' + firm.tasks.length, tip('기한을 넘길 업무', fc.tasks.filter(t => t.status === 'late' || t.status === 'beyond_horizon').map(t => esc(t.title)).concat(late ? [] : ['없음'])), late ? 'bad' : '') +
    stripCell('must', '응답 필요', String(must), must ? '새 의뢰' : '없음', tip('응답 필요', [must ? '결정해야 하루를 넘길 수 있다' : '밀린 결정 없음']), must ? 'warn' : '') +
    '</div>';
}
const TAGS = { case: '사건', court: '법원', intake: '의뢰', report: '보고' };
function inboxList(v) {
  const firm = v.firm, unread = v.inbox.filter(m => !ui.read.has(m.id)).length;
  const items = v.inbox.filter(m => ui.inboxTab !== 'unread' || !ui.read.has(m.id));
  let lastDay = null;
  const rows = items.map(m => {
    const head = m.day !== lastDay ? '<li class="day">' + dayLabel(firm, m.day) + '</li>' : ''; lastDay = m.day;
    return head + '<li><button class="msg' + (ui.sel === m.id ? ' sel' : '') + (ui.read.has(m.id) ? '' : ' unread') + (m.must ? ' must' : '') + '" data-act="openMsg" data-id="' + m.id + '"><small>' + esc(m.from) + '</small><b>' + esc(m.title) + '</b><span class="tag t-' + m.tag + '">' + TAGS[m.tag] + '</span>' + (m.must ? '<i class="must-dot" aria-label="응답 필요"></i>' : '') + '</button></li>';
  }).join('');
  return '<section class="panel inbox"><div class="phead"><h2 class="ptitle">받은 편지함</h2></div>' +
    '<div class="tabs"><button class="' + (ui.inboxTab !== 'unread' ? 'on' : '') + '" data-act="inboxTab" data-v="all">전체</button><button class="' + (ui.inboxTab === 'unread' ? 'on' : '') + '" data-act="inboxTab" data-v="unread">안 읽음 (' + unread + ')</button></div>' +
    '<ul class="msgs">' + (rows || '<li class="empty">없음</li>') + '</ul></section>';
}
function readPane(v) {
  const firm = v.firm, m = v.inbox.find(x => x.id === ui.sel) || v.inbox[0];
  const head = (face, from, title) => '<header class="rhead">' + face + '<div><small>' + esc(from) + '</small><h3>' + esc(title) + '</h3></div><time>' + dayLabel(firm, m.day) + '</time></header>';
  const words = list => '<ul class="rwords">' + list.join('') + '</ul>';
  const w = (word, tipHtml, cls) => '<li class="' + (cls || '') + '"' + (tipHtml || '') + '>' + word + '</li>';
  let body = '', band = '';
  if (m.tag === 'case') {
    const memo = v.caseInfo.presentation.memo;
    body = words(v.caseInfo.memoWords.map((x, i) => w(esc(x), i === 0 ? tip('검찰의 주장', [gloss(memo.prosecution)]) : ''))) + '<p class="rquote">“' + esc(memo.client) + '”</p>';
  } else if (m.tag === 'court') {
    body = words([w('제1회 공판'), w('6/22 월'), w('윤가람 검사', tip('윤가람', ['1년차 · 이번 사건 공소 담당']))]);
  } else if (m.tag === 'intake') {
    const it = firm.intake;
    body = words([w('착수금 ' + won(it.upfront)), w('잔금 ' + won(it.balance)), w('준비 16시간', tip('추가 업무', ['자료 취합 · 초기 검토 · 준비 보고'])), w('기한 ' + dayLabel(firm, it.dueDay), tip('약속', ['이날까지 준비 보고를 못 내면 착수금 절반 환급']))]);
    if (it.status === 'pending') {
      const a = game.previewFirm({ type: 'ACCEPT_INTAKE' }), d = game.previewFirm({ type: 'DECLINE_INTAKE' });
      const opt = (p, act, label, primary) => '<button class="btn ' + (primary ? 'primary' : '') + '" data-act="' + act + '"' + tip(label, ['주말 현금 ' + won(p.forecast.projectedCash), '넘길 업무 ' + lateCount(p.forecast) + '건', '정민호 확인 항목 ' + p.outlook.budget + '개']) + '>' + label + ' <span class="nums">' + won(p.forecast.projectedCash) + ' · 넘김 ' + lateCount(p.forecast) + '</span></button>';
      band = '<footer class="must-band"><b>응답 필요</b><div>' + opt(d, 'decline', '거절') + opt(a, 'accept', '맡는다', true) + '</div></footer>';
    } else body += '<p class="rstate"><span class="chip ' + (it.status === 'accepted' ? 'ok' : '') + '">' + (it.status === 'accepted' ? '맡음' : '거절함') + '</span></p>';
  } else if (m.tag === 'report') {
    const r = firm.reports[m.report], name = id => firm.staff.find(s => s.id === id).name, task = id => shortTask(firm.tasks.find(x => x.id === id).title);
    const hours = r.work.reduce((a, x) => a + x.hours, 0);
    body = words([w(hours + '시간'), w('완료 ' + r.completed.length, r.completed.length ? tip('완료', r.completed.map(id => esc(firm.tasks.find(x => x.id === id).title))) : '', r.completed.length ? 'ok' : ''),
      w('넘김 ' + r.lateTasks.length, r.lateTasks.length ? tip('기한 넘김', r.lateTasks.map(id => esc(firm.tasks.find(x => x.id === id).title))) : '', r.lateTasks.length ? 'bad' : ''),
      w(signed(r.cashAfter - r.cashBefore), tip('현금', ['입금 ' + won(r.income), '지출 ' + won(r.expenses), '잔액 ' + won(r.cashAfter)]))]) +
      '<ul class="rwork">' + r.work.map(x => '<li>' + portrait(x.staffId, 'sm') + '<span>' + esc(name(x.staffId)) + '</span><em>' + esc(task(x.taskId)) + '</em><b>' + x.hours + 'h</b></li>').join('') + '</ul>';
  }
  const face = m.fromId ? portrait(m.fromId) : '<span class="face mono-face">' + esc(m.from.slice(0, 1)) + '</span>';
  return '<section class="panel read' + (band ? ' has-band' : '') + '">' + head(face, m.from, m.title) + '<div class="rbody">' + body + '</div>' + band + '</section>';
}
function weekGrid(v) {
  const firm = v.firm, fc = v.forecast, today = firm.dayIndex;
  const workOn = day => day < today ? (firm.reports.find(r => r.day === day) || { work: [] }).work : (fc.days.find(d => d.day === day) || { work: [] }).work;
  const days = firm.dates.slice(0, 5).map((_, i) => i);
  const head = '<div class="wk-h"></div>' + days.map(i => '<div class="wk-h' + (i === today ? ' now' : '') + (i < today ? ' past' : '') + '">' + dayLabel(firm, i) + '</div>').join('');
  const rows = firm.staff.map(s => {
    const t0 = fc.today.find(x => x.staffId === s.id), idle = !firm.completed && t0.scheduledHours < s.capacity;
    const cells = days.map(i => {
      const work = workOn(i).filter(x => x.staffId === s.id), used = work.reduce((a, x) => a + x.hours, 0);
      const blocks = work.map(x => { const k = firm.tasks.find(t => t.id === x.taskId), f = fc.tasks.find(t => t.taskId === x.taskId), lateB = f && (f.status === 'late' || f.status === 'beyond_horizon');
        return '<span class="blk c-' + caseOf(x.taskId) + (lateB ? ' late' : '') + '" style="flex:' + x.hours + '"' + tip(k.title, [x.hours + '시간 · ' + (i < today ? '한 일' : i === today ? '오늘 예정' : '예정'), '기한 ' + dayLabel(firm, k.dueDay), lateB ? '기한 넘김 예상' : '']) + '>' + esc(shortTask(k.title)) + '</span>'; }).join('');
      const gap = s.capacity - used;
      return '<div class="wk-c' + (i === today ? ' now' : '') + (i < today ? ' past' : '') + '">' + blocks + (gap > 0 ? '<span class="blk gap" style="flex:' + gap + '"' + tip(s.name + ' · ' + dayLabel(firm, i), ['빈 시간 ' + gap + '시간']) + '></span>' : '') + '</div>';
    }).join('');
    return '<div class="wk-p"' + tip(s.name, [(s.role === 'lawyer' ? '변호사' : '사무직원') + ' · ' + esc(s.specialty), '하루 ' + s.capacity + '시간 · 시간당 ' + won(s.hourlyCost), idle ? '오늘 ' + t0.scheduledHours + ' / ' + s.capacity + '시간' : '']) + '>' + portrait(s.id, 'sm') + '<b>' + esc(s.name) + '</b>' + (idle ? '<em>' + (t0.assignedRemainingHours > t0.scheduledHours ? '대기' : '빔') + '</em>' : '') + '</div>' + cells;
  }).join('');
  return '<section class="panel week"><div class="phead"><h2 class="ptitle">일정</h2><span class="legend"><i class="c-jung"></i>정민호<i class="c-go"></i>고은아' + (firm.intake.status === 'accepted' ? '<i class="c-yoon"></i>윤지훈' : '') + '</span></div><div class="table-wrap"><div class="wk">' + head + rows + '</div></div></section>';
}
function taskPanel(v) {
  const firm = v.firm, fc = v.forecast, staff = id => firm.staff.find(s => s.id === id);
  const rows = firm.tasks.map(k => {
    const f = fc.tasks.find(x => x.taskId === k.id), st = STATUS[f.status], waits = k.completedDay === null && k.requires.some(r => firm.tasks.find(x => x.id === r).completedDay === null);
    const when = k.completedDay !== null ? dayLabel(firm, k.completedDay) : dayLabel(firm, f.predictedCompletionDay);
    const who = k.assignee ? portrait(k.assignee, 'sm') + '<span>' + esc(staff(k.assignee).name) + '</span>' : '<span>미배정</span>';
    return '<li class="task r-' + st[1] + '"><div class="tt"><i class="dot c-' + caseOf(k.id) + '"></i><b' + tip(k.title, ['남은 ' + (k.requiredHours - k.doneHours) + '시간', '기한 ' + dayLabel(firm, k.dueDay) + ' · 예상 ' + when, waits ? '앞 업무가 끝나야 시작' : '']) + '>' + esc(k.title) + '</b></div>' +
      '<div class="tm">' + (k.completedDay === null ? '<button class="who-btn" data-act="assign" data-id="' + k.id + '"' + tip('담당', ['누구에게 맡길지 비교']) + '>' + who + '</button>' : '<span class="who-done">' + who + '</span>') +
      '<span class="chip ' + st[1] + '">' + (waits && f.status !== 'late' ? '대기' : st[0]) + '</span></div></li>';
  }).join('');
  return '<section class="panel tasks2"><div class="phead"><h2 class="ptitle">업무</h2></div><ul>' + rows + '</ul></section>';
}
function man(n) {
  const sign = n < 0 ? '−' : '';
  return sign + Math.abs(Math.round(n / 10000)).toLocaleString('ko-KR') + '만';
}
function loopStrip() {
  if (!loopRun) return '';
  const s = loopRun.state, ended = s.ending;
  const names = { 1: '개인 사무소', 2: '동네 법률사무소', 3: '중견 로펌' };
  const news = (s.headlines && s.headlines[0]) || '수임 · 배정 · 정산';
  return '<div class="strip loop-strip">' +
    stripCell('lweek', '주차', (ended ? s.weeksPlayed : s.week) + '주', ended ? '종료' : '/ 12', tip('12주', [esc(news), ended ? esc(ended.label) : '주 종료로 한 주'])) +
    stripCell('lcash', '현금', man(s.cash), '매출 ' + man(s.revenue), tip('현금', ['시작 1,000만', '주급 사무원 70만 · 보조원 100만', '임대료는 그 주 시작 등급'])) +
    stripCell('lrep', '명성', String(s.reputation), 'T2 15 · T3 35', tip('명성', ['T2는 15', 'T3는 35이고 누적 매출 4,000만', '12주에 45이고 누적 매출 7,000만이면 위대한 로펌'])) +
    stripCell('ltier', '등급', 'T' + s.tier, names[s.tier], tip('등급', ['T1 임대료 80만', 'T2 120만 · 난이도 2', 'T3 200만 · 난이도 3'])) +
    '</div>';
}
function loopButton() {
  if (!loopRun) return '';
  if (loopRun.state.ending) return '<span class="when"><b>' + esc(loopRun.state.ending.label) + '</b><small>12주</small></span>';
  return '<button class="btn" data-act="endWeek"' + tip('주 종료', ['수임과 배정은 자동', '미배정 업무는 남지 않은 칸']) + '>주 종료</button>';
}
function office(v) {
  const firm = v.firm, pending = firm.intake.status === 'pending';
  if (!ui.sel || !v.inbox.some(m => m.id === ui.sel)) ui.sel = (v.inbox.find(m => m.must) || v.inbox[0]).id;
  ui.read.add(ui.sel);
  const right = loopButton() + '<div class="when"><b>' + dayLabel(firm, firm.dayIndex) + '</b><small>' + (firm.dayIndex + 1) + ' / 5일</small></div><button class="btn continue" data-act="advance" data-primary ' + (pending ? 'disabled' + tip('다음 날', ['응답 필요 먼저']) : '') + '>다음 날 <span aria-hidden="true">»</span></button>';
  return frame(v, loopStrip() + officeStrip(v) + '<div class="office2">' + inboxList(v) + '<div class="col">' + readPane(v) + weekGrid(v) + '</div>' + taskPanel(v) + '</div>', right);
}
function reportLine(firm, r) {
  const hours = r.work.reduce((a, w) => a + w.hours, 0);
  return dayLabel(firm, r.day) + ' · ' + hours + '시간 · ' + r.completed.length + '건 완료' + (r.lateTasks.length ? ' · 넘김 ' + r.lateTasks.length + '건' : '') + ' · ' + signed(r.cashAfter - r.cashBefore);
}
function reportModal(v) {
  const firm = v.firm, r = firm.reports[firm.reports.length - 1], name = id => firm.staff.find(s => s.id === id).name, task = id => firm.tasks.find(x => x.id === id).title;
  return '<div class="sheet"><p class="kicker">업무 보고</p><h2>' + dayLabel(firm, r.day) + '</h2><ul class="report">' +
    r.work.map(w => '<li><span>' + esc(name(w.staffId)) + ' · ' + esc(task(w.taskId)) + '</span><b>' + w.hours + '시간</b></li>').join('') + '</ul>' +
    (r.completed.length ? '<p class="good">완료 · ' + r.completed.map(id => esc(task(id))).join(', ') + '</p>' : '') +
    (r.lateTasks.length ? '<p class="bad">넘김 · ' + r.lateTasks.map(id => esc(task(id))).join(', ') + '</p>' : '') +
    '<div class="money"><span>입금 ' + won(r.income) + '</span><span>지출 ' + won(r.expenses) + '</span><b>' + won(r.cashAfter) + '</b></div>' +
    '<div class="actions"><button class="btn primary" data-act="closeModal" data-primary>' + (firm.completed ? '한 주 마감' : '다음 날로') + '</button></div></div>';
}
function assignModal(v, taskId) {
  const firm = v.firm, k = firm.tasks.find(x => x.id === taskId), base = v.forecast;
  const rows = firm.staff.filter(s => k.roles.includes(s.role)).map(s => {
    const cur = s.id === k.assignee, p = cur ? { ok: true, forecast: base, outlook: v.outlook } : game.previewFirm({ type: 'ASSIGN_TASK', taskId, staffId: s.id });
    const f = p.forecast.tasks.find(x => x.taskId === taskId), st = STATUS[f.status], dl = lateCount(p.forecast) - lateCount(base), db = p.outlook.budget - v.outlook.budget;
    return '<button class="cand ' + (cur ? 'current' : '') + '" data-act="doAssign" data-task="' + taskId + '" data-staff="' + s.id + '" ' + (cur ? 'disabled' : '') + tip(s.name, ['하루 ' + s.capacity + '시간 · 시간당 ' + won(s.hourlyCost), '주말 현금 ' + won(p.forecast.projectedCash)]) + '>' + portrait(s.id) + '<span class="who"><b>' + esc(s.name) + '</b>' + (cur ? '<small>지금</small>' : '') + '</span>' +
      '<span class="fx"><small>완료</small><b class="' + st[1] + '">' + dayLabel(firm, f.predictedCompletionDay) + '</b></span>' +
      '<span class="fx"><small>넘김</small><b class="' + (dl > 0 ? 'bad' : dl < 0 ? 'ok' : '') + '">' + lateCount(p.forecast) + (dl ? (dl > 0 ? ' ▲' : ' ▼') : '') + '</b></span>' +
      '<span class="fx"><small>확인</small><b class="' + (db > 0 ? 'ok' : db < 0 ? 'bad' : '') + '">' + p.outlook.budget + (db ? (db > 0 ? ' ▲' : ' ▼') : '') + '</b></span></button>';
  }).join('');
  const pr = [1, 2, 3].map(n => '<button class="seg ' + (k.priority === n ? 'on' : '') + '" data-act="priority" data-task="' + taskId + '" data-n="' + n + '">' + ['먼저', '보통', '나중'][n - 1] + '</button>').join('');
  return '<div class="sheet wide"><p class="kicker">담당</p><h2' + tip(k.title, ['남은 ' + (k.requiredHours - k.doneHours) + '시간 · 기한 ' + esc(dayLabel(firm, k.dueDay)), k.roles.includes('admin') ? '' : '변호사만 할 수 있다']) + '>' + esc(k.title) + '</h2>' +
    '<div class="cands">' + rows + '</div><div class="prio"><span' + tip('순서', ['같은 사람이 여러 일을 맡았을 때 무엇을 먼저 할지']) + '>순서</span><div class="segs">' + pr + '</div></div>' +
    '<div class="actions"><button class="btn" data-act="closeModal">닫기</button></div></div>';
}

// ---------- 한 주 마감 ----------
function weekend(v) {
  const s = v.summary, firm = v.firm, p = v.prep, kept = firm.tasks.filter(k => k.completedDay !== null && k.completedDay <= k.dueDay).length;
  return frame(v, '<section class="weekend"><p class="kicker">6/19 금</p><h1>한 주 마감</h1>' +
    '<div class="tiles"><div' + tip('현금', ['한 주 변화 ' + signed(s.cash - firm.openingCash)]) + '><small>현금</small><b>' + won(s.cash) + '</b></div><div' + tip('기한 안에 끝낸 업무', [s.refundPaid ? '윤지훈 환급 ' + won(s.refundPaid) : firm.intake.status === 'accepted' ? '윤지훈 약속 지킴' : '윤지훈 사건 거절']) + '><small>기한 지킴</small><b>' + kept + ' / ' + firm.tasks.length + '</b></div>' +
    '<div class="tier-' + p.tierId + '"' + tip('정민호 기록 검토', [esc(p.detail)]) + '><small>기록 검토</small><b>' + TIER_WORD[p.tierId] + '</b></div></div>' +
    '<div class="actions"><button class="btn primary" data-act="beginPlan" data-primary>초안 받기</button></div></section>');
}

// ---------- 변론 계획서: 단어 칩, 자세한 건 툴팁 ----------
const img = id => 'assets/art/staff-' + id + '.jpg';
const STAT_FX = {
  analysis: x => (x.value >= 14 ? '확인 항목 +1 · ' : '확인 항목 보너스 없음 (14 이상 +1) · ') + '재반대신문 ' + x.pct + '%',
  examine: x => (x.value >= 15 ? '증인마다 질문 +1 · ' : '') + '반대신문 ' + x.pct + '% (실패하면 한 번 더)',
  court: x => '유도신문 이의 ' + x.pct + '% · 놓치면 당신에게 묻는다',
  negotiate: x => x.value >= 13 ? '초안에 합의 상담을 넣는다' : '합의 상담을 넣지 않는다 (13 이상이면 넣음)'
};
function statRow(stats) { return '<div class="stats">' + stats.map(x => '<div class="stat-i ' + x.tier + '"' + tip(x.label + ' ' + x.value, [esc(STAT_FX[x.id](x))]) + '><small>' + esc(x.label) + '</small><b>' + x.value + '</b></div>').join('') + '</div>'; }
function chip(on, act, id, word, tipHtml, extra) { return '<button class="wchip ' + (on ? 'on' : '') + (extra || '') + '" data-act="' + act + '" data-id="' + id + '" aria-pressed="' + on + '"' + tipHtml + '>' + esc(word) + '</button>'; }
const ODDS = { examine: ['반대신문', '준비한 질문을 꺼낼 확률 · 실패하면 한 번 더'], court: ['이의', '유도신문을 알아챌 확률 · 놓치면 당신에게 묻는다'], analysis: ['재반대', '검사의 수습을 되받아칠 확률'] };
function planBoard(v) {
  const P = v.plan, plan = P.plan, L = P.lawyers.find(l => l.id === plan.lawyerId), edited = f => plan.edited.includes(f) && P.draft[f] !== plan[f];
  const focus = P.focus.find(f => f.id === plan.focus), wname = id => P.witnesses.find(w => w.id === id).name;
  const used = plan.checks.length, full = used >= plan.slots;
  const ctrl = f => !!ui.ctrl[f] || plan.edited.includes(f);
  const fixed = (word, tipHtml, extra) => '<span class="wchip on fixed' + (extra || '') + '"' + tipHtml + '>' + esc(word) + '</span>';
  const pick = (f, list, isOn, act, extraOf) => list.filter(x => ctrl(f) || isOn(x)).map(x => ctrl(f) ? chip(isOn(x), act, x.id, x.word, x.tipHtml, extraOf ? extraOf(x) : '') : fixed(x.word, x.tipHtml, extraOf ? extraOf(x) : '')).join('');
  const stance = pick('stance', P.stances.map(s => ({ ...s, tipHtml: tip(s.word, [esc(s.short)]) })), s => plan.stance === s.id, 'setStance');
  const foci = pick('focus', P.focus.map(f => ({ ...f, tipHtml: tip(f.word, [esc(f.short), Object.entries(f.time).map(([w, n]) => esc(wname(w)) + ' ' + n).join(' · ')]) })), f => plan.focus === f.id, 'setFocus');
  const checks = pick('checks', P.checks.map(c => {
    const drafted = P.draft.checks.includes(c.id), mine = c.on && !drafted, dropped = !c.on && drafted;
    return { ...c, mine, dropped, tipHtml: tip(c.label, [esc(c.line), mine ? '당신이 넣음' : dropped ? '당신이 뺌' : c.on ? L.name + '이(가) 확인함' : full ? '칸이 가득 참' : '넣을 수 있음']) };
  }), c => c.on, 'toggleCheck', c => (c.mine ? ' mine' : '') + (c.dropped ? ' dropped' : '') + (!c.on && full ? ' full' : ''));
  const dots = Array.from({ length: plan.slots }, (_, i) => '<i class="' + (i < used ? 'on' : '') + '"></i>').join('');
  const wits = P.witnesses.map(w => '<li' + tip(w.name + ' · ' + w.role, [esc(w.goal)]) + '><b>' + esc(w.name) + '</b><em>' + focus.time[w.id] + '</em></li>').join('');
  const advice = P.settles ? pick('advice', P.advice.map(a => ({ ...a, tipHtml: tip(a.word, [esc(a.short)]) })), a => plan.advice === a.id, 'advice', a => plan.advice === a.id && edited('advice') ? ' mine' : '') : '<span class="off-note"' + tip('합의 상담 안 함', ['확인 항목에 합의를 넣어야 상담한다 · 칸 하나']) + '>상담 안 함</span>';
  const threats = P.threats.map(x => '<li class="' + (x.ready ? 'ready' : 'open') + '"' + tip(x.ready ? '대비함' : '미확인', ['“' + esc(x.text) + '”', x.ready ? esc(x.answer) : esc(x.counterLabel) + ' 확인 필요']) + '>' + esc(x.word) + '<i>' + (x.ready ? '✓' : '!') + '</i></li>').join('');
  const seg = f => { const on = ctrl(f); return '<span class="ctrl" role="group"><button class="' + (on ? '' : 'on') + '" data-act="delegate" data-f="' + f + '" aria-pressed="' + !on + '"' + tip('맡김', [esc(L.name) + '의 초안대로']) + '>맡김</button><button class="' + (on ? 'on' : '') + '" data-act="control" data-f="' + f + '" aria-pressed="' + on + '"' + tip('조정', ['직접 고친다']) + '>조정</button></span>'; };
  const row = (label, body, tipHtml, f) => '<div class="prow' + (f && ctrl(f) ? ' controlled' : '') + '"><span class="plabel"' + (tipHtml || '') + '>' + label + '</span><div class="pbody">' + body + '</div>' + (f ? seg(f) : '<span></span>') + '</div>';
  const anyCtrl = ['stance', 'focus', 'checks', 'advice'].some(ctrl);
  return frame(v, '<section class="desk plan2"><div class="plan-grid">' +
    '<aside class="lawyer-card"><div class="clip"><img src="' + img(L.id) + '" alt="' + esc(L.name) + '"></div><div class="lname"' + tip(L.name, [L.years + '년차 · ' + esc(L.specialty), esc(L.note), '출정 비용 ' + won(L.fee)]) + '>' + esc(L.name) + '</div>' + statRow(L.stats) +
      '<button class="paper-btn sm" data-act="lawyers">교체</button></aside>' +
    '<article class="sheet-paper plan-card"><header class="ps-head"><span>변론 계획서</span><span>' + esc(L.name) + (plan.edited.length ? ' · <em class="pen">고침</em>' : '') + '</span></header>' +
      row('확률', '<ul class="odds">' + P.odds.map(o => '<li' + tip(ODDS[o.stat][0], [esc(L.name) + ' · ' + o.label + ' ' + o.value + ' → ' + o.pct + '%', ODDS[o.stat][1]]) + '><small>' + ODDS[o.stat][0] + '</small><b>' + o.pct + '%</b></li>').join('') + '</ul>', tip('공판 판정 확률', ['결정적인 순간마다 변호사 능력치로 굴린다', '변호사를 바꾸면 달라진다'])) +
      row('확인 <span class="dots">' + dots + '</span>', checks, tip('확인 항목 ' + used + ' / ' + plan.slots, ['기록 검토 ' + TIER_WORD[P.tierId] + ' → 기본 ' + P.prep.budget, L.stats.find(x => x.id === 'analysis').value >= 14 ? '기록 분석 ' + L.stats.find(x => x.id === 'analysis').value + ' → +1' : '', '조정에서 눌러 넣고 뺀다']), 'checks') +
      '<div class="pmore' + (ui.planMore ? ' open' : '') + '"><button class="pmore-btn" data-act="planMore" aria-expanded="' + !!ui.planMore + '"><span class="pm-l">자세히</span><span class="pm-s">' + esc(P.stances.find(x => x.id === plan.stance).word) + ' · ' + esc(focus.word) + (P.settles ? ' · 합의 ' + esc(P.advice.find(a => a.id === plan.advice).word) : '') + '</span><i aria-hidden="true">' + (ui.planMore ? '▴' : '▾') + '</i></button>' + (ui.planMore ? '' +
        row('방침', stance, tip('방침', ['모두진술에서 밝히는 입장', '공판 중에는 바꿀 수 없다']), 'stance') +
        row('주력', foci, tip('주력 쟁점', ['증인별 질문 수가 바뀐다']), 'focus') +
        row('증인', '<ul class="wits">' + wits + '</ul>', tip('증인 · 질문 수', ['숫자 = 반대신문 질문 수'])) +
        row('합의', advice, tip('합의 · ' + esc(P.offer.from) + ' ' + esc(P.offer.amount), [esc(P.offer.text)]), P.settles ? 'advice' : null) : '') +
      '</div>' +
      '<footer class="pfoot"><button class="pbtn" data-act="undoPlan" ' + (P.canUndo ? '' : 'disabled') + '>↶ 되돌리기</button><span></span>' +
        '<button class="pbtn" data-act="delegateAll" ' + (anyCtrl ? '' : 'disabled') + tip('모두 맡김', [esc(L.name) + '의 초안으로 전부 되돌린다']) + '>모두 맡김</button><button class="pbtn" data-act="controlAll"' + tip('모두 조정', ['모든 줄을 직접 고친다']) + '>모두 조정</button></footer>' +
    '</article>' +
    '<aside class="foe-card"><div class="foe-head"' + tip('윤가람 검사', ['1년차', '예고한 말은 공판에서 그대로 나온다']) + '><span class="mono">윤</span><b>검사 예고</b></div><ul class="threats">' + threats + '</ul>' +
      '<div class="seal-box"><span class="asks"' + tip('개입 최대 ' + P.asks + '번', ['유도신문 ' + P.asks + '번', esc(L.name) + '이(가) 놓칠 때만 당신에게 묻는다 · 이의 ' + P.odds.find(o => o.stat === 'court').pct + '%']) + '>개입 <b>≤' + P.asks + '</b></span><button class="seal" data-act="seal" aria-label="날인하고 공판에 들어간다">날인</button></div></aside>' +
    '</div></section>');
}
function lawyersModal(v) {
  const P = v.plan, cur = P.plan.lawyerId;
  const rows = P.lawyers.map(l => '<button class="lp" data-act="pickLawyer" data-id="' + l.id + '" ' + (l.id === cur ? 'disabled' : '') + tip(l.name, [esc(l.note), l.stats.map(x => esc(x.label) + ' ' + x.value).join(' · ')]) + '><img src="' + img(l.id) + '" alt=""><span class="who"><b>' + esc(l.name) + '</b>' + (l.id === cur ? '<small>지금</small>' : '') + '<span class="lp-stats">' + l.stats.map(x => '<span class="' + x.tier + '">' + x.value + '</span>').join('') + '</span></span>' +
    '<span class="fx"><small>확인</small><b>' + l.slots + '</b></span><span class="fx"><small>개입</small><b>' + l.asks + '</b></span><span class="fx"><small>비용</small><b class="sm">' + won(l.fee) + '</b></span></button>').join('');
  return '<div class="sheet wide"><p class="kicker">담당 교체</p><h2' + tip('담당 교체', ['새 담당이 초안을 처음부터 다시 쓴다', '고친 내용은 사라진다']) + '>누구를 세울까</h2><div class="lp-head"><span></span><span>기록 · 신문 · 법정 · 협상</span><span>확인</span><span>개입</span><span>비용</span></div><div class="lawyer-pick">' + rows + '</div>' +
    '<div class="actions"><button class="btn" data-act="closeModal">닫기</button></div></div>';
}

// ---------- 공판 ----------
function speakerOf(v, id) {
  const tr = v.court.trial, pr = v.caseInfo.presentation, w = tr.definition.witnesses.find(x => x.id === id);
  if (w) return { name: w.name, role: w.role.split(' · ')[0], cls: 'witness' };
  const L = v.plan.lawyers.find(l => l.id === v.plan.plan.lawyerId);
  return ({ JUDGE: { name: '재판장', role: '', cls: 'judge' }, PROSECUTOR: { name: pr.prosecutors[v.caseInfo.prosecutorId].name, role: '검사', cls: 'pros' }, DEFENSE: { name: L.name, role: '변호인', cls: 'def' }, CLIENT: { name: pr.client.name, role: '피고인', cls: 'client' }, VICTIM: { name: pr.victim.name, role: '피해자', cls: 'witness' } })[id] || { name: id, role: '', cls: '' };
}
function credDots(n) { return '<span class="cred-dots" ' + tip('재판장의 신뢰 ' + n + ' / 3', [n >= 3 ? '믿고 지켜보는 중' : n === 2 ? '조금 지켜보는 중' : '낮음 · 다음 반대신문 질문 1번 감소']) + '>' + [1, 2, 3].map(i => '<i class="' + (i <= n ? 'on' : '') + '"></i>').join('') + '</span>'; }
function courtRecords(v) {
  const recs = v.court.trial.displayRecords.filter(r => r.lines && r.lines.length), rolls = v.rolls || [], out = [];
  rolls.filter(x => x.at === 0).forEach(x => out.push({ kind: 'roll', roll: x }));
  recs.forEach((r, i) => { out.push(r); rolls.filter(x => x.at === i + 1).forEach(x => out.push({ kind: 'roll', roll: x })); });
  const from = out.findIndex(r => r.kind === 'trial_open');
  return out.slice(Math.max(0, from));
}
// 판정 도장: 디스코 엘리시움처럼 능력치 · 확률 → 결과 한 줄.
function rollHtml(v, x, fresh) {
  const L = v.plan.lawyers.find(l => l.id === v.plan.plan.lawyerId), isObj = x.key.startsWith('obj:');
  const res = x.ok ? (isObj ? '이의' : '성공') : (isObj ? '놓침' : '실패');
  return '<div class="roll ' + (x.ok ? 'ok' : 'fail') + (fresh ? ' fresh' : '') + '"' + tip(x.label, [esc(L.name) + ' · ' + x.statLabel + ' ' + x.value + ' → ' + x.pct + '%', x.ok ? '' : isObj ? '당신에게 묻는다' : x.key.startsWith('ap2:') ? '이 질문은 꺼내지 못했다' : '다른 질문 뒤에 한 번 더']) + '><span class="rs">' + esc(x.statLabel) + ' ' + x.value + '</span><b>' + x.pct + '%</b><span class="rl">' + esc(x.label) + '</span><em>' + res + '</em></div>';
}
function recordHtml(v, r, fresh) {
  if (r.kind === 'roll') return rollHtml(v, r.roll, fresh);
  const lines = r.lines.map(l => { const s = speakerOf(v, l.speaker); return '<div class="line ' + s.cls + '"><span class="spk"' + (s.role ? tip(s.name, [esc(s.role)]) : '') + '>' + esc(s.name) + '</span><p>' + gloss(l.text) + '</p></div>'; }).join('');
  const marks = (r.memo ? '<span class="note ' + (r.tone || 'neutral') + '"' + tip('재판장 메모', [esc(r.memo)]) + '>메모</span>' : '') + (r.credibility < 0 ? '<span class="note bad">신뢰 ▼</span>' : '') + (r.kind === 'objection' && r.source === 'defense' ? '<span class="note ' + (r.ruling === 'sustained' ? 'defense' : 'bad') + '">' + (r.ruling === 'sustained' ? '인용' : '기각') + '</span>' : '') + (r.missed ? '<span class="note bad"' + tip('놓친 것', [esc(r.missed)]) + '>놓침</span>' : '');
  return '<div class="rec k-' + r.kind + (fresh ? ' fresh' : '') + '">' + lines + (marks ? '<div class="marks">' + marks + '</div>' : '') + '</div>';
}
function askPanel(v) {
  const a = v.ask, L = v.plan.lawyers.find(l => l.id === v.plan.plan.lawyerId), w = v.court.trial.definition.witnesses.find(x => x.id === a.witnessId);
  return '<div class="ask-panel"><img src="' + img(L.id) + '" alt="' + esc(L.name) + '"><div><p class="missed">' + esc(L.name) + ' · 법정 대응 ' + L.stats.find(x => x.id === 'court').value + ' → <b>놓침</b></p><p class="hand">이 질문, 그냥 둘까요?</p><blockquote>“' + esc(a.question[1] || a.question) + '”</blockquote>' +
    '<div class="row"><button class="btn primary" data-act="decide" data-v="1" data-primary' + tip('이의', ['맞는 이의는 불리한 답을 막는다', '빗나간 이의는 재판장의 신뢰를 깎는다']) + '>이의</button><button class="btn" data-act="decide" data-v="0"' + tip('넘어감', [esc(w.name) + ' 씨가 답한다']) + '>넘어감</button>' +
    '<span class="why"' + tip('왜 묻나', [esc(L.name) + ' 법정 대응 ' + L.stats.find(x => x.id === 'court').value, '증인이 직접 보거나 맡은 범위 밖의 결론을 “네” 한마디로 받아 내려는 질문이면 ' + '유도신문이다']) + '>?</span></div></div></div>';
}
function sidePanel(v) {
  const tr = v.court.trial, p = tr.projection, w = tr.witness, P = v.plan, L = P.lawyers.find(l => l.id === P.plan.lawyerId);
  const who = w ? '<section class="card witness-card"' + tip(w.name, [esc(w.role)]) + '>' + portrait(null, 'lg') + '<h3>' + esc(w.name) + '</h3></section>' : '';
  const issues = p.issues.map(i => '<div class="issue band-' + i.band + '"' + tip(i.title, i.notes.slice(-3).map(n => esc(n.text))) + '><b>' + esc(i.title) + '</b><span class="chip band-' + i.band + '">' + esc(v.court.bandLabels[i.band] || i.band) + '</span></div>').join('');
  return who + '<section class="card"><div class="card-head"><h2>판세</h2>' + credDots(p.credibility) + '</div>' + issues + '</section>' +
    '<section class="card plan-pin"' + tip('날인한 계획', [esc(P.stances.find(s => s.id === P.plan.stance).short), '확인 ' + P.plan.checks.length + '개 · 대비한 예고 ' + P.threats.filter(x => x.ready).length + ' / ' + P.threats.length]) + '><small>' + esc(L.name) + '</small><b>' + esc(P.stances.find(s => s.id === P.plan.stance).word) + ' · ' + esc(P.focus.find(f => f.id === P.plan.focus).word) + '</b></section>';
}
function courtScene(v) {
  const recs = courtRecords(v), shown = Math.min(ui.shown, recs.length), done = shown >= recs.length;
  const body = recs.slice(0, shown).map((r, i) => recordHtml(v, r, i >= ui.seenShown)).join('');
  ui.seenShown = shown;
  const finished = v.scene === 'result';
  const bar = !done ? '<div class="waiting"><i></i>' + shown + ' / ' + recs.length + '<button class="link" data-act="skipAhead" style="margin-left:auto">' + (v.ask ? '결정까지' : '끝까지') + ' ▸▸</button></div>'
    : v.ask ? askPanel(v) : finished ? '<div class="ask center"><button class="btn primary big" data-act="toResult" data-primary>선고</button></div>' : '';
  const head = '<div class="court-head"><b>제1회 공판</b><div class="speed" role="group" aria-label="진행 속도"><button class="' + (ui.speed === 'normal' ? 'on' : '') + '" data-act="speed" data-v="normal">▸</button><button class="' + (ui.speed === 'fast' ? 'on' : '') + '" data-act="speed" data-v="fast">▸▸</button></div></div>';
  return frame(v, '<div class="court-grid"><div class="col stage auto">' + head + '<div class="scroll" id="scroll">' + body + '</div><div class="bar-wrap">' + bar + '</div></div><aside class="col side">' + sidePanel(v) + '</aside></div>');
}
let playTimer = null;
function schedulePlay() {
  clearTimeout(playTimer);
  const v = game.view();
  if (!v.court || !(v.scene === 'court' || (v.scene === 'result' && ui.watching)) || ui.showTitle || ui.modal) return;
  if (ui.shown >= courtRecords(v).length) return;
  playTimer = setTimeout(() => { ui.shown += 1; render(); }, ui.speed === 'fast' ? 420 : 1150);
}

// ---------- 판결과 결산 ----------
function result(v) {
  const o = v.court.outcome, s = v.settlement, list = (title, items, cls) => items && items.length ? '<div class="rev ' + cls + '"><h3>' + title + '</h3><ul>' + items.map(x => '<li>' + gloss(x.text) + '</li>').join('') + '</ul></div>' : '';
  const next = v.caseInfo.nextTry.find(n => n.when.outcome === o.key), L = v.plan.lawyers.find(l => l.id === v.plan.plan.lawyerId);
  return frame(v, '<section class="verdict rank-' + s.rank + '"><p class="kicker">선고</p><h1' + tip(o.headline, [esc(o.pronouncement || ''), gloss(o.text)]) + '>' + esc(o.headline) + '</h1>' +
    '<div class="issues">' + o.issues.map(i => '<div class="issue band-' + i.band + '"' + tip(i.title, [esc(i.memo)]) + '><b>' + esc(i.title) + '</b><span class="chip band-' + i.band + '">' + esc(i.bandLabel) + '</span></div>').join('') + '</div>' +
    (next ? '<p class="next-try"' + tip('다음엔', [esc(next.text)]) + '>다음엔 <b>?</b></p>' : '') + '</section>' +
    '<section class="ledger"><div class="tiles">' +
      '<div' + tip('성공보수', ['무죄·공소기각 300만 · 폭행 150만 · 상해 0']) + '><small>성공보수</small><b>' + signed(s.successFee) + '</b></div>' +
      '<div' + tip('출정 비용', [esc(L.name) + ' 하루 8시간']) + '><small>출정</small><b>' + signed(-s.courtFee) + '</b></div>' +
      '<div' + tip('한 주 현금 변화', ['마감 ' + won(s.weekCash)]) + '><small>한 주</small><b>' + signed(s.weekDelta) + '</b></div>' +
      '<div' + tip('최종 현금', ['기한 지킨 업무 ' + s.promisesKept + ' / ' + s.promisesTotal]) + '><small>최종</small><b>' + won(s.finalCash) + '</b></div></div>' +
    '<details class="why-box"><summary>판결 이유</summary><p class="muted">' + gloss(o.reviewText || '') + '</p><div class="rev-grid">' + list('통한 것', o.broke, 'ok') + list('막지 못한 것', o.passed, 'bad') + list('역효과', o.backfired, 'bad') + list('막힌 것', o.blocked, 'bad') + list('놓친 준비', o.missed, 'warn') + '</div></details>' +
    '<div class="actions"><button class="btn" data-act="records">기록</button><button class="btn" data-act="retry">계획서 다시</button><button class="btn primary" data-act="new" data-primary>새 한 주</button></div></section>');
}

// ---------- 그리기 ----------
const SCENES = { title, intro, office, weekend, plan: planBoard, court: courtScene, result };
function modalHtml(v) {
  const m = ui.modal;
  if (m.type === 'report') return reportModal(v);
  if (m.type === 'assign') return assignModal(v, m.id);
  if (m.type === 'lawyers') return lawyersModal(v);
  if (m.type === 'records') return '<div class="sheet wide"><p class="kicker">공판 기록</p><h2>전체</h2><div class="scroll plain">' + courtRecords(v).map(r => recordHtml(v, r, false)).join('') + '</div><div class="actions"><button class="btn primary" data-act="closeModal" data-primary>닫기</button></div></div>';
  return '';
}
function render() {
  hideTip();
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
      if (last.credibility < 0) { toast('신뢰 −1', 'bad'); Audio.play('alert'); }
      else if (last.tone === 'defense') Audio.play('gain');
      if (last.kind === 'cross_start' && last.warned) toast('질문 −1', 'bad');
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

// ---------- 툴팁 런타임: 올리거나(마우스), 포커스하거나(키보드), 누르면(터치) ----------
let tipEl = null, tipFor = null, tipTimer = null;
function hideTip() { clearTimeout(tipTimer); if (tipEl) { tipEl.remove(); tipEl = null; tipFor = null; } }
function showTip(el) {
  if (tipFor === el) return; hideTip();
  tipEl = document.createElement('div'); tipEl.className = 'tip'; tipEl.setAttribute('role', 'tooltip'); tipEl.innerHTML = el.dataset.tip; tipFor = el;
  popRoot.appendChild(tipEl);
  const r = el.getBoundingClientRect(), w = tipEl.offsetWidth, h = tipEl.offsetHeight;
  const left = Math.max(10, Math.min(window.innerWidth - w - 10, r.left + r.width / 2 - w / 2));
  const top = r.top - h - 8 < 8 ? r.bottom + 8 : r.top - h - 8;
  tipEl.style.left = left + 'px'; tipEl.style.top = top + 'px';
}
document.addEventListener('pointerover', e => {
  if (e.pointerType === 'touch') return;
  const el = e.target.closest && e.target.closest('[data-tip]');
  clearTimeout(tipTimer);
  if (el) tipTimer = setTimeout(() => showTip(el), 140); else if (tipEl) tipTimer = setTimeout(hideTip, 80);
});
document.addEventListener('focusin', e => { const el = e.target.closest && e.target.closest('[data-tip]'); if (el && el.matches(':focus-visible')) showTip(el); });
document.addEventListener('focusout', () => hideTip());
document.addEventListener('pointerdown', e => {
  const el = e.target.closest && e.target.closest('[data-tip]');
  if (e.pointerType === 'touch' && el) { showTip(el); clearTimeout(tipTimer); tipTimer = setTimeout(hideTip, 2600); } else if (!el) hideTip();
});
window.addEventListener('scroll', hideTip, true);

// ---------- 입력 ----------
const acts = {
  title() { ui.modal = null; ui.showTitle = true; closePops(); render(); },
  mute() { Audio.toggle(); render(); },
  theme() { const next = document.documentElement.dataset.theme === 'cool' ? 'warm' : 'cool'; document.documentElement.dataset.theme = next; try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* 이번 창에서만 */ } render(); },
  new() { ui = freshUi(); const q = Number(new URLSearchParams(location.search).get('seed')); bootLoop(Number.isInteger(q) && q > 0 ? q : 1); run('newGame', Number.isInteger(q) && q > 0 ? { seed: q } : {}, 'page'); },
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
  advance() { const day = game.view().firm.dayIndex; ui.sel = 'report-' + day; if (!run('firm', { action: { type: 'ADVANCE_DAY' } }, 'day')) ui.sel = null; },
  endWeek() {
    if (!loopRun || loopRun.state.ending) return;
    try { Loop.advanceWeek(loopRun); Audio.play('day'); }
    catch (e) { toast(e.message, 'bad'); }
    render();
  },
  openMsg(d) { ui.sel = d.id; Audio.play('tick'); render(); },
  inboxTab(d) { ui.inboxTab = d.v; render(); },
  report() { ui.modal = { type: 'report' }; render(); },
  records() { ui.modal = { type: 'records' }; render(); },
  assign(d) { ui.modal = { type: 'assign', id: d.id }; render(); },
  doAssign(d) { ui.modal = null; if (run('firm', { action: { type: 'ASSIGN_TASK', taskId: d.task, staffId: d.staff } }, 'tick')) toast('담당 변경'); },
  priority(d) { run('firm', { action: { type: 'SET_PRIORITY', taskId: d.task, priority: Number(d.n) } }, 'tick'); },
  closeModal() { ui.modal = null; Audio.play('tick'); render(); },
  beginPlan() { run('beginPlan', {}, 'page'); },
  lawyers() { ui.modal = { type: 'lawyers' }; render(); },
  pickLawyer(d) { ui.modal = null; ui.ctrl = {}; if (run('editPlan', { field: 'lawyer', value: d.id }, 'page')) toast('담당 변경 · 새 초안'); },
  setStance(d) { if (game.view().plan.plan.stance !== d.id) run('editPlan', { field: 'stance', value: d.id }, 'tick'); },
  setFocus(d) { if (game.view().plan.plan.focus !== d.id) run('editPlan', { field: 'focus', value: d.id }, 'tick'); },
  toggleCheck(d) { run('editPlan', { field: 'check', value: d.id }, 'tick'); },
  advice(d) { if (game.view().plan.plan.advice === d.id) return; run('editPlan', { field: 'advice', value: d.id }, 'tick'); },
  control(d) { ui.ctrl[d.f] = true; Audio.play('tick'); render(); },
  delegate(d) { ui.ctrl[d.f] = false; const p = game.view().plan.plan; if (p.edited.includes(d.f)) run('editPlan', { field: 'reset', value: d.f }, 'page'); else render(); },
  controlAll() { ['stance', 'focus', 'checks', 'advice'].forEach(f => { ui.ctrl[f] = true; }); Audio.play('tick'); render(); },
  delegateAll() { ui.ctrl = {}; if (game.view().plan.plan.edited.length) run('editPlan', { field: 'reset', value: 'all' }, 'page'); else render(); },
  undoPlan() { run('undoPlan', {}, 'tick'); },
  planMore() { ui.planMore = !ui.planMore; render(); },
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
  if (e.key === 'Escape') { if (tipEl) hideTip(); else if (pops.length) closePops(); else if (ui.modal) acts.closeModal(); return; }
  if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('term')) { e.preventDefault(); openPop(e.target); }
});

let loopCases = null, loopRun = null;
function bootLoop(seed) {
  if (!Loop || !loopCases) return;
  loopRun = Loop.createRun({ seed: Number.isInteger(seed) && seed > 0 ? seed : 1, cases: loopCases });
}
if (Loop && typeof fetch === 'function') {
  fetch('data/cases.json').then(function (res) { return res.json(); }).then(function (data) {
    loopCases = data;
    const q = Number(new URLSearchParams(location.search).get('seed'));
    bootLoop(Number.isInteger(q) && q > 0 ? q : 1);
    render();
  }).catch(function () { /* 파일을 직접 열면 루프 막대 없이 기존 사무소만 보인다 */ });
}

render();
})(typeof globalThis !== 'undefined' ? globalThis : this);
