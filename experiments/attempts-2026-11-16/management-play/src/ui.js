(function () {
  'use strict';
  const E = window.FirmEngine;
  const KEY = 'thefirm.management.0.3';
  const VIEW_KEY = KEY + '.view';
  const APPEARANCE_KEY = KEY + '.appearance';
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const sum = (a, f = (v) => v) => a.reduce((n, v) => n + f(v), 0);
  const num = (v) => Number(v).toLocaleString('ko-KR');
  const won = (v) => num(v) + '원';
  const man = (v) => Number((v / 10000).toFixed(1)).toLocaleString('ko-KR') + '만';
  const signed = (v) => (v > 0 ? '+' : v < 0 ? '−' : '') + won(Math.abs(v));
  const find = (a, id) => a.find((v) => v.id === id);
  const left = (t) => t.requiredHours - t.doneHours;
  let state = E.createInitialState({ experiment: 'commitment-v1', refundPercent: 50, openingCash: 18200000 });
  let storageOK = true, restoreNotice = '', toastTimer = 0, returnFocus = null;
  const ui = { mode: 'brief', page: 'home', selectedCase: 'yoon', reportId: null, modal: null, draft: null, q: '', filter: 'all', sort: 'due', sortDirection: 1, theme: 'graphite', font: 'embedded', welcome: true, nextRules: 'commitment', nextChallenge: 'first' };
  const themes = [['graphite', 'Verdict Graphite', '흑연색 운영 화면 · 차분한 청록'], ['paper', 'Paper & Ink', '밝은 종이 · 잉크색 정보'], ['navy', 'Navy & Brass', '깊은 남색 · 황동색 강조']];
  // Candidate names and pairings are retained from the supplied font study.
  // No remote stylesheet is requested until the player asks to load it.
  const fontPresets = [
    { id: 'embedded', name: 'Noto Sans KR · 내장', body: 'Firm Sans', title: 'Firm Sans', number: 'Firm Sans', source: 'embedded' },
    { id: 'F0', name: 'F0 · Pretendard / IBM Plex', body: 'Pretendard|IBM Plex Sans KR', number: 'IBM Plex Mono', source: 'online' },
    { id: 'F1', name: 'F1 · Noto Sans + Serif', body: 'Noto Sans KR', title: 'Noto Serif KR', source: 'online' },
    { id: 'F2', name: 'F2 · IBM Plex Sans + Mono', body: 'IBM Plex Sans KR', number: 'IBM Plex Mono', source: 'online' },
    { id: 'F3', name: 'F3 · Gothic A1 + Hahmlet', body: 'Gothic A1', title: 'Hahmlet', source: 'online' },
    { id: 'F4', name: 'F4 · 나눔고딕 + 나눔명조', body: 'Nanum Gothic', title: 'Nanum Myeongjo', number: 'Nanum Gothic Coding', source: 'online' },
    { id: 'F5', name: 'F5 · 고운돋움 + 고운바탕', body: 'Gowun Dodum', title: 'Gowun Batang', source: 'online' },
    { id: 'F6', name: 'F6 · Noto Sans + JetBrains', body: 'Noto Sans KR', number: 'JetBrains Mono', source: 'online' },
    { id: 'F7', name: 'F7 · IBM Plex + Barlow', body: 'IBM Plex Sans KR', number: 'Barlow Semi Condensed', source: 'online' },
    { id: 'F8', name: 'F8 · Orbit + IBM Plex', body: 'IBM Plex Sans KR', title: 'Orbit', number: 'IBM Plex Mono', source: 'online' },
    { id: 'F9', name: 'F9 · Gothic A1 + Rajdhani', body: 'Gothic A1', number: 'Rajdhani', source: 'online' },
    ...[['pretendard','Pretendard'],['suit','SUIT'],['wanted','Wanted Sans'],['spoqa','Spoqa Han Sans Neo'],['line','LINE Seed Sans KR'],['paperlogy','Paperlogy'],['nexon','NEXON Lv2 Gothic'],['d2coding','D2Coding'],['maruburi','MaruBuri']].map(([id, family]) => ({ id: 'local-' + id, name: family + ' · 설치형', body: family, source: 'local' }))
  ];
  const fontLoaded = new Set();
  let fontChecking = true, onlineFonts = 'idle';
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { const parsed = JSON.parse(raw); const valid = E.validateState(parsed); if (valid.ok) state = parsed; else restoreNotice = '이전 저장을 읽지 못해 새 주간을 열었습니다. 이전 저장 파일은 덮어쓰지 않았습니다.'; }
    const mode = localStorage.getItem(VIEW_KEY); if (['brief', 'dossier', 'operations'].includes(mode)) ui.mode = mode;
    let appearance = null;
    try { appearance = JSON.parse(localStorage.getItem(APPEARANCE_KEY) || 'null'); } catch (_) {}
    if (appearance && themes.some(([id]) => id === appearance.theme)) ui.theme = appearance.theme;
    if (appearance && fontPresets.some((font) => font.id === appearance.font)) ui.font = appearance.font;
  } catch (_) { storageOK = false; restoreNotice = '자동 저장을 사용할 수 없습니다. 저장 메뉴에서 JSON 파일로 진행을 보관할 수 있습니다.'; }
  function fontStack(family) { return family.split('|').map((name) => '"' + name + '"').join(',') + ',"Firm Sans","Malgun Gothic",sans-serif'; }
  function applyAppearance() {
    const root = document.documentElement;
    if (!root) return;
    if (root.dataset) { root.dataset.theme = ui.theme; root.dataset.font = ui.font; }
    const font = fontPresets.find((candidate) => candidate.id === ui.font) || fontPresets[0];
    if (root.style && root.style.setProperty) {
      const body = fontStack(font.body), title = fontStack(font.title || font.body), number = fontStack(font.number || font.body);
      [['--sans',body],['--serif',title],['--mono',number],['--font-body',body],['--font-display',title],['--font-numeric',number]].forEach(([key,value]) => root.style.setProperty(key,value));
    }
  }
  function persistAppearance() { try { localStorage.setItem(APPEARANCE_KEY, JSON.stringify({ theme: ui.theme, font: ui.font })); } catch (_) {} }
  function fontFamilyStatus(family) {
    const loaded = family.split('|').find((name) => fontLoaded.has(name));
    return loaded ? loaded + ' 로드 확인' : fontChecking ? '확인 중 · 내장 글꼴로 대체' : '미로드 · 내장 글꼴로 대체';
  }
  function fontStatus(font) {
    return '본문: ' + fontFamilyStatus(font.body) + ' / 제목: ' + fontFamilyStatus(font.title || font.body) + ' / 숫자: ' + fontFamilyStatus(font.number || font.body);
  }
  function refreshFontStatus() {
    applyAppearance();
    if (ui.modal === 'appearance') renderModal();
  }
  async function inspectFonts() {
    if (!document.fonts || typeof window.FontFace !== 'function') { fontChecking = false; return; }
    const families = [...new Set(fontPresets.flatMap((font) => [font.body, font.title || font.body, font.number || font.body]).flatMap((name) => name.split('|')))];
    await Promise.all(families.map(async (family) => {
      try {
        if (family === 'Firm Sans') { const loaded = await document.fonts.load('500 16px "Firm Sans"', '사건 배정 18,200,000'); if (loaded.length) fontLoaded.add(family); }
        else { const face = new window.FontFace(family, 'local("' + family + '")'); await face.load(); document.fonts.add(face); fontLoaded.add(family); }
      } catch (_) {}
    }));
    fontChecking = false; refreshFontStatus();
  }
  async function loadOnlineFonts() {
    if (!document.fonts || onlineFonts === 'loading' || onlineFonts === 'loaded') return;
    onlineFonts = 'loading'; renderModal();
    const families = [...new Set(fontPresets.filter((font) => font.source === 'online').flatMap((font) => [font.body, font.title || font.body, font.number || font.body]).flatMap((name) => name.split('|')))].filter((name) => name !== 'Pretendard');
    const weights = { 'Noto Sans KR': '400;500;700', 'Noto Serif KR': '600;700', 'IBM Plex Sans KR': '400;500;700', 'IBM Plex Mono': '400;500;600', 'Gothic A1': '400;500;700', Hahmlet: '600;700', 'Nanum Gothic': '400;700', 'Nanum Myeongjo': '700', 'Nanum Gothic Coding': '400;700', 'Gowun Batang': '700', 'JetBrains Mono': '400;500;700', 'Barlow Semi Condensed': '500;600;700', Rajdhani: '500;600;700' };
    const sheet = document.createElement('link'); sheet.rel = 'stylesheet';
    sheet.href = 'https://fonts.googleapis.com/css2?' + families.map((family) => 'family=' + encodeURIComponent(family).replace(/%20/g, '+') + (weights[family] ? ':wght@' + weights[family] : '')).join('&') + '&display=swap';
    const timeout = setTimeout(() => { if (onlineFonts === 'loading') { onlineFonts = 'failed'; sheet.remove(); refreshFontStatus(); } }, 12000);
    sheet.onload = async () => {
      if (onlineFonts !== 'loading') return;
      await Promise.all(families.map(async (family) => { try { const faces = await document.fonts.load((weights[family] || '400').split(';')[0] + ' 16px "' + family + '"', '사건 배정 18,200,000'); if (faces.length) fontLoaded.add(family); } catch (_) {} }));
      clearTimeout(timeout);
      if (onlineFonts !== 'loading') return;
      onlineFonts = 'loaded'; refreshFontStatus();
    };
    sheet.onerror = () => { clearTimeout(timeout); onlineFonts = 'failed'; refreshFontStatus(); };
    document.head.appendChild(sheet);
  }
  const paths = {
    arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>', chevron: '<path d="m9 5 7 7-7 7"/>', close: '<path d="m6 6 12 12M18 6 6 18"/>',
    home: '<path d="m3 10 9-7 9 7M5 9v12h14V9M9 21v-8h6v8"/>', case: '<rect x="3" y="6" width="18" height="15" rx="2"/><path d="M8 6V3h8v3M3 11h18M10 11v3h4v-3"/>',
    people: '<circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3m1-17a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 4v3"/>', money: '<rect x="3" y="5" width="18" height="15" rx="2"/><path d="M3 9h18M15 14h3"/>',
    report: '<path d="M5 3h10l4 4v14H5zM14 3v5h5M8 12h8M8 16h6"/>', settings: '<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8" cy="6" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="10" cy="18" r="2"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.3 9a2.8 2.8 0 1 1 4.1 2.5c-1 .5-1.4 1-1.4 2M12 17h.01"/>', info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>', check: '<path d="m5 12 4 4L19 6"/>', download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>', upload: '<path d="M12 16V4m-5 5 5-5 5 5M4 16v5h16v-5"/>', reset: '<path d="M3 10a9 9 0 1 1 2 8M3 4v6h6"/>', calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18M8 14h2M14 14h2"/>'
  };
  const icon = (name) => '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">' + (paths[name] || paths.arrow) + '</svg>';
  const portrait = (id, cls = '') => '<span class="portrait ' + esc(id) + ' ' + cls + '" aria-hidden="true"></span>';
  const btn = (label, action, cls = '', extra = '') => '<button class="btn ' + cls + '" data-action="' + action + '" ' + extra + '>' + label + '</button>';
  const link = (label, action, extra = '') => '<button class="link-btn" data-action="' + action + '" ' + extra + '>' + label + icon('arrow') + '</button>';
  const pill = (label, cls = '') => '<span class="pill ' + cls + '">' + esc(label) + '</span>';
  const role = (p) => p.id === 'lee' ? '대표 변호사' : p.role === 'admin' ? '사무직원' : '소속 변호사';
  const day = (n, full = false) => { const s = state.dates[Math.min(n, 5)]; const d = new Date(s + 'T00:00:00Z'); return (full ? s.replace(/-/g, '.') : Number(s.slice(5, 7)) + '/' + Number(s.slice(8))) + ' ' + '일월화수목금토'[d.getUTCDay()]; };
  const shortTask = (t) => t.title.split(' · ').slice(1).join(' · ') || t.title;
  const taskState = (t) => t.completedDay !== null ? '완료' : !t.assignee ? '미배정' : t.requires.some((id) => left(find(state.tasks, id)) > 0) ? '선행 업무 대기' : t.doneHours ? '진행 중' : '시작 가능';
  const caseState = (c) => ({ pending: '수임 검토', declined: '수임 거절', active: '준비 진행', ready: '준비 완료' }[c.status]);
  const taskPrediction = (p) => !p ? '—' : p.status === 'completed' ? '완료' : p.predictedCompletionDay === null ? '주간 내 미완료' : day(p.predictedCompletionDay) + (p.onTime ? '' : ' · 지연');
  const caseWork = (id) => { const ts = state.tasks.filter((t) => t.caseId === id); return { tasks: ts, done: sum(ts, (t) => t.doneHours), total: sum(ts, (t) => t.requiredHours), finished: ts.filter((t) => !left(t)).length }; };
  const forecastRisk = (f) => f.tasks.filter((t) => ['late', 'beyond_horizon'].includes(t.status));
  const personLine = (id) => { const p = find(state.staff, id); return p ? '<div class="avatar-line">' + portrait(p.id, 'tiny') + '<div><strong>' + esc(p.name) + '</strong><small>' + role(p) + '</small></div></div>' : '미배정'; };
  const refundPercent = () => state.experiment ? state.experiment.refundPercent : 0;
  const rulesName = () => state.experiment ? '약속 책임 실험 · 환급 ' + refundPercent() + '%' : '원본 규칙 비교 · 환급 없음';
  const refundAmount = () => state.experiment ? Math.floor(state.intake.upfront * refundPercent() / 100) : 0;
  function contractNote() {
    return state.experiment ? day(state.intake.dueDay) + ' 업무 종료까지 준비 보고를 끝내지 못하면 착수금의 ' + refundPercent() + '%(' + won(refundAmount()) + ')를 한 번 환급합니다. 당일 완료하면 환급하지 않습니다.' : '원본 비교 규칙에서는 준비가 늦거나 남아도 착수금을 환급하지 않습니다.';
  }
  function goalCards(f) {
    const actual = E.summarize(state), predicted = f.summary;
    const finished = state.completed;
    const goals = [
      { id: 'deadlines', title: '약속 지키기', value: actual.lateTasks ? '기한 위반 ' + actual.lateTasks + '개' : finished ? '모든 기한 준수' : '지금까지 위반 없음', detail: finished ? '업무별 기한 기준 · 뒤늦은 완료도 기록' : '현재 배정 유지 시 위반 ' + predicted.lateTasks + '개 예상', good: finished && actual.lateTasks === 0, risk: actual.lateTasks > 0 || predicted.lateTasks > 0 },
      { id: 'preparation', title: '준비 마치기', value: actual.readyCases + ' / ' + actual.activeCases + '건 준비 완료', detail: finished ? '사건 종결·승소와 별개의 준비 성과' : '주간 마감에 ' + predicted.readyCases + ' / ' + predicted.activeCases + '건 예상', good: finished && actual.readyCases === actual.activeCases, risk: predicted.readyCases < predicted.activeCases },
      { id: 'liquidity', title: '현금 지키기', value: actual.negativeCashDays ? '현금 부족 ' + actual.negativeCashDays + '일' : finished ? '현금 부족 없이 마감' : '지금까지 현금 유지', detail: finished ? '최저 현금 ' + won(actual.minimumCash) : '주간 최저 ' + won(predicted.minimumCash) + ' 예상', good: finished && actual.minimumCash >= 0, risk: predicted.minimumCash < 0 }
    ];
    return '<div class="play-goals" data-play-goals aria-label="이번 주의 세 가지 목표">' + goals.map((g) => '<div class="play-goal ' + (g.good ? 'achieved' : g.risk ? 'at-risk' : '') + '" data-goal="' + g.id + '"><span class="goal-title">' + (g.good ? '✓ ' : '') + g.title + '</span><strong>' + g.value + '</strong><small>' + g.detail + '</small></div>').join('') + '</div>';
  }
  function playOverview(f) {
    return '<section class="play-overview" aria-label="주간 목표와 실험 조건"><div class="play-mode-line"><span data-rules-mode>' + rulesName() + ' <span class="dim">/ 시작 현금 ' + won(state.openingCash) + '</span></span>' + link('다른 조건으로 시작', 'reset-confirm') + '</div>' + goalCards(f) + (state.intake.status === 'pending' ? '<p class="goal-assumption">예상에는 아직 수임하지 않은 윤지훈 의뢰가 포함되지 않습니다.</p>' : '') + '</section>';
  }
  function bottleneckCards(f) {
    if (state.completed) return '';
    const chosen = [], seen = new Set();
    forecastRisk(f).map((prediction) => find(state.tasks, prediction.taskId)).filter(Boolean).sort((a, b) => a.dueDay - b.dueDay || a.id.localeCompare(b.id)).forEach((risk) => {
      let t = risk;
      while (t.requires.some((id) => left(find(state.tasks, id)) > 0)) t = find(state.tasks, t.requires.find((id) => left(find(state.tasks, id)) > 0));
      if (!seen.has(t.id) && chosen.length < 2) { chosen.push(t); seen.add(t.id); }
    });
    if (!chosen.length) return '';
    return '<section class="decision-focus" data-bottlenecks><div class="section-top"><h2>지금 풀어볼 병목</h2><small>담당을 바꾸면 다른 업무도 달라집니다</small></div><div class="bottleneck-grid">' + chosen.map((t) => {
      const person = find(state.staff, t.assignee), prediction = f.tasks.find((p) => p.taskId === t.id);
      const waiting = state.tasks.filter((next) => next.requires.includes(t.id) && left(next) > 0).length;
      return '<button class="bottleneck-card" data-action="assign" data-id="' + esc(t.id) + '"><span><strong>' + esc(t.title) + '</strong><small>남은 ' + left(t) + 'h · ' + (person ? esc(person.name) + ' 하루 ' + person.capacity + 'h' : '담당 미배정') + (waiting ? ' · 후속 업무 ' + waiting + '개 대기' : '') + '</small><small>현재 배정: ' + taskPrediction(prediction) + '</small></span><span class="bottleneck-cta">담당 조정 ' + icon('arrow') + '</span></button>';
    }).join('') + '</div></section>';
  }
  function impactSummary(before, after) {
    const a = before.summary, b = after.summary;
    const delta = (n) => n > 0 ? '+' + n : String(n);
    return '<div class="decision-impact" data-plan-impact aria-live="polite"><div><span>기한 위반 예상</span><strong data-delta="lateTasks" data-value="' + (b.lateTasks - a.lateTasks) + '">' + delta(b.lateTasks - a.lateTasks) + '개</strong><small>' + a.lateTasks + ' → ' + b.lateTasks + '개</small></div><div><span>준비 완료 예상</span><strong data-delta="readyCases" data-value="' + (b.readyCases - a.readyCases) + '">' + delta(b.readyCases - a.readyCases) + '건</strong><small>' + a.readyCases + ' → ' + b.readyCases + '건</small></div><div><span>현금 + 확정 미수</span><strong data-delta="cashAndReceivables" data-value="' + (b.cashAndReceivables - a.cashAndReceivables) + '">' + signed(b.cashAndReceivables - a.cashAndReceivables) + '</strong><small>환급 ' + won(a.refundPaid) + ' → ' + won(b.refundPaid) + '</small></div></div>';
  }
  function reportConsequences(r) {
    const unlocked = state.tasks.filter((t) => t.requires.length && t.requires.some((id) => r.completed.includes(id)) && t.requires.every((id) => { const prerequisite = find(state.tasks, id); return prerequisite.completedDay !== null && prerequisite.completedDay <= r.day; }));
    const refund = sum(state.ledger.filter((entry) => entry.day === r.day && entry.sourceId === 'contract-refund:yoon'), (entry) => entry.amount);
    if (!unlocked.length && !refund) return '';
    return '<div class="day-consequences" data-day-consequences>' + (unlocked.length ? '<div><strong>선행 업무를 끝내 진행이 가능해졌습니다.</strong><p>' + unlocked.map((t) => esc(t.title)).join(' · ') + '</p><small>같은 날 가용시간이 있었다면 이미 일부 수행했을 수 있습니다.</small></div>' : '') + (refund ? '<div class="refund-result"><strong>준비 약속 미이행 · ' + won(refund) + ' 환급</strong><p>계약 기한에 준비 보고가 끝나지 않아 약정한 금액을 한 번 정산했습니다.</p></div>' : '') + '</div>';
  }
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(E.exportSnapshot(state))); storageOK = true; } catch (_) { storageOK = false; } }
  function toast(message, reportId) { clearTimeout(toastTimer); const el = $('#toast'); el.innerHTML = esc(message) + (reportId ? '<button class="toast-action" data-action="open-report" data-id="' + esc(reportId) + '">보고 열기</button>' : ''); el.classList.add('show'); toastTimer = setTimeout(() => el.classList.remove('show'), reportId ? 8000 : 4500); }
  function dispatch(action) { const r = E.command(state, action); if (!r.ok) { toast(r.error); return false; } state = r.state; persist(); return true; }
  function head(title, sub, note = '') { return '<div class="screen-head"><div><div class="chapter">CHAPTER 01 / THE FIRST WEEK</div><h1>' + title + '</h1><p class="sub">' + sub + '</p></div>' + (note ? '<div class="head-note">' + note + '</div>' : '') + '</div>'; }
  function cashWarning(f) {
    const shortfall = f.warnings.find((warning) => warning.code === 'cash_shortfall');
    if (state.cash >= 0 && !shortfall) return '';
    return '<div class="impact-box" role="status" data-cash-warning><h4>' + (state.cash < 0 ? '현재 현금 부족' : '업무일 중 현금 부족 예상') + '</h4><p>' + (state.cash < 0 ? '현재 현금이 ' + won(state.cash) + '입니다. ' : '') + (shortfall ? esc(shortfall.message) + ' ' : '') + '주간 최종 현금이 양수여도 중간 업무일에는 자금이 부족할 수 있습니다. 이 실험은 부족액을 자동 대출하거나 업무를 중단하지 않습니다.</p></div>';
  }
  function render() {
    applyAppearance();
    const f = E.forecast(state); const active = state.cases.filter((c) => ['active', 'ready'].includes(c.status));
    const navs = [['home', 'home', '업무실'], ['cases', 'case', '사건'], ['people', 'people', '구성원'], ['finance', 'money', '재무'], ['reports', 'report', '보고']];
    const modeNames = [['brief', 'A · 브리핑'], ['dossier', 'B · 서류철'], ['operations', 'C · 편성표']];
    $('#app').innerHTML = '<div class="review-bar"><div class="review-caption"><b>UI STUDY / 0.4</b><span>화면 구조</span></div><div class="review-tabs" role="group" aria-label="업무실 화면 구성">' + modeNames.map(([id, label]) => '<button data-action="mode" data-id="' + id + '" aria-pressed="' + (ui.mode === id) + '" class="' + (ui.mode === id ? 'active' : '') + '">' + label + '</button>').join('') + '</div><div class="review-right"><button data-action="appearance" class="appearance-controls" aria-label="시각 테마와 글꼴 비교">테마 · 글꼴 ' + icon('settings') + '</button><span class="save-state"><span class="save-dot"></span>' + (storageOK ? '자동 저장' : '파일 저장 필요') + '</span><button data-action="rules">실험 규칙</button></div></div>' +
      '<header class="topbar"><button class="brand" data-action="nav" data-id="home" aria-label="THE FIRM 업무실"><span class="brand-symbol">F</span><span><span class="brand-word">THE FIRM</span><span class="brand-sub" style="display:block">LAW & MANAGEMENT</span></span></button><div class="top-caption">작은 사무실, 당신의 첫 결정<span>01 — 서초 사무소</span></div><div class="top-stats"><div class="cash-head"><span class="label">사용 가능 현금</span><strong class="money">₩ ' + num(state.cash) + '</strong></div><div class="top-date">' + day(state.dayIndex, true) + '<small>' + (state.completed ? '업무 주간 마감' : '업무 ' + (state.dayIndex + 1) + ' / 5일 · 진행 대기') + '</small></div>' + btn((state.completed ? '주간 보고' : state.intake.status === 'pending' ? '수임 검토' : '하루 진행') + icon('arrow'), 'advance', 'primary advance') + '</div></header>' +
      '<nav class="nav-bar" aria-label="주 메뉴"><div class="nav-links">' + navs.map(([id, i, label]) => '<button class="nav-item ' + (ui.page === id ? 'active' : '') + '" data-action="nav" data-id="' + id + '"' + (ui.page === id ? ' aria-current="page"' : '') + '>' + icon(i) + label + (id === 'reports' && state.reports.length ? '<span class="count">' + state.reports.length + '</span>' : '') + '</button>').join('') + '</div><div class="nav-tools"><button class="icon-btn" data-action="help" aria-label="진행 방법">' + icon('help') + '</button><button class="icon-btn" data-action="save" aria-label="저장과 새로 시작">' + icon('settings') + '</button></div></nav>' +
      '<main class="screen" id="main">' + cashWarning(f) + ({ home: () => renderHome(f), cases: () => renderCases(f), people: () => renderPeople(f), finance: () => renderFinance(f), reports: () => renderReports(f) }[ui.page] || (() => renderHome(f)))() + '<div class="rule-strip">' + icon('info') + '<span>준비 업무와 사무실 경영을 다루는 5업무일 시나리오 · 금액·시간은 이번 실험의 설정값입니다.</span><button data-action="rules">조건 보기</button></div><footer class="page-footer"><span>THE FIRM / SEOCHO OFFICE</span><span>진행 사건 ' + active.length + '건 · 구성원 4명</span></footer></main>';
    renderModal();
  }
  function renderHome(f) {
    if (ui.mode === 'dossier') return renderDossier(f) + '<details class="office-goals"><summary>이번 주 목표와 계약 조건</summary>' + playOverview(f) + '</details>';
    if (ui.mode === 'operations') return renderOperations(f) + '<details class="office-goals"><summary>이번 주 목표와 계약 조건</summary>' + playOverview(f) + '</details>';
    const risks = forecastRisk(f), pending = state.intake.status === 'pending';
    const totalToday = sum(f.today, (person) => person.scheduledHours), capacity = sum(state.staff, (person) => person.capacity);
    const unpaid = sum(state.invoices.filter((invoice) => invoice.status === 'unpaid'), (invoice) => invoice.amount);
    return head('대표의 업무실', '위험을 읽고, 시간을 맡기고, 다음 하루로.', '<strong>' + day(state.dayIndex) + '</strong>' + (state.completed ? '주간 마감 브리핑' : '업무 ' + (state.dayIndex + 1) + '일차 / 5일')) +
      '<div class="office-status-strip"><div><span>오늘 처리 예정</span><strong>' + totalToday + ' / ' + capacity + '시간</strong></div><div><span>기한 확인</span><strong class="' + (risks.length ? 'danger' : '') + '">' + risks.length + '개 업무</strong></div><div><span>남은 전체 업무</span><strong>' + sum(state.tasks, left) + '시간</strong></div><div><span>확정 미수 · 현금과 별도</span><strong>' + won(unpaid) + '</strong></div></div>' +
      '<div class="brief-grid"><section class="office-command"><div class="section-top"><div><div class="eyebrow">PARTNER’S DESK / DECISIONS</div><h2>오늘 결정할 일</h2></div>' + pill(state.completed ? '주간 마감' : pending ? '의뢰 1건 검토 대기' : risks.length ? '배정 점검 필요' : '진행 준비') + '</div>' +
      (pending ? '<div class="office-priority-row"><span class="priority-marker">01</span><div class="office-priority-copy"><span class="eyebrow">NEW INQUIRY / 윤지훈</span><h3>새 의뢰, 같은 사람들의 시간.</h3><p>추가 16시간 · 준비 보고 ' + day(state.intake.dueDay) + '까지</p><span class="storage-note">착수 240만원 / 완료 후 잔금 120만원 · 미이행 시 ' + (state.experiment ? refundPercent() + '% 환급' : '환급 없음') + '</span></div>' + btn('의뢰 검토 ' + icon('arrow'), 'intake', 'primary') + '</div>' : '') +
      (state.completed ? '<div class="office-priority-row"><div class="office-priority-copy"><h3>첫 업무 주간의 기록이 도착했습니다.</h3><p>준비 완료, 기한 준수, 현금 흐름을 따로 확인하세요.</p></div>' + btn('주간 보고 ' + icon('arrow'), 'week', 'primary') + '</div>' : bottleneckCards(f) || '<div class="office-priority-row"><div class="office-priority-copy"><h3>현재 배정으로 기한을 지킬 전망입니다.</h3><p>오늘 ' + totalToday + '시간을 수행할 예정입니다. 하루를 진행해 실제 기록을 확인하세요.</p></div>' + icon('check') + '</div>') +
      '<div class="office-next"><span>' + (pending ? '수임 여부를 결정하면 하루를 진행할 수 있습니다.' : state.completed ? '현재 기록을 저장하고 다른 선택을 비교할 수 있습니다.' : '현재 배정 유지 시 마감 현금 ' + won(f.projectedCash) + ' 예상') + '</span>' + link(pending ? '현재 인력 비교' : state.completed ? '다른 조건으로 시작' : '편성표 확인', pending ? 'nav' : state.completed ? 'reset-confirm' : 'mode', pending ? 'data-id="people"' : state.completed ? '' : 'data-id="operations"') + '</div></section>' +
      '<aside class="team-panel ops-aside"><div class="section-top"><h2>오늘의 사람과 시간</h2><small>예정 / 하루 가용</small></div><div class="team-list">' + state.staff.map((person) => { const work = f.today.find((row) => row.staffId === person.id); const blocked = state.tasks.filter((task) => task.assignee === person.id && left(task) > 0 && taskState(task) === '선행 업무 대기').length; return '<button class="team-mini" data-action="staff" data-id="' + person.id + '">' + portrait(person.id) + '<span><span class="person">' + esc(person.name) + '</span><span class="role">' + role(person) + (blocked ? ' · 선행 대기 ' + blocked + '개' : '') + '</span></span><span class="workload">' + work.scheduledHours + ' / ' + person.capacity + 'h<small>남은 담당 ' + work.assignedRemainingHours + 'h</small></span></button>'; }).join('') + '</div><div class="advisor">' + portrait('han') + '<p><strong>한도윤 · 사무직원 보고</strong>“맡은 시간과 오늘 할 수 있는 시간은 달라요. 자료 정리 뒤에 검토가 기다리고 있습니다.”</p></div></aside></div>' +
      '<div class="bottom-grid"><section><div class="section-top"><h2>책상 위의 사건</h2>' + link('사건 서류철', 'nav', 'data-id="cases"') + '</div><div class="case-list">' + state.cases.map((matter, index) => renderCaseRow(matter, index, f)).join('') + '</div></section><section>' + renderRecentReport() + '<details class="office-goals"><summary>이번 주 목표와 계약 조건</summary>' + playOverview(f) + '</details></section></div>';
  }
  function renderCaseRow(c, i, f) {
    const w = caseWork(c.id); const risk = f.tasks.some((p) => w.tasks.some((t) => t.id === p.taskId) && ['late', 'beyond_horizon'].includes(p.status));
    return '<div class="case-row"><div class="case-number">0' + (i + 1) + '</div><div><button class="case-title" data-action="case" data-id="' + esc(c.id) + '">' + esc(c.client) + ' <span class="dim">/</span> ' + ({ jung: '기록 검토', go: '조사와 검토', yoon: '신규 의뢰' }[c.id]) + '</button><div class="case-detail">' + (c.status === 'pending' ? '수임 여부를 결정해 주세요' : c.status === 'declined' ? '추가 업무 없음 · 기존 의뢰 집중' : w.finished + ' / ' + w.tasks.length + '개 준비 업무 완료') + '</div></div><div class="case-progress-col"><div class="case-progress-info"><span>' + caseState(c) + '</span><span>' + (w.total ? Math.round(w.done / w.total * 100) + '%' : '—') + '</span></div><div class="case-progress ' + (c.status === 'ready' ? 'complete' : '') + '"><span style="width:' + (w.total ? w.done / w.total * 100 : 0) + '%"></span></div></div><div class="case-deadline ' + (risk ? 'danger' : '') + '">' + day(c.dueDay) + '<small>' + (risk ? '지연 예상' : c.status === 'ready' ? '준비 완료' : '준비 기한') + '</small></div><button class="icon-btn" data-action="case" data-id="' + esc(c.id) + '" aria-label="' + esc(c.client) + ' 사건 열기">' + icon('chevron') + '</button></div>';
  }
  function renderRecentReport() {
    const r = state.reports[state.reports.length - 1];
    return '<div class="recent-report"><div class="spread"><h3 style="font-size:13px">' + (r ? day(r.day) + ' 업무 보고' : '업무 보고함') + '</h3>' + (r ? link('보고 읽기', 'open-report', 'data-id="' + esc(r.id) + '"') : '<span class="section-label">첫 하루가 지나면 도착합니다</span>') + '</div><p>' + (r ? esc(r.summary) + ' · 현금 ' + signed(r.cashAfter - r.cashBefore) : '지금의 배정을 확인한 뒤 하루를 진행하세요. 실제로 수행한 시간과 완성한 준비 업무가 보고서에 남습니다.') + '</p></div>';
  }
  function renderDossier(f) {
    const c = find(state.cases, ui.selectedCase) || state.cases[2], w = caseWork(c.id);
    const pending = c.status === 'pending', declined = c.status === 'declined';
    const invoices = state.invoices.filter((invoice) => invoice.caseId === c.id);
    const paid = sum(invoices.filter((invoice) => invoice.status === 'paid'), (invoice) => invoice.amount);
    const unpaid = sum(invoices.filter((invoice) => invoice.status === 'unpaid'), (invoice) => invoice.amount);
    const source = c.id === 'yoon' ? '의뢰인 윤지훈 / 준비 업무 의뢰' : '사무소 사건 기록 / ' + c.client;
    return head('사건 서류철', '요청과 계약, 실제 준비 기록을 한 문맥에서 확인합니다.', '<strong>MATTER FILES</strong>기존 사건 2건 · 신규 의뢰 1건') +
      '<div class="dossier-layout case-workspace"><aside class="file-list case-workspace-list" aria-label="사건 선택"><div class="file-list-label">ON YOUR DESK / 03 FILES</div>' + [state.cases[2], state.cases[0], state.cases[1]].map((matter) => '<button class="file-tab ' + (matter.id === c.id ? 'active' : '') + '" data-action="file" data-id="' + matter.id + '" aria-pressed="' + (matter.id === c.id) + '"><span class="file-no">FIRM / ' + ({jung:'001',go:'002',yoon:'003'}[matter.id]) + '</span><strong>' + esc(matter.client) + '</strong><small>' + caseState(matter) + '<br>준비 기한 ' + day(matter.dueDay) + '</small></button>').join('') + '<div class="file-side-note">선택한 사건의 요청·계약·준비를 이어서 읽습니다.<br>준비 완료는 사건 종결과 다릅니다.</div></aside>' +
      '<article class="dossier paper case-context-main" data-case-document="' + c.id + '"><div class="dossier-top"><div><div class="eyebrow">CONFIDENTIAL / CLIENT MATTER</div><h2>' + esc(c.client) + (pending ? ' 님의 수임 요청' : ' 사건 준비 기록') + '</h2><p>' + source + ' · ' + day(state.dayIndex, true) + ' 기준</p></div><span class="stamp">' + caseState(c) + '</span></div><div class="dossier-body">' +
      '<section class="document-section"><div class="paper-section-heading">01 / 의뢰와 준비 범위</div><p class="client-letter">' + (pending ? '“이번 주 안에 어디까지 검토할 수 있을까요? 필요한 자료와 확인된 내용을 준비 보고로 받고 싶습니다.”' : declined ? '이번 주에는 신규 의뢰를 받지 않고 기존 사건의 준비에 집중하기로 결정했습니다.' : esc(c.summary)) + '</p></section>' +
      '<section class="document-section"><div class="paper-section-heading">02 / ' + (c.id === 'yoon' ? '계약과 입금' : '준비 상태와 입금') + '</div><div class="paper-metrics"><div class="paper-metric"><span class="label">' + (c.id === 'yoon' ? '계약 수임료' : '실제 수행 / 전체') + '</span><strong>' + (c.id === 'yoon' ? won(state.intake.fee) : w.done + ' / ' + w.total + '시간') + '</strong><small>' + (pending || declined ? '제안 조건 · 아직 계약·청구 없음' : '확정된 기록 기준') + '</small></div><div class="paper-metric"><span class="label">' + (pending ? '수임 시 추가 업무' : '남은 준비 업무') + '</span><strong>' + (pending ? 16 : w.total - w.done) + '시간</strong><small>담당 책임량 · 하루 처리량과 별도</small></div><div class="paper-metric"><span class="label">준비 기한</span><strong>' + day(c.dueDay) + '</strong><small>당일 업무 종료 기준</small></div></div>' +
      (c.id === 'yoon' ? '<div class="document-row"><span>착수금</span><strong>' + won(state.intake.upfront) + '</strong><small>수임 다음 업무일 입금</small></div><div class="document-row"><span>준비 보고 잔금</span><strong>' + won(state.intake.balance) + '</strong><small>실제 완료 후 청구 · 다음 업무일 입금</small></div><div class="contract-terms" data-contract-terms><strong>' + rulesName() + '</strong><p>' + contractNote() + '</p></div>' : '') +
      '<div class="document-finance"><div><span>실제 입금</span><strong>' + won(paid) + '</strong></div><div><span>확정 미수 · 지금 쓸 현금 아님</span><strong>' + won(unpaid) + '</strong></div></div>' + (pending ? '<p class="paper-note">아직 수임 전입니다. 제안된 보수와 16시간은 실제 현금·미수·업무 예측에 포함되지 않습니다.</p>' : declined ? '<p class="paper-note">수임하지 않아 업무와 청구가 추가되지 않았습니다.</p>' : '<p class="paper-note">' + (c.id === 'yoon' && !invoices.some((invoice) => invoice.id === 'invoice-yoon-balance') ? '준비 보고가 끝나지 않아 잔금은 아직 확정 미수가 아닙니다. ' : '') + '입금은 청구 일정에 따라 반영합니다.</p>') + '</section>' +
      '<section class="document-section"><div class="paper-section-heading">03 / 준비 업무 · 담당 · 기한</div>' +
      (pending ? [['자료 취합','4시간','사무직원 / 변호사'],['초기 검토','8시간','변호사 · 자료 취합 후'],['준비 보고','4시간','변호사 · 초기 검토 후']].map(([title,hours,person]) => '<div class="paper-task"><strong>' + title + '</strong><span>' + hours + ' · ' + person + '</span></div>').join('') : w.tasks.length ? w.tasks.map((task) => { const prediction = f.tasks.find((row) => row.taskId === task.id); return '<button class="paper-task case-task-button" data-action="assign" data-id="' + task.id + '"><span><strong>' + esc(shortTask(task)) + '</strong><small>' + esc(find(state.staff, task.assignee)?.name || '미배정') + ' · ' + taskState(task) + '</small></span><span>남은 ' + left(task) + 'h<small>기한 ' + day(task.dueDay) + ' / 예상 ' + taskPrediction(prediction) + '</small></span>' + icon('chevron') + '</button>'; }).join('') : '<p class="paper-note">이번 주에 추가된 준비 업무가 없습니다.</p>') +
      '<p class="paper-note">준비 완료는 사건 종결·승소를 뜻하지 않습니다. 끝난 업무의 결과만 아래 기록에 공개됩니다.</p></section>' +
      (w.tasks.some((task) => task.completedDay !== null) ? '<details class="document-section"><summary>실제 완료된 준비 기록 ' + w.finished + '개</summary>' + w.tasks.filter((task) => task.completedDay !== null).map((task) => '<div class="output"><h4>' + esc(shortTask(task)) + ' · ' + day(task.completedDay) + '</h4><p>' + esc(task.outputText) + '</p></div>').join('') + '</details>' : '') + '</div><div class="dossier-actions"><small>' + (pending ? '수임 전 계약 조건과 선택의 영향을 비교합니다.' : '업무를 누르면 현재 담당과 변경 후 예측을 비교합니다.') + '</small>' + btn((pending ? '수임 조건과 영향 검토' : declined ? '업무실로' : '이 사건 업무 비교') + icon('arrow'), pending ? 'intake' : declined ? 'nav' : 'case-work', 'paper-btn', pending ? '' : 'data-id="' + (declined ? 'home' : c.id) + '"') + '</div></article></div>';
  }
  function renderRiskList(f) {
    const risks = forecastRisk(f);
    if (!risks.length) return '';
    return '<section class="schedule-risks" aria-label="기한 조정이 필요한 업무"><div class="risk-label">먼저 확인할 업무<small>눌러서 담당 조정</small></div><div class="risk-list">' + risks.map((p) => '<button class="risk-item" data-action="assign" data-id="' + esc(p.taskId) + '"><strong>' + esc(p.title) + '</strong><span>기한 ' + day(p.dueDay) + ' → ' + (p.predictedCompletionDay === null ? '주간 내 미완료' : '예상 ' + day(p.predictedCompletionDay)) + '</span>' + icon('chevron') + '</button>').join('') + '</div></section>';
  }
  function renderOperations(f) {
    const totalToday = sum(f.today, (p) => p.scheduledHours); const risks = forecastRisk(f);
    return head('한 주의 편성표', '사람과 시간을 함께 놓고, 배정의 결과를 읽습니다.', '<strong>6.12 — 6.18</strong>5업무일 · 금 / 월 / 화 / 수 / 목') + '<div class="schedule-summary"><div class="schedule-stat"><strong>' + totalToday + '<small style="font-size:13px"> / ' + sum(state.staff, (p) => p.capacity) + 'h</small></strong><span>오늘 처리 예정</span></div><div class="schedule-stat"><strong>' + sum(state.tasks, left) + 'h</strong><span>남은 담당 업무</span></div><div class="schedule-stat"><strong class="' + (risks.length ? 'danger' : '') + '">' + risks.length + '</strong><span>기한 초과 예상 업무</span></div><div class="schedule-stat"><strong>' + man(f.projectedCash) + '원</strong><span>마감 예상 현금</span></div></div>' + renderRiskList(f) + '<div class="schedule-wrap"><table class="schedule"><thead><tr><th>구성원 / 하루 가용</th>' + state.dates.slice(0, 5).map((_, d) => '<th class="' + (d === state.dayIndex ? 'today' : '') + '"><div class="day-label">' + day(d) + (d === state.dayIndex ? '<small>오늘</small>' : '') + '</div></th>').join('') + '</tr></thead><tbody>' + state.staff.map((p) => '<tr><td>' + personLine(p.id) + '<div style="font-size:10px;margin-top:8px" class="dim">하루 ' + p.capacity + 'h · 시간당 ' + man(p.hourlyCost) + '원</div></td>' + state.dates.slice(0, 5).map((_, d) => { const past = d < state.dayIndex; const source = past ? state.reports.find((r) => r.day === d) : f.days.find((r) => r.day === d); const work = (source ? source.work : []).filter((e) => e.staffId === p.id); const used = sum(work, (e) => e.hours); return '<td class="' + (d === state.dayIndex ? 'today' : '') + '">' + work.map((e) => { const t = find(state.tasks, e.taskId); const pred = f.tasks.find((x) => x.taskId === t.id); const risky = !past && ['late', 'beyond_horizon'].includes(pred.status); return '<button class="task-block ' + (past ? 'past' : 'future') + (risky ? ' late' : '') + '" data-action="assign" data-id="' + esc(t.id) + '" aria-label="' + esc(t.title) + ' 담당 조정"><span class="block-top"><span>' + esc(find(state.cases, t.caseId).client) + '</span><span>' + e.hours + 'h</span></span><span class="block-desc">' + esc(shortTask(t)) + (past ? ' · 수행' : ' · 예정') + '</span>' + (risky ? '<span class="block-warning">' + (pred.predictedCompletionDay === null ? '주간 내 미완료' : '기한 +' + (pred.predictedCompletionDay - t.dueDay) + '업무일') + '</span>' : '') + '</button>'; }).join('') + (used < p.capacity ? '<div class="open-slot">' + (past ? '미사용 ' : '예정 없음 ') + (p.capacity - used) + 'h</div>' : '') + '</td>'; }).join('') + '</tr>').join('') + '</tbody></table></div><div class="schedule-foot"><span>‘수행’은 과거 실제 기록 · ‘예정’은 현재 배정의 예측<br>' + (state.intake.status === 'pending' ? '미결정 신규 의뢰는 제외되어 있습니다.' : '업무를 누르면 담당자·우선순위를 조정할 수 있습니다.') + '</span><button class="link-btn" data-action="forecast">예측 조건 ' + icon('info') + '</button></div><div class="schedule-cta paper"><div><div class="eyebrow">' + (state.intake.status === 'pending' ? 'A NEW COMMITMENT' : state.completed ? 'WEEK CLOSED' : 'THE NEXT DECISION') + '</div><h3>' + (state.intake.status === 'pending' ? '윤지훈 님의 의뢰를 맡을 여력이 있을까요?' : state.completed ? '실제 수행한 주간을 돌아봅니다.' : '같은 ' + sum(state.staff, (p) => p.capacity) + '시간도, 누구에게 맡기는지에 따라 달라집니다.') + '</h3><p>' + (state.intake.status === 'pending' ? '추가 16시간 · 준비 기한 6/18 · 계약 수임료 360만원' : '남은 일의 총량과 오늘 처리 가능한 시간은 다릅니다. 선행 업무와 비용을 함께 살펴보세요.') + '</p></div>' + btn((state.intake.status === 'pending' ? '수임 조건 검토' : state.completed ? '주간 보고' : '업무 배정 조정') + icon('arrow'), state.intake.status === 'pending' ? 'intake' : state.completed ? 'week' : 'nav', 'primary', state.intake.status === 'accepted' || state.intake.status === 'declined' ? 'data-id="people"' : '') + '</div>';
  }
  function renderPeople(f) {
    let tasks = state.tasks.filter((task) => (!ui.q || (task.title + (find(state.staff, task.assignee)?.name || '미배정')).includes(ui.q)) && (ui.filter === 'all' || ui.filter === 'open' && left(task) > 0 || ui.filter === 'risk' && f.tasks.some((row) => row.taskId === task.id && ['late','beyond_horizon'].includes(row.status))));
    const value = (task) => ui.sort === 'remaining' ? left(task) : ui.sort === 'owner' ? find(state.staff, task.assignee)?.name || '힣' : ui.sort === 'forecast' ? f.tasks.find((row) => row.taskId === task.id)?.predictedCompletionDay ?? 999 : ui.sort === 'title' ? task.title : task.dueDay;
    tasks.sort((a,b) => { const av = value(a), bv = value(b); return (typeof av === 'string' ? av.localeCompare(bv,'ko') : av - bv) * ui.sortDirection || a.id.localeCompare(b.id); });
    const sortHead = (label,key) => '<th aria-sort="' + (ui.sort === key ? ui.sortDirection === 1 ? 'ascending' : 'descending' : 'none') + '"><button class="work-sort" data-action="sort" data-id="' + key + '">' + label + (ui.sort === key ? ui.sortDirection === 1 ? ' ↑' : ' ↓' : ' ↕') + '</button></th>';
    return head('구성원과 업무 배정', '담당 책임과 오늘의 처리량을 구분해 비교합니다.', '<strong>' + sum(f.today,(person) => person.scheduledHours) + ' / ' + sum(state.staff,(person) => person.capacity) + '시간</strong>오늘 실제로 처리할 예정인 시간') +
      '<div class="people-cards">' + state.staff.map((person) => { const plan = f.today.find((row) => row.staffId === person.id), waiting = state.tasks.filter((task) => task.assignee === person.id && taskState(task) === '선행 업무 대기').length; return '<article class="people-card">' + portrait(person.id) + '<div><h3>' + esc(person.name) + '</h3><div class="role">' + role(person) + ' · ' + man(person.hourlyCost) + '원/h</div><div class="hours">오늘 ' + plan.scheduledHours + ' / ' + person.capacity + 'h<small>남은 담당 ' + plan.assignedRemainingHours + 'h' + (waiting ? ' · 선행 대기 ' + waiting + '개' : '') + '</small></div><div class="capacity-meter" aria-hidden="true"><span style="width:' + plan.scheduledHours / person.capacity * 100 + '%"></span></div></div></article>'; }).join('') + '</div>' +
      '<div class="inline-note capacity-note"><strong>배정은 책임, 수행은 하루 가용시간.</strong> 초과 배정은 허용됩니다. 선행 업무가 끝난 작업부터 우선순위에 따라 처리하고, 남은 작업은 대기합니다.</div>' +
      '<div class="search-line"><label class="sr-only" for="work-search">업무 또는 담당자 검색</label><input id="work-search" placeholder="업무 또는 담당자 검색" value="' + esc(ui.q) + '"><div class="segment-buttons" role="group" aria-label="업무 필터">' + [['all','전체 업무'],['open','남은 업무'],['risk','기한 확인']].map(([id,label]) => '<button data-action="filter" data-id="' + id + '" class="' + (ui.filter === id ? 'active' : '') + '" aria-pressed="' + (ui.filter === id) + '">' + label + '</button>').join('') + '</div></div>' +
      '<div class="work-table-wrap"><table class="work-table"><thead><tr>' + sortHead('준비 업무 / 현재 상태','title') + sortHead('담당','owner') + sortHead('남은 시간','remaining') + sortHead('기한','due') + sortHead('예상 완료','forecast') + '<th>조정</th></tr></thead><tbody>' + tasks.map((task) => { const prediction = f.tasks.find((row) => row.taskId === task.id); return '<tr class="' + (left(task) ? '' : 'done') + '"><td class="work-name">' + esc(task.title) + '<small>' + taskState(task) + ' · 우선순위 ' + ['','높음','보통','낮음'][task.priority] + '</small>' + (task.requires.length ? '<small>선행: ' + task.requires.map((id) => esc(shortTask(find(state.tasks,id)))).join(', ') + '</small>' : '') + '</td><td>' + personLine(task.assignee) + '</td><td class="progress-cell"><strong>' + left(task) + 'h</strong><small>수행 ' + task.doneHours + ' / ' + task.requiredHours + 'h</small></td><td class="deadline">' + day(task.dueDay) + '</td><td class="deadline ' + (prediction.onTime === false || prediction.status === 'beyond_horizon' ? 'danger' : '') + '">' + taskPrediction(prediction) + '</td><td>' + btn(left(task) && !state.completed ? '담당 조정' : '기록 보기','assign','small ghost','data-id="' + task.id + '"') + '</td></tr>'; }).join('') + '</tbody></table>' + (!tasks.length ? '<div class="empty">조건에 맞는 업무가 없습니다.</div>' : '') + '</div>' + '<div class="schedule-foot"><span>예상은 현재 배정 유지 기준입니다. 이미 수행한 시간과 비용은 담당을 바꿔도 보존됩니다.</span>' + link('직원 × 날짜 편성표','mode','data-id="operations"') + '</div>';
  }
  function renderCases(f) {
    return renderDossier(f);
  }
  function renderFinance(f) {
    const unpaid = state.invoices.filter((v) => v.status === 'unpaid'); const income = sum(state.ledger.filter((v) => v.type === 'income'), (v) => v.amount); const expenses = sum(state.ledger.filter((v) => v.type === 'expense'), (v) => v.amount);
    return head('현금과 청구', '돈이 들어오는 약속과, 실제 입금된 돈을 구분합니다.', '<strong>원장 기준</strong>계약 수임료는 즉시 현금이 되지 않습니다') + '<div class="finance-top"><div class="finance-number"><div class="label">지금 사용할 수 있는 현금</div><strong>₩ ' + num(state.cash) + '</strong><small>시작 현금 대비 ' + signed(state.cash - state.openingCash) + '</small></div><div class="finance-number"><div class="label">현재 미수금</div><strong>₩ ' + num(sum(unpaid, (v) => v.amount)) + '</strong><small>청구되었으나 아직 입금되지 않은 금액</small></div><div class="finance-number"><div class="label">업무 주간 마감 예상</div><strong class="gold">₩ ' + num(f.projectedCash) + '</strong><small>남은 예상 지출 ' + won(f.totalPlannedCost) + '</small></div></div><div class="finance-columns"><section><div class="section-top"><h2>실제 입출금</h2><small>입금 ' + won(income) + ' · 지출 ' + won(expenses) + '</small></div>' + (state.ledger.length ? state.ledger.slice().reverse().map((v) => '<div class="ledger-row"><span class="dim">' + day(v.day) + '</span><div>' + esc(v.title) + '</div><strong class="money ' + (v.type === 'income' ? 'good' : '') + '">' + (v.type === 'income' ? '+' : '−') + won(v.amount) + '</strong></div>').join('') : '<div class="empty">아직 반영된 입출금이 없습니다.<p>하루를 진행하면 실제 작업시간에 따른 업무비와 운영비, 도래한 입금이 원장에 기록됩니다.</p></div>') + '</section><aside><div class="section-top"><h2>청구와 입금 일정</h2>' + pill(unpaid.length + '건 미수') + '</div>' + state.invoices.map((v) => '<div class="invoice-row"><div class="spread"><strong>' + esc(v.title) + '</strong>' + pill(v.status === 'paid' ? '입금 완료' : '입금 예정', v.status === 'paid' ? 'green' : 'warm') + '</div><div class="spread" style="margin-top:10px"><span class="muted">' + day(v.status === 'paid' ? v.paidDay : v.dueDay) + '</span><span class="money">' + won(v.amount) + '</span></div></div>').join('') + '<p class="statement-note">운영비는 하루 16만원입니다. 업무비는 실제 수행 시간 × 담당자별 시간당 비용으로 계산합니다. 이 비용은 이번 실험을 위한 값이며 정식 급여 체계는 아닙니다.</p><p class="statement-note">' + (state.intake.status === 'accepted' && !state.invoices.some((v) => v.id === 'invoice-yoon-balance') ? '윤지훈 사건 준비 보고 잔금 120만원은 보고 업무가 실제 완료된 뒤에 청구됩니다. 현재 미수금에는 아직 포함되지 않습니다.' : '주간 마지막 날 생성된 다음 업무일 입금 건은 마감 시점에 미수금으로 남습니다.') + '</p></aside></div>';
  }
  function reportBody(r) {
    return '<article class="report-body"><div class="eyebrow">DAILY OFFICE REPORT</div><h2>' + day(r.day) + ' 업무 마감</h2><p class="report-sub">' + esc(r.summary) + '</p>' + reportConsequences(r) + '<div class="report-stats"><div><strong>' + sum(r.work, (v) => v.hours) + 'h</strong><span>실제 수행 시간</span></div><div><strong>' + r.completed.length + '</strong><span>완료한 준비 업무</span></div><div><strong class="' + (r.cashAfter >= r.cashBefore ? 'good' : '') + '">' + signed(r.cashAfter - r.cashBefore) + '</strong><span>현금 증감</span></div></div><div class="section-top"><h3 style="font-size:13px">수행 기록</h3><small>해당 날짜의 실제 담당자</small></div>' + (r.work.length ? r.work.map((v) => { const t = find(state.tasks, v.taskId), p = find(state.staff, v.staffId); return '<div class="work-entry"><div class="avatar-line">' + portrait(p.id, 'tiny') + '<div><strong>' + esc(t.title) + '</strong><small>' + esc(p.name) + ' · 업무비 ' + won(v.cost) + '</small></div></div><span>' + v.hours + 'h</span></div>'; }).join('') : '<p class="storage-note">이 날 실제 수행된 업무가 없습니다.</p>') + '<div class="divider"></div><div class="section-top"><h3 style="font-size:13px">완료된 준비 범위</h3></div>' + (r.completed.length ? r.completed.map((id) => { const t = find(state.tasks, id); return '<div class="output"><h4>' + icon('check') + ' ' + esc(t.title) + '</h4><p>' + esc(t.outputText) + '</p></div>'; }).join('') : '<p class="storage-note">이 날 완료된 업무가 없습니다. 수행한 시간은 누적되며, 업무가 끝나면 준비 범위가 보고됩니다.</p>') + (r.lateTasks.length ? '<div class="impact-box"><h4>기한을 넘긴 미완료 업무</h4><p>' + r.lateTasks.map((id) => esc(find(state.tasks, id).title)).join('<br>') + '</p></div>' : '') + '<div class="divider"></div><div class="spread storage-note"><span>입금 ' + won(r.income) + ' / 지출 ' + won(r.expenses) + '</span><strong>마감 현금 ' + won(r.cashAfter) + '</strong></div></article>';
  }
  function weekSummary() {
    const s = E.summarize(state);
    const metric = (id, label, value, note) => '<div><span>' + label + '</span><strong data-metric="' + id + '" data-value="' + s[id] + '">' + value + '</strong><small>' + note + '</small></div>';
    return '<section class="week-summary paper" data-week-summary><div class="eyebrow" style="color:#8b784d">THE FIRST WEEK / REVIEW</div><h2>' + (s.remainingHours ? '끝낸 일과, 다음으로 남긴 일.' : '맡은 준비 업무를 모두 마쳤습니다.') + '</h2><p>' + (state.intake.status === 'accepted' ? '새 의뢰를 맡은 한 주였습니다.' : '기존 의뢰에 집중한 한 주였습니다.') + ' ' + rulesName() + '</p><p>' + (s.lateTasks ? s.lateTasks + '개 업무가 원래 기한을 넘겼습니다.' : '모든 준비 업무를 기한 안에 완료했습니다.') + '</p>' + goalCards(E.forecast(state)) + '<div class="review-metrics">' +
      metric('cash', '마감 현금', won(s.cash), '시작 대비 ' + signed(s.cash - state.openingCash)) +
      metric('receivables', '확정 미수', won(s.receivables), '청구되었지만 아직 입금되지 않은 돈') +
      metric('minimumCash', '기간 중 최저 현금', won(s.minimumCash), '시작 시점과 업무일 마감 현금 기준') +
      metric('negativeCashDays', '현금 부족 일수', s.negativeCashDays + '일', '마감 현금이 음수였던 업무일') +
      metric('readyCases', '준비 완료 사건', s.readyCases + ' / ' + s.activeCases + '건', '완료 업무 ' + s.completedTasks + ' / ' + s.totalTasks + '개') +
      metric('lateTasks', '기한 위반 업무', s.lateTasks + '개', '나중에 완료해도 기한 위반은 기록') +
      metric('refundPaid', '실제 환급', won(s.refundPaid), '계약상 준비 약속 미이행 정산') +
      metric('remainingHours', '남은 준비 업무', s.remainingHours + 'h', '사건 종결·승소 여부와 구분') +
      '</div><p class="review-reading">현금과 미수를 합하면 ' + won(s.cashAndReceivables) + '입니다. 미수금은 지금 쓸 수 있는 돈이 아닙니다. 세 목표를 함께 보고, 다음 주에는 어떤 선택을 바꿀지 정해 보세요.</p><div class="hero-actions" style="margin-top:20px;display:flex;gap:12px;flex-wrap:wrap">' + btn('진행 파일 저장 ' + icon('download'), 'export', 'primary') + btn('다른 배정으로 다시 시작', 'reset-confirm', 'paper-btn') + '</div></section>';
  }
  function renderReports() {
    if (!state.reports.length) return head('업무 보고함', '실제로 수행하고 끝낸 업무를 보고합니다.') + '<div class="empty" style="border-top:1px solid var(--line)">' + icon('report') + '<h2 style="font-size:18px;margin-top:15px;color:var(--text)">첫 업무 보고를 기다리고 있습니다.</h2><p>수임 여부와 담당을 정한 뒤 하루를 진행해 보세요. 수행 시간, 완료 범위, 입출금과 기한을 함께 기록합니다.</p><div style="margin-top:22px">' + btn('업무실로', 'nav', 'primary', 'data-id="home"') + '</div></div>';
    const r = find(state.reports, ui.reportId) || state.reports[state.reports.length - 1];
    return head('업무 보고함', '예측과 실제 결과를 대조하고, 다음 배정을 정합니다.') + (state.completed ? weekSummary() + '<div class="gap"></div>' : '') + '<div class="reports-layout"><aside class="report-tabs">' + state.reports.slice().reverse().map((v) => '<button class="report-tab ' + (v.id === r.id ? 'active' : '') + '" data-action="report-tab" data-id="' + esc(v.id) + '"><strong>' + day(v.day) + '</strong><small>' + sum(v.work, (w) => w.hours) + 'h 수행 · ' + v.completed.length + '개 완료</small></button>').join('') + '</aside>' + reportBody(r) + '</div>';
  }

  // Dialogs and event handlers are appended below. All game changes go through FirmEngine.
  function openModal(type, value) {
    returnFocus = document.activeElement;
    ui.modal = type;
    if (type === 'assign') { const t = find(state.tasks, value); ui.draft = { taskId: t.id, staffId: t.assignee, priority: t.priority }; }
    if (type === 'task-detail' || type === 'case') ui.detailId = value;
    if (type === 'reset') { ui.nextRules = state.experiment ? 'commitment' : 'baseline'; ui.nextChallenge = state.openingCash === 600000 ? 'tight' : 'first'; }
    renderModal();
    requestAnimationFrame(() => { const first = $('#modal-root [autofocus]') || $('#modal-root .modal-header button'); if (first) first.focus(); });
  }
  function closeModal() {
    ui.modal = null; ui.draft = null; renderModal();
    const target = returnFocus && returnFocus.isConnected ? returnFocus : $('.advance');
    if (target) target.focus();
  }
  function draftState() {
    const a = E.command(state, { type: 'ASSIGN_TASK', taskId: ui.draft.taskId, staffId: ui.draft.staffId });
    if (!a.ok) return a;
    return E.command(a.state, { type: 'SET_PRIORITY', taskId: ui.draft.taskId, priority: Number(ui.draft.priority) });
  }
  function renderModal() {
    const host = $('#modal-root');
    $('#app').inert = !!ui.modal;
    document.body.style.overflow = ui.modal ? 'hidden' : '';
    if (!ui.modal) { host.innerHTML = ''; return; }
    let title = '', subtitle = '', body = '', footer = '', cls = '';
    const cancel = btn('닫기', 'close', 'ghost');
    if (ui.modal === 'appearance') {
      title = '시각 테마와 글꼴'; subtitle = '화면 구조 A·B·C와 별개의 표시 설정입니다. 진행 기록에는 영향을 주지 않습니다.';
      const selectedFont = fontPresets.find((font) => font.id === ui.font) || fontPresets[0];
      body = '<div class="appearance-panel"><section><h3>시각 테마</h3><div class="theme-options">' + themes.map(([id, name, description]) => '<button class="theme-choice theme-option ' + (ui.theme === id ? 'selected' : '') + '" data-action="theme" data-id="' + id + '" aria-pressed="' + (ui.theme === id) + '"><span class="theme-swatch ' + id + '"></span><strong>' + name + '</strong><small>' + description + '</small></button>').join('') + '</div></section><section class="font-preview"><div class="eyebrow">SELECTED FONT / ' + esc(selectedFont.name) + '</div><h3>정민호 · 변론 계획</h3><p>현재 확보한 자료로 확인 가능한 범위를 정리합니다.<br>담당 변경은 이미 수행한 시간과 기록을 보존합니다.</p><strong class="sample-money">₩18,200,000 · 06.18 · 0 / 12h</strong><p class="font-status" data-font-status data-font-id="' + ui.font + '">' + fontStatus(selectedFont) + '</p><small>본문 400·500 / 제목 700 / 숫자 600을 이 화면과 실제 업무표에서 비교하세요.</small></section><section><div class="section-top"><h3>기존 글꼴 후보</h3><small>내장 1 · 온라인 10 · 설치형 9</small></div><div class="font-options">' + fontPresets.map((font) => '<button class="font-option ' + (ui.font === font.id ? 'selected' : '') + '" data-action="font" data-id="' + font.id + '" aria-pressed="' + (ui.font === font.id) + '"><strong>' + esc(font.name) + '</strong><small>' + (font.source === 'embedded' ? '파일에 포함 · 오프라인 기본' : font.source === 'online' ? '온라인 후보 · 미로드 시 내장 대체' : 'PC 설치형 · 미설치 시 내장 대체') + '</small></button>').join('') + '</div></section><div class="inline-note"><strong>온라인 후보는 자동으로 요청하지 않습니다.</strong> 인터넷에서 후보를 불러오면 Google Fonts에 연결합니다. 연결 실패·오프라인·미설치 글꼴은 내장 Noto Sans KR로 대체되며 위 상태에 표시합니다.</div>' + btn(onlineFonts === 'loading' ? '온라인 후보 확인 중…' : onlineFonts === 'loaded' ? '온라인 후보 요청 완료' : onlineFonts === 'failed' ? '온라인 후보 다시 불러오기' : '온라인 후보 불러오기', 'load-online-fonts', '', onlineFonts === 'loading' || onlineFonts === 'loaded' ? 'disabled' : '') + '</div>';
      footer = '<span class="hint">테마·글꼴은 이 브라우저에 별도로 보관됩니다.</span>' + cancel;
    } else if (ui.modal === 'intake') {
      if (state.intake.status !== 'pending') { ui.modal = 'case'; ui.detailId = 'yoon'; return renderModal(); }
      title = '윤지훈 님의 신규 의뢰'; subtitle = '수임을 결정하기 전에, 약속과 준비 여력을 확인합니다.';
      const current = E.forecast(state); const accept = E.command(state, { type: 'ACCEPT_INTAKE' }); const after = E.forecast(accept.state);
      const risks = forecastRisk(after);
      body = '<div class="intake-grid"><section class="letter-paper"><div class="eyebrow">INQUIRY / 003</div><h3>“이번 주 안에,<br>어디까지 준비될까요?”</h3><p>자료를 전달하고 초기 검토를 의뢰하려고 합니다. 먼저 어떤 자료가 필요한지 정리해 주시고, 확인된 내용과 추가로 확인할 사항을 준비 보고로 받고 싶습니다.</p><p>준비 보고 희망일은 <b>6월 18일 목요일</b>입니다.</p><div class="signature">윤지훈 · 신규 의뢰인</div></section><section><div class="term-row"><span class="label">계약 수임료</span><b>' + won(state.intake.fee) + '<small>판결·승패와 무관한 준비 업무 대가</small></b></div><div class="term-row"><span class="label">착수금</span><b>' + won(state.intake.upfront) + '<small>수임 다음 업무일에 입금 예정</small></b></div><div class="term-row"><span class="label">준비 보고 잔금</span><b>' + won(state.intake.balance) + '<small>준비 보고 실제 완료 다음 업무일</small></b></div><div class="term-row"><span class="label">추가 업무</span><b>총 16시간<small>자료 취합 4h → 초기 검토 8h → 보고 4h</small></b></div><div class="impact-box"><h4>기본 담당 배정으로 맡는다면</h4><p>' + (risks.length ? risks.length + '개 업무가 기한을 넘기거나 주간 안에 완료되지 않을 것으로 예상됩니다. 수임 후 담당자와 우선순위를 조정할 수 있습니다.' : '현재의 담당 배정으로도 준비 기한을 지킬 수 있을 것으로 예상됩니다.') + '</p></div></section></div><div class="gap"></div><table class="comparison"><thead><tr><th>현재 배정이 유지될 때</th><th>기존 의뢰만</th><th>신규 수임 포함</th></tr></thead><tbody><tr><td>남은 준비 업무</td><td>' + sum(state.tasks, left) + 'h</td><td>' + (sum(state.tasks, left) + 16) + 'h</td></tr><tr><td>마감 예상 현금</td><td>' + won(current.projectedCash) + '</td><td>' + won(after.projectedCash) + '</td></tr><tr><td>기한 초과 예상 업무</td><td>' + forecastRisk(current).length + '개</td><td>' + risks.length + '개</td></tr></tbody></table><p class="storage-note" style="margin-top:12px">계약만으로 현금이 늘어나지 않습니다. 위 예측은 작업량과 입금 일정이 유지된다는 조건이며, 담당 배정을 바꾸면 함께 달라집니다.</p>';
      body = '<div class="contract-terms" data-contract-terms><strong>' + rulesName() + '</strong><p>' + contractNote() + '</p><small>현재 기본 배정으로 수임할 때 예상 환급: <b data-metric="projectedRefund" data-value="' + after.projectedRefund + '">' + won(after.projectedRefund) + '</b>. 배정을 바꾸면 예상도 달라집니다.</small></div>' + body + impactSummary(current, after);
      footer = '<span class="hint">지금 수임하지 않으면 추가 업무·입금이 발생하지 않습니다.</span><div class="flex">' + btn('이번 주에는 받지 않기', 'decline-confirm', 'ghost') + btn('수임하고 배정 확인 ' + icon('arrow'), 'accept', 'primary') + '</div>';
    } else if (ui.modal === 'assign') {
      const t = find(state.tasks, ui.draft.taskId); const before = E.forecast(state); const d = draftState(); const after = d.ok ? E.forecast(d.state) : before;
      title = t.title + ' · 담당 조정'; subtitle = '미적용 배정 초안입니다. 기존 수행 시간·비용·기록은 유지됩니다.';
      body = '<div class="spread assignment-context">' + pill(taskState(t), taskState(t) === '선행 업무 대기' ? 'warm' : '') + '<span class="storage-note">남은 ' + left(t) + 'h · 기한 ' + day(t.dueDay) + '</span></div>' +
        (t.requires.length ? '<p class="assignment-prerequisite">선행 조건: ' + t.requires.map((id) => { const task = find(state.tasks,id); return esc(shortTask(task)) + ' (' + (left(task) ? '남은 ' + left(task) + 'h' : '완료') + ')'; }).join(' · ') + '</p>' : '') +
        '<label class="field-label">담당자 비교 · 오늘 처리 예정 / 하루 가용</label><div class="candidate-grid" role="group" aria-label="업무 담당자">' + state.staff.map((person) => {
          const allowed = t.roles.includes(person.role), current = before.today.find((row) => row.staffId === person.id), proposed = after.today.find((row) => row.staffId === person.id);
          const other = state.tasks.filter((task) => task.id !== t.id && task.assignee === person.id && left(task) > 0);
          return '<button class="candidate ' + (person.id === ui.draft.staffId ? 'selected' : '') + '" data-action="choose-person" data-id="' + person.id + '" aria-pressed="' + (person.id === ui.draft.staffId) + '" ' + (allowed ? '' : 'disabled') + '>' + portrait(person.id) + '<strong>' + esc(person.name) + '</strong><span class="candidate-role">' + role(person) + '</span><small>' + (allowed ? current.scheduledHours + ' → ' + proposed.scheduledHours + ' / ' + person.capacity + 'h · ' + man(person.hourlyCost) + '원/h' : '법률 검토 배정 불가 · 변호사만 담당') + '</small><small class="candidate-reason">' + (allowed ? '다른 담당 ' + other.length + '개 · 남은 ' + sum(other,left) + 'h' : '사무직원은 자료 정리·취합만 가능') + '</small></button>';
        }).join('') + '</div><div class="priority-row"><label class="field-label" for="priority-select" style="margin:0">업무 우선순위</label><select id="priority-select">' + [1,2,3].map((priority) => '<option value="' + priority + '" ' + (priority === ui.draft.priority ? 'selected' : '') + '>' + ['','높음','보통','낮음'][priority] + '</option>').join('') + '</select><span class="storage-note">선행 업무가 끝난 작업부터 적용</span></div>' +
        '<div class="section-top"><h3>변경 전후의 예상 일정과 지출</h3><small>현재부터 주간 마감까지</small></div><div class="comparison-wrap"><table class="comparison"><thead><tr><th>남은 준비 업무</th><th>현재 배정</th><th>변경 후 배정</th></tr></thead><tbody>' + state.tasks.filter((task) => left(task)).map((task) => { const current = before.tasks.find((row) => row.taskId === task.id), proposed = after.tasks.find((row) => row.taskId === task.id); return '<tr><td>' + esc(task.title) + '</td><td>' + taskPrediction(current) + '</td><td class="' + (proposed.predictedCompletionDay !== current.predictedCompletionDay ? 'gold' : '') + '">' + taskPrediction(proposed) + '</td></tr>'; }).join('') +
        '<tr class="comparison-money"><td>마감까지 추가 지출</td><td>' + won(before.totalPlannedCost) + '</td><td>' + won(after.totalPlannedCost) + '<small>차이 ' + signed(after.totalPlannedCost - before.totalPlannedCost) + '</small></td></tr><tr><td>마감 예상 현금</td><td>' + won(before.projectedCash) + '</td><td>' + won(after.projectedCash) + '</td></tr><tr><td>마감 예상 확정 미수</td><td>' + won(before.outstandingReceivables) + '</td><td>' + won(after.outstandingReceivables) + '</td></tr></tbody></table></div>' +
        '<details class="assignment-rules"><summary>배정과 수행, 비용을 읽는 방법</summary><p>과다 배정은 허용되며 실제 수행은 하루 가용시간 안에서만 진행합니다. 선행 업무가 당일 끝나면 남은 시간으로 후속 업무를 시작할 수 있습니다. 담당 인계는 무료이고, 이미 수행한 시간과 비용은 유지합니다. 추가 지출에는 남은 운영비·실제 수행 예상 업무비·계약 환급이 반영됩니다. 미수금은 현재 쓸 수 있는 현금이 아닙니다.</p></details>' + (!d.ok ? '<div class="modal-error">' + esc(d.error) + '</div>' : '');
      body = impactSummary(before, after) + body;
      footer = '<span class="hint">예측만 보는 중입니다. 아래 버튼을 눌러야 배정이 바뀝니다.</span><div class="flex">' + btn('취소', 'close', 'ghost') + btn('배정 적용 ' + icon('check'), 'commit-assignment', 'primary', d.ok ? '' : 'disabled') + '</div>';
    } else if (ui.modal === 'task-detail') {
      const t = find(state.tasks, ui.detailId); title = t.title; subtitle = '실제 수행 기록'; cls = 'small-modal';
      body = '<div class="spread">' + pill(taskState(t), left(t) ? '' : 'green') + '<span class="storage-note">' + t.doneHours + ' / ' + t.requiredHours + 'h</span></div><div class="gap"></div>' + (t.completedDay !== null ? '<div class="output"><h4>' + day(t.completedDay) + ' 완료</h4><p>' + esc(t.outputText) + '</p></div>' : '<p class="storage-note">남은 ' + left(t) + '시간을 수행해야 준비 결과가 작성됩니다. 이번 주간은 마감되어 추가 작업을 진행할 수 없습니다.</p>') + state.reports.flatMap((r) => r.work.filter((w) => w.taskId === t.id).map((w) => '<div class="term-row"><span>' + day(r.day) + ' · ' + esc(find(state.staff, w.staffId).name) + '</span><b>' + w.hours + 'h<small>' + won(w.cost) + '</small></b></div>')).join(''); footer = '<span></span>' + cancel;
    } else if (ui.modal === 'case') {
      const c = find(state.cases, ui.detailId); const w = caseWork(c.id); title = c.client + ' 사건'; subtitle = '준비 상태 · ' + caseState(c); cls = 'small-modal';
      body = '<p class="storage-note">' + esc(c.summary) + '</p><div class="term-row"><span>준비 기한</span><b>' + day(c.dueDay) + '</b></div><div class="term-row"><span>수행 / 전체</span><b>' + w.done + ' / ' + w.total + '시간</b></div><div class="case-task-list">' + w.tasks.map((t) => '<div class="paper-task"><span>' + esc(shortTask(t)) + '</span><span>' + taskState(t) + ' · ' + t.doneHours + '/' + t.requiredHours + 'h</span></div>').join('') + '</div>' + w.tasks.filter((t) => t.completedDay !== null).map((t) => '<div class="output"><h4>' + esc(shortTask(t)) + '</h4><p>' + esc(t.outputText) + '</p></div>').join('');
      footer = cancel + btn('준비 업무 살펴보기 ' + icon('arrow'), 'case-work', 'primary', 'data-id="' + esc(c.id) + '"');
    } else if (ui.modal === 'rules' || ui.modal === 'forecast') {
      title = ui.modal === 'forecast' ? '일정과 현금 예측의 조건' : '이번 실험의 규칙'; subtitle = '정식 게임의 확정 규칙과 구분되는 시나리오 설정입니다.';
      body = '<div class="rules-copy"><h3>확인할 플레이</h3><p>기존 사건 2건과 신규 의뢰 1건을 놓고, 수임 → 담당 배정 → 5업무일 진행 → 준비·현금 보고를 연결했습니다. 재판, 판결, 승률, 명성 변화는 계산하지 않습니다.</p><h3>업무와 시간</h3><ul><li>하루 가용시간: 이정우 3h, 김현우 4h, 박서윤 4h, 한도윤 3h.</li><li>한 업무에는 한 명을 배정합니다. 일의 총량이 가용시간을 넘어도 배정할 수 있고, 실제 수행만 하루 한도를 적용합니다.</li><li>선행 업무가 완료된 작업 중 우선순위 높음 → 보통 → 낮음 순서로 실행합니다. 동순위는 고정된 업무 ID 순서이며, 이번 실험에는 자동 최적 배정 기능이 없습니다.</li><li>같은 날 선행 업무가 끝나면, 후속 담당자의 남은 가용시간으로 다음 업무를 시작할 수 있습니다.</li><li>자료 정리·취합은 변호사도 수행할 수 있습니다. 법률 검토·준비 보고는 변호사에게만 배정할 수 있습니다.</li></ul><h3>현금의 이동</h3><table class="rule-table"><tr><th>항목</th><th>실험 설정</th></tr><tr><td>시작 현금</td><td>' + won(state.openingCash) + '</td></tr><tr><td>운영비</td><td>하루 16만원</td></tr><tr><td>시간당 업무비</td><td>이정우 6만 / 김현우 4.5만 / 박서윤 4만 / 한도윤 1.8만원</td></tr><tr><td>기존 미수금</td><td>6/16에 450만원 입금</td></tr><tr><td>신규 착수금</td><td>수임 다음 업무일에 240만원</td></tr><tr><td>준비 보고 잔금</td><td>실제 보고 완료 다음 업무일에 120만원</td></tr></table><p>운영비와 실제 수행 시간에 따른 업무비를 반영하며, 약속 책임 실험에서는 계약상 환급도 반영합니다. 정식 급여·임대차·세금 모델은 아닙니다. 잔금은 판결이나 승패의 대가가 아닙니다. 마지막 업무일 다음 날 지급될 금액은 마감 때 미수금으로 남습니다.</p><h3>예측과 결과의 차이</h3><p>' + esc(E.forecast(state).assumptions) + '</p><p>예측은 실제 실행과 같은 스케줄러를 복사된 상태에 적용합니다. 예측을 보는 동안 실제 시간, 돈, 완료 보고는 바뀌지 않습니다. 신규 의뢰를 수임하기 전에는 예측에서 제외합니다.</p><h3>마감과 다시 비교</h3><p>6/12·15·16·17·18의 5업무일을 처리하면 주간을 마감합니다. 6/19에는 추가 작업·입금을 처리하지 않습니다. 저장 메뉴에서 현재 상태를 파일로 보관한 뒤 새로 시작해 다른 배정을 비교할 수 있습니다.</p></div>'; body = '<div class="contract-terms"><strong>' + rulesName() + '</strong><p>' + contractNote() + '</p><small>환급은 게임 계약 조건입니다. 기존 미수금과 이미 수행한 작업은 취소하지 않습니다. 담당 인계는 무료이며, 현금 부족은 경고와 목표 결과에 남습니다.</small></div>' + body; footer = '<span class="hint">출처와 구현 범위는 소스 패키지의 RULES.md·REPORT.md에 기록했습니다.</span>' + cancel;
    } else if (ui.modal === 'save') {
      title = '저장과 다시 시작'; subtitle = '현재 규칙과 진행 기록을 함께 보관합니다.'; cls = 'small-modal';
      body = '<p class="storage-note">' + (storageOK ? '진행 상황은 이 브라우저에 자동 저장됩니다. 다른 기기에서 이어 보거나 이번 결과를 남기려면 JSON 파일을 내려받으세요.' : '이 브라우저에서는 자동 저장을 사용할 수 없습니다. 창을 닫기 전에 JSON 파일을 내려받으세요.') + '</p><div class="save-actions">' + btn('현재 진행 JSON 내보내기 ' + icon('download'), 'export', 'primary') + btn('저장 JSON 가져오기 ' + icon('upload'), 'import') + btn('처음부터 다시 시작 ' + icon('reset'), 'reset-confirm', 'ghost') + '</div><p class="storage-note" style="margin-top:20px">현재 규칙: <b>' + rulesName() + '</b>. 원본 규칙의 저장은 원본 그대로 이어집니다. 새 실험 JSON의 Godot 호환은 검증하지 않았으므로 이 웹 실행본에서 이어 하세요. Godot 대표 화면은 기존 0.3 기록을 읽는 용도입니다.</p><p class="credits">글꼴: Noto Sans KR · SIL Open Font License<br>인물: 이 실험을 위해 생성한 가상의 인물 초상<br>네트워크 연결 없이 실행할 수 있습니다.</p>'; footer = '<span></span>' + cancel;
    } else if (ui.modal === 'help') {
      title = '첫 업무 주간, 이렇게 진행하세요'; subtitle = '수임과 배정이 결과로 이어지는 짧은 경영 실험'; cls = 'small-modal';
      body = '<div class="rules-copy"><h3>1. 의뢰를 검토합니다.</h3><p>윤지훈 님의 계약 조건과 추가 16시간을 확인하고 수임 여부를 정합니다.</p><h3>2. 시간을 배정합니다.</h3><p>구성원 화면에서 <b>담당 조정</b>을 누르세요. 누구에게 맡기는지, 어떤 업무를 우선하는지 바꾸면 변경 전후의 완료 예정일과 현금이 보입니다.</p><h3>3. 하루를 진행합니다.</h3><p>오른쪽 위 <b>하루 진행</b>을 누르면 가용시간만큼 일하고, 실제 업무비와 도래한 입금을 반영합니다. 작업이 끝나야 준비 결과가 보고됩니다.</p><h3>4. 병목을 풀고 결과를 확인합니다.</h3><p>업무실의 <b>지금 풀어볼 병목</b>을 눌러 인계 전후의 기한·준비·현금 차이를 비교하세요. 인계는 무료이며 이미 수행한 시간은 유지됩니다. 하루가 끝나면 어떤 후속 업무가 열렸는지 보고에서 확인합니다.</p><h3>5. 다른 목표로 재도전합니다.</h3><p><b>약속 지키기 · 준비 마치기 · 현금 지키기</b>를 따로 확인합니다. 다시 시작에서 원본 규칙과 환급 실험, 첫 주와 빠듯한 현금을 골라 같은 선택이 여전히 좋은지 비교해 보세요.</p><h3>화면 구성 비교</h3><p>상단 A·B·C는 같은 상태를 <b>브리핑 / 사건 서류철 / 인력 편성표</b>로 보여줍니다. 구성을 바꿔도 진행 상태는 그대로입니다.</p></div>'; footer = '<span class="hint">처음에는 정민호 자료 정리와 그다음 검토의 연결을 살펴보세요.</span>' + cancel;
    } else if (ui.modal === 'decline') {
      title = '이번 주에는 신규 의뢰를 받지 않을까요?'; subtitle = '기존 사건의 준비에 집중합니다.'; cls = 'small-modal';
      body = '<p class="storage-note">윤지훈 사건의 업무와 수임료가 추가되지 않습니다. 결정 후에는 이번 플레이에서 바꿀 수 없습니다. 새로 시작하면 다시 비교할 수 있습니다.</p>'; footer = btn('검토로 돌아가기', 'intake', 'ghost') + btn('수임하지 않기', 'decline', 'primary');
    } else if (ui.modal === 'reset') {
      title = '이번에는 어떤 주간을 만들까요?'; subtitle = '아래 조건은 새로 시작할 때만 적용됩니다.'; cls = 'small-modal';
      body = '<div class="restart-options"><label class="field-label" for="restart-rules">계약 규칙</label><select id="restart-rules" data-restart-rules><option value="commitment" ' + (ui.nextRules === 'commitment' ? 'selected' : '') + '>약속 책임 실험 · 착수금 50% 환급</option><option value="baseline" ' + (ui.nextRules === 'baseline' ? 'selected' : '') + '>원본 규칙 비교 · 환급 없음</option></select><p class="storage-note">환급 실험에서는 윤지훈 준비 보고를 계약 기한까지 끝내지 못하면 120만원을 한 번 환급합니다. 기본 보수·업무비·처리시간은 같습니다.</p><label class="field-label" for="restart-challenge">현금 조건</label><select id="restart-challenge" data-restart-challenge><option value="first" ' + (ui.nextChallenge === 'first' ? 'selected' : '') + '>첫 주 · 시작 현금 1,820만원</option><option value="tight" ' + (ui.nextChallenge === 'tight' ? 'selected' : '') + '>빠듯한 현금 · 시작 현금 60만원</option></select><p class="storage-note">빠듯한 현금에서는 입금 전의 자금 공백을 확인합니다. 음수여도 진행은 가능하며, 부족한 날짜가 결과에 남습니다.</p></div><p class="storage-note">현재 진행은 새 주간으로 바뀝니다. 비교할 기록은 먼저 JSON으로 저장하세요. 화면 구성 A·B·C는 유지합니다.</p><div class="gap"></div>' + btn('현재 진행 먼저 저장 ' + icon('download'), 'export', 'ghost'); footer = btn('취소', 'close', 'ghost') + btn('선택한 조건으로 시작', 'reset', 'primary');
    }
    host.innerHTML = '<div class="modal-backdrop"><section class="modal ' + cls + '" role="dialog" aria-modal="true" aria-labelledby="dialog-title" aria-describedby="dialog-subtitle"><header class="modal-header"><div><h2 id="dialog-title">' + esc(title) + '</h2><p id="dialog-subtitle">' + esc(subtitle) + '</p></div><button class="icon-btn" data-action="close" aria-label="대화상자 닫기">' + icon('close') + '</button></header><div class="modal-scroll">' + body + '</div><footer class="modal-footer">' + footer + '</footer></section></div>';
  }
  function navigate(page) { ui.modal = null; ui.draft = null; ui.page = page; render(); window.scrollTo({ top: 0, behavior: 'instant' }); }
  function exportFile() {
    const blob = new Blob([JSON.stringify(E.exportSnapshot(state), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = 'THE_FIRM_' + state.dates[state.dayIndex] + '_snapshot.json'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); toast('현재 진행을 JSON 파일로 내보냈습니다.');
  }
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal-backdrop')) { closeModal(); return; }
    const target = event.target.closest('[data-action]'); if (!target || target.disabled) return;
    const action = target.dataset.action, id = target.dataset.id;
    if (action === 'mode') { ui.mode = id; ui.page = 'home'; ui.modal = null; try { localStorage.setItem(VIEW_KEY, id); } catch (_) {} render(); }
    else if (action === 'nav') navigate(id);
    else if (action === 'file') { ui.selectedCase = id; render(); }
    else if (['intake', 'rules', 'help', 'save', 'forecast', 'appearance'].includes(action)) openModal(action);
    else if (action === 'theme' && themes.some(([value]) => value === id)) { ui.theme = id; persistAppearance(); render(); const current = $('#modal-root [data-action="theme"][data-id="' + id + '"]'); if (current) current.focus(); }
    else if (action === 'font' && fontPresets.some((font) => font.id === id)) { ui.font = id; persistAppearance(); render(); const current = $('#modal-root [data-action="font"][data-id="' + id + '"]'); if (current) current.focus(); }
    else if (action === 'load-online-fonts') loadOnlineFonts();
    else if (action === 'close') closeModal();
    else if (action === 'decline-confirm') openModal('decline');
    else if (action === 'reset-confirm') openModal('reset');
    else if (action === 'accept') { if (dispatch({ type: 'ACCEPT_INTAKE' })) { ui.q = ''; ui.filter = 'all'; navigate('people'); toast('수임을 확정했습니다. 착수금은 다음 업무일 입금 예정입니다.'); } }
    else if (action === 'decline') { if (dispatch({ type: 'DECLINE_INTAKE' })) { navigate('home'); toast('신규 의뢰를 받지 않고 기존 준비 업무에 집중합니다.'); } }
    else if (action === 'case') { ui.selectedCase = id; navigate('cases'); }
    else if (action === 'case-work') { ui.q = find(state.cases, id).client; ui.filter = 'all'; navigate('people'); }
    else if (action === 'staff') { ui.q = find(state.staff, id).name; ui.filter = 'all'; navigate('people'); }
    else if (action === 'filter') { ui.filter = id; render(); }
    else if (action === 'sort' && ['title','owner','remaining','due','forecast'].includes(id)) { ui.sortDirection = ui.sort === id ? -ui.sortDirection : 1; ui.sort = id; render(); }
    else if (action === 'assign') { const t = find(state.tasks, id); openModal(left(t) && !state.completed ? 'assign' : 'task-detail', id); }
    else if (action === 'choose-person') { ui.draft.staffId = id; renderModal(); const candidate = $('#modal-root [data-action="choose-person"][data-id="' + id + '"]'); if (candidate) candidate.focus(); }
    else if (action === 'commit-assignment') { const d = draftState(); if (d.ok) { state = d.state; persist(); ui.modal = null; ui.draft = null; render(); toast('담당자와 우선순위를 반영했습니다.'); } else toast(d.error); }
    else if (action === 'advance') {
      if (state.completed) { navigate('reports'); return; }
      if (state.intake.status === 'pending') { openModal('intake'); return; }
      if (dispatch({ type: 'ADVANCE_DAY' })) { const r = state.reports[state.reports.length - 1]; ui.reportId = r.id; if (state.completed) { navigate('reports'); toast('5업무일을 마쳤습니다. 실제 결과를 확인하세요.'); } else { render(); toast(day(r.day) + ' 업무를 마쳤습니다. ' + sum(r.work, (v) => v.hours) + '시간 수행.', r.id); } }
    }
    else if (action === 'open-report') { ui.reportId = id; $('#toast').classList.remove('show'); navigate('reports'); }
    else if (action === 'report-tab') { ui.reportId = id; render(); }
    else if (action === 'week') navigate('reports');
    else if (action === 'export') exportFile();
    else if (action === 'import') { $('#import-file').value = ''; $('#import-file').click(); }
    else if (action === 'reset') { const openingCash = ui.nextChallenge === 'tight' ? 600000 : 18200000; state = ui.nextRules === 'commitment' ? E.createInitialState({ experiment: 'commitment-v1', refundPercent: 50, openingCash }) : E.createInitialState(); if (ui.nextRules === 'baseline') state.cash = state.openingCash = openingCash; ui.reportId = null; ui.q = ''; ui.filter = 'all'; ui.selectedCase = 'yoon'; persist(); navigate('home'); toast('첫 업무일로 돌아왔습니다. 다른 배정을 비교해 보세요.'); }
  });
  document.addEventListener('input', (event) => {
    if (event.target.id === 'work-search') { const pos = event.target.selectionStart; ui.q = event.target.value; render(); const input = $('#work-search'); input.focus(); input.setSelectionRange(pos, pos); }
  });
  document.addEventListener('change', (event) => {
    if (event.target.id === 'priority-select') { ui.draft.priority = Number(event.target.value); renderModal(); $('#priority-select').focus(); }
    else if (event.target.id === 'restart-rules') ui.nextRules = event.target.value;
    else if (event.target.id === 'restart-challenge') ui.nextChallenge = event.target.value;
  });
  $('#import-file').addEventListener('change', async (event) => {
    const file = event.target.files[0]; if (!file) return;
    try {
      if (file.size > 1024 * 1024) throw new Error('저장 파일이 너무 큽니다. 1MB 이하의 진행 JSON을 선택해 주세요.');
      const raw = JSON.parse(await file.text()); const valid = E.validateState(raw); if (!valid.ok) throw new Error(valid.error);
      state = E.exportSnapshot(raw); ui.reportId = null; ui.q = ''; ui.filter = 'all'; persist(); navigate('home'); toast('저장된 진행을 가져왔습니다. ' + day(state.dayIndex) + ' 상태입니다.');
    } catch (error) { toast('가져오지 못했습니다: ' + error.message + ' 현재 진행은 유지됩니다.'); }
  });
  document.addEventListener('keydown', (event) => {
    if (!ui.modal) return;
    if (event.key === 'Escape') { event.preventDefault(); closeModal(); }
    if (event.key === 'Tab') {
      const all = Array.from($('#modal-root').querySelectorAll('button:not([disabled]), select, input, [tabindex="0"]')).filter((el) => el.offsetParent !== null);
      const first = all[0], last = all[all.length - 1];
      if (!all.length) { event.preventDefault(); return; }
      if (event.shiftKey && (document.activeElement === first || !$('#modal-root').contains(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !$('#modal-root').contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    }
  });
  render();
  inspectFonts();
  if (restoreNotice) setTimeout(() => toast(restoreNotice), 350);
})();
