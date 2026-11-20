(function (root, factory) {
  'use strict';
  var isNode = typeof module === 'object' && module.exports;
  var api = factory(isNode ? require('./format.js') : root.FirmFormat);
  if (isNode) module.exports = api;
  if (typeof document !== 'undefined' && document.getElementById('app') && root.FirmLoop) api.mount(document, root.FirmLoop);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (format) {
  'use strict';
  // 12주 위임 화면. 판정은 FirmLoop만 한다. 화면은 조회와 입력만 보낸다.

  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); };

  function tip(head, first, second) {
    var body = '<b>' + esc(head) + '</b><span>' + esc(first) + '</span>';
    if (second) body += '<span>' + esc(second) + '</span>';
    return ' data-tip="' + esc(body) + '" tabindex="0"';
  }

  function endingWord(ending) {
    if (!ending) return '';
    if (ending.kind === 'great') return '위대한 로펌';
    if (ending.kind === 'bankrupt') return '폐업';
    return '보통';
  }

  var DEFAULT_NAME = '한서진';
  var STAT_HELP = { 분석: '기록 검토, 증거 정리', 변론: '법정 주장, 신문', 협상: '합의, 고객 응대', 영업: '의뢰 수, 착수금' };
  var RESULT = { success: '성공', partial: '부분', fail: '실패' };
  var OUTCOME = { win: '승', partial: '조정', lose: '패' };

  function createDesk(options) {
    var Loop = options.loop;
    var cases = options.cases;
    var seed = options.seed;
    var stats = {};
    Loop.STAT_KEYS.forEach(function (key) { stats[key] = 5; });
    var screen = 'setup';
    var partnerName = '';
    var run = null;
    var acceptsDirty = false;
    var assignsDirty = false;
    var acceptSet = new Set();
    var overrides = {};

    function sum() {
      return Loop.STAT_KEYS.reduce(function (total, key) { return total + stats[key]; }, 0);
    }

    function copyStats() {
      var next = {};
      Loop.STAT_KEYS.forEach(function (key) { next[key] = stats[key]; });
      return next;
    }

    function bootWeek() {
      Loop.openWeek(run);
      acceptsDirty = false;
      assignsDirty = false;
      overrides = {};
      acceptSet = new Set(Loop.previewAccepts(run));
      screen = 'office';
    }

    function acceptIds() { return Array.from(acceptSet); }

    function commitAssignments() {
      var recommended = Loop.previewAssignments(run, acceptIds());
      var seen = {};
      var out = [];
      recommended.forEach(function (row) {
        var key = row.caseId + ':' + row.taskIndex;
        seen[key] = true;
        var staffId = Object.prototype.hasOwnProperty.call(overrides, key) ? overrides[key] : row.staffId;
        if (staffId) out.push({ caseId: row.caseId, taskIndex: row.taskIndex, staffId: staffId });
      });
      Object.keys(overrides).forEach(function (key) {
        if (seen[key] || !overrides[key]) return;
        var at = key.lastIndexOf(':');
        out.push({ caseId: key.slice(0, at), taskIndex: Number(key.slice(at + 1)), staffId: overrides[key] });
      });
      return out;
    }

    function handle(act, data, value) {
      data = data || {};
      if (act === 'name' && screen === 'setup' && typeof value === 'string') {
        partnerName = value;
        return true;
      }
      if (act === 'stat') {
        if (screen !== 'setup') return false;
        var key = data.key;
        if (Loop.STAT_KEYS.indexOf(key) < 0) return false;
        var direction = Number(data.dir);
        if (direction !== -1 && direction !== 1) return false;
        var next = stats[key] + direction;
        if (next < 1 || next > 10) return false;
        stats[key] = next;
        return true;
      }
      if (act === 'start') {
        if (screen !== 'setup' || sum() !== 20) return false;
        try { run = Loop.createRun({ seed: seed, cases: cases, stats: copyStats() }); }
        catch (error) { return false; }
        partnerName = partnerName.trim() || DEFAULT_NAME;
        bootWeek();
        return true;
      }
      if (act === 'toggle') {
        if (screen !== 'office' || !data.id) return false;
        if (acceptSet.has(data.id)) acceptSet.delete(data.id);
        else acceptSet.add(data.id);
        acceptsDirty = true;
        return true;
      }
      if (act === 'assign') {
        if (screen !== 'office' || !data.id) return false;
        overrides[data.id] = value || '';
        assignsDirty = true;
        return true;
      }
      if (act === 'endWeek') {
        if (screen !== 'office' || !run || run.state.ending) return false;
        var choices = null;
        if (acceptsDirty || assignsDirty) {
          choices = { acceptIds: acceptIds() };
          if (assignsDirty) choices.assignments = commitAssignments();
        }
        Loop.settleWeek(run, choices);
        screen = run.state.ending ? 'ending' : 'result';
        return true;
      }
      if (act === 'next') {
        if (screen !== 'result' || !run) return false;
        if (run.state.ending) { screen = 'ending'; return true; }
        bootWeek();
        return true;
      }
      if (act === 'again') {
        screen = 'setup';
        run = null;
        partnerName = '';
        Loop.STAT_KEYS.forEach(function (name) { stats[name] = 5; });
        acceptsDirty = false;
        assignsDirty = false;
        overrides = {};
        acceptSet = new Set();
        return true;
      }
      return false;
    }

    function staffById(id) {
      var list = run.state.staff;
      for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
      return null;
    }

    function salary() {
      return run.state.staff.reduce(function (total, staff) { return total + staff.pay; }, 0);
    }

    function taskRows() {
      var ids = acceptIds();
      var recommended = Loop.previewAssignments(run, ids);
      var recMap = {};
      recommended.forEach(function (row) { recMap[row.caseId + ':' + row.taskIndex] = row.staffId; });
      var rows = [];
      function push(caseId, title, difficulty, weeksOpen, duration, task, taskIndex) {
        if (task.result) return;
        var key = caseId + ':' + taskIndex;
        var staffId = Object.prototype.hasOwnProperty.call(overrides, key) ? overrides[key] : (recMap[key] || '');
        rows.push({
          caseId: caseId, title: title, difficulty: difficulty, weeksOpen: weeksOpen,
          duration: duration, task: task, taskIndex: taskIndex, key: key, staffId: staffId
        });
      }
      run.state.matters.forEach(function (matter) {
        if (matter.status !== 'active') return;
        matter.tasks.forEach(function (task, index) {
          push(matter.id, matter.title, matter.difficulty, matter.weeksOpen, matter.durationWeeks, task, index);
        });
      });
      ids.forEach(function (id) {
        var spec = run.catalog[id];
        if (!spec) return;
        spec.tasks.forEach(function (task, index) {
          push(spec.id, spec.title, spec.difficulty, 0, spec.durationWeeks, task, index);
        });
      });
      rows.sort(function (a, b) {
        var left = (a.duration + 2 - a.weeksOpen) - (b.duration + 2 - b.weeksOpen);
        if (left) return left;
        if (a.caseId < b.caseId) return -1;
        if (a.caseId > b.caseId) return 1;
        return a.taskIndex - b.taskIndex;
      });
      return rows;
    }

    function newsTip(headline) {
      var history = run.state.weekLog;
      for (var i = history.length - 1; i >= 0; i--) {
        var week = history[i];
        var verdict = week.verdicts.find(function (row) { return row.headline === headline; });
        if (verdict) return tip(headline, format(week.week, 'week') + ' · 성공보수 ' + format(verdict.successFee, 'money'), '명성 ' + format(verdict.rep, 'delta'));
        if (week.withdrawn.some(function (row) { return row.headline === headline; })) return tip(headline, format(week.week, 'week'));
      }
      return '';
    }

    function face(id) {
      if (id === 'kim' || id === 'park') return '<img class="mini" src="assets/art/staff-' + id + '.jpg" alt="">';
      return '';
    }

    function strip(extra, paidRent) {
      var state = run.state;
      var tierName = (Loop.TIER_NAME[state.tier] || '').replace(/^T\d\s*/, '');
      var cashClass = state.cash < 0 ? ' bad' : '';
      var rent = paidRent == null ? Loop.RENT[state.tier] : paidRent;
      var week = format(extra || state.week, 'week');
      var cash = format(state.cash, 'money');
      var revenue = format(state.revenue, 'money');
      var rentLabel = '임대 ' + format(rent, 'money');
      return '<div class="strip desk-strip">' +
        '<div class="cell"' + tip('시즌 진행', '완료 ' + format(state.weeksPlayed, 'duration') + ' · 전체 ' + format(Loop.WEEKS, 'duration')) + '><small>주차</small><b>' + week + '</b></div>' +
        '<div class="cell' + cashClass + '"' + tip('운영 자금', '잔액 ' + cash, rentLabel + ' · 급여 ' + format(salary(), 'money')) + '><small>현금</small><b>' + cash + '</b></div>' +
        '<div class="cell"' + tip('누적 매출', '현재 ' + revenue, '위대한 로펌 기준 ' + format(Loop.GREAT_REVENUE, 'money')) + '><small>매출</small><b>' + revenue + '</b></div>' +
        '<div class="cell"' + tip('등급별 명성 기준', 'T2 ' + format(15) + ' · T3 ' + format(35), '위대한 로펌 ' + format(Loop.GREAT_REPUTATION)) + '><small>명성</small><b>' + format(state.reputation) + '</b></div>' +
        '<div class="cell"' + tip(Loop.TIER_NAME[state.tier] || '', rentLabel) + '><small>등급</small><b>T' + format(state.tier) + '</b><em>' + esc(tierName) + '</em></div>' +
        '</div>';
    }

    function frame(name, body, action, attrs) {
      return '<header class="top desk-top"><span class="brand">THE FIRM</span><div class="top-right">' +
        (name === 'setup' ? '' : '<span class="partner-signature">' + esc(partnerName) + ' 대표</span>') +
        (action || '') + '<span class="seed"' + tip('플레이 시드', '시드 값 ' + format(seed)) + '>시드 ' + format(seed) + '</span></div></header>' +
        '<main class="scene scene-desk" data-screen="' + name + '" data-seed="' + seed + '"' + (attrs || '') + '>' + body + '</main>';
    }

    function button(act, label, primary, disabled) {
      return '<button type="button" class="btn' + (primary ? ' primary' : '') + '" data-act="' + act + '"' + (disabled ? ' disabled' : '') + '>' + label + '</button>';
    }

    function statButton(key, dir, disabled) {
      return '<button type="button" class="stat-step" data-act="stat" data-key="' + key +
        '" data-dir="' + dir + '" id="step-' + key + '-' + dir + '" aria-label="' + key +
        (dir > 0 ? ' 증가' : ' 감소') + '"' + (disabled ? ' disabled' : '') + '>' + (dir > 0 ? '+' : '−') + '</button>';
    }

    function setupHtml() {
      var remaining = 20 - sum();
      var rows = Loop.STAT_KEYS.map(function (key) {
        var value = stats[key];
        var bar = '<i class="filled"></i>'.repeat(value) + '<i></i>'.repeat(10 - value);
        return '<div class="stat-row"><div class="stat-reading" role="meter" tabindex="0" aria-label="' + key +
          '" aria-valuemin="1" aria-valuemax="10" aria-valuenow="' + value + '" aria-describedby="help-' + key + '">' +
          '<span class="stat-name">' + key + '</span><span class="stat-bar" aria-hidden="true">' + bar + '</span>' +
          '<span class="stat-value">' + format(value) + '</span><span class="stat-help" role="tooltip" id="help-' + key + '">' +
          STAT_HELP[key] + '</span></div>' + statButton(key, -1, value <= 1) + statButton(key, 1, value >= 10) + '</div>';
      }).join('');
      return frame('setup', '<section class="registration" aria-labelledby="registration-title">' +
        '<h1 id="registration-title">대표 등록</h1><label class="partner-field">대표 이름' +
        '<input id="partner-name" type="text" placeholder="' + DEFAULT_NAME + '" value="' + esc(partnerName) + '"></label>' +
        '<div class="stat-list">' + rows + '</div><div class="registration-footer"><span class="points' +
        (remaining < 0 ? ' over' : '') + '">남은 점수 <b>' + format(remaining) + '/' + format(20) + '</b></span>' +
        button('start', '개업', true, remaining !== 0) + '</div></section>');
    }

    function offerRows() {
      return run.state.offers.map(function (offer) {
        var on = acceptSet.has(offer.id);
        var tasks = (offer.tasks || []).map(function (task) { return task.name; });
        var difficulty = format(offer.difficulty);
        var duration = format(offer.durationWeeks, 'duration');
        var retainer = format(offer.pay, 'money');
        var successFee = format(offer.success, 'money');
        return '<tr class="' + (on ? 'on' : '') + '"><td class="chk"><label><input type="checkbox" data-act="toggle" data-id="' + esc(offer.id) + '"' + (on ? ' checked' : '') + '></label></td>' +
          '<td>' + esc(offer.client) + '</td>' +
          '<td class="name"' + tip(offer.title, '난이도 ' + difficulty + ' · 예상 기간 ' + duration, '업무 ' + format(tasks.length) + '건 · ' + tasks.join(' / ')) + '>' + esc(offer.title) + '</td>' +
          '<td class="num">' + difficulty + '</td>' +
          '<td class="num">' + duration + '</td>' +
          '<td>' + esc(offer.keyStat) + '</td>' +
          '<td class="num"' + tip('착수금', '수임 시 ' + retainer) + '>' + retainer + '</td>' +
          '<td class="num"' + tip('성공보수', '승소 시 ' + successFee) + '>' + successFee + '</td></tr>';
      }).join('');
    }

    function assignRows(rows) {
      return rows.map(function (row) {
        var staff = row.staffId ? staffById(row.staffId) : null;
        var rate = staff ? Loop.previewRate(run, row.caseId, row.taskIndex, staff.id) : null;
        var options = '<option value="">—</option>' + run.state.staff.map(function (person) {
          return '<option value="' + esc(person.id) + '"' + (person.id === row.staffId ? ' selected' : '') + '>' + esc(person.name) + '</option>';
        }).join('');
        var chance = rate ? format(rate.p, 'percent') : '';
        var rateTip = rate ? tip(row.task.name + ' · ' + staff.name,
          '성공 ' + chance + ' · 부분 성공 ' + format(rate.partial, 'percent') + ' · 실패 ' + format(rate.fail, 'percent'),
          row.task.staffStat + ' ' + format(staff.stats[row.task.staffStat]) + ' · 피로 ' + format(staff.fatigue) + ' · ' + (staff.role === row.task.role ? '역할 일치' : '역할 불일치')) : '';
        var timeLeft = format(row.duration + 2 - row.weeksOpen, 'duration');
        return '<tr><td class="name"' + tip(row.title + ' · ' + row.task.name, '난이도 ' + format(row.difficulty) + ' · 철회까지 ' + timeLeft) + '>' + esc(row.title) + '</td>' +
          '<td>' + esc(row.task.name) + '</td><td>' + esc(row.task.role) + '</td><td>' + esc(row.task.staffStat) + '</td>' +
          '<td><select data-act="assign" data-id="' + esc(row.key) + '" aria-label="' + esc(row.task.name) + '">' + options + '</select></td>' +
          '<td class="num"' + rateTip + '>' + chance + '</td></tr>';
      }).join('');
    }

    function matterRows() {
      return run.state.matters.filter(function (matter) { return matter.status === 'active'; }).map(function (matter) {
        var open = matter.tasks.filter(function (task) { return !task.result; }).length;
        return '<tr><td class="name"' + tip(matter.title, '주력 ' + matter.keyStat + ' · 난이도 ' + format(matter.difficulty), '철회 기준 ' + format(matter.durationWeeks + 2, 'duration') + ' 경과') + '>' + esc(matter.title) + '</td>' +
          '<td class="num">' + format(matter.weeksOpen, 'duration') + ' / ' + format(matter.durationWeeks, 'duration') + '</td>' +
          '<td class="num">' + format(matter.prep) + '</td><td class="num">' + format(open) + '</td></tr>';
      }).join('');
    }

    function staffRows(rows) {
      var load = {};
      rows.forEach(function (row) { if (row.staffId) load[row.staffId] = (load[row.staffId] || 0) + 1; });
      return run.state.staff.map(function (staff) {
        var used = load[staff.id] || 0;
        var over = used > staff.slots;
        var statsHtml = ['정확', '속도', '응대'].map(function (key) {
          var xp = staff.stats[key] >= 10 ? '' : '다음 능력치까지 경험치 ' + format(staff.xp[key]) + ' / ' + format(6);
          var value = format(staff.stats[key]);
          return '<td class="num"' + tip(key + ' 능력치', '현재 ' + value, xp) + '>' + value + '</td>';
        }).join('');
        var fatigue = format(staff.fatigue);
        var slots = format(used) + ' / ' + format(staff.slots);
        var pay = format(staff.pay, 'money');
        return '<tr><td>' + face(staff.id) + esc(staff.name) + '</td><td>' + esc(staff.role) + '</td>' + statsHtml +
          '<td class="num' + (staff.fatigue >= 80 ? ' bad' : '') + '"' + tip('직원 피로', '현재 ' + fatigue) + '>' + fatigue + '</td>' +
          '<td class="num' + (over ? ' bad' : '') + '"' + tip('업무 배정', '배정 ' + format(used) + '건 · 정원 ' + format(staff.slots) + '건') + '>' + slots + '</td>' +
          '<td class="num"' + tip('직원 급여', '주당 ' + pay) + '>' + pay + '</td></tr>';
      }).join('');
    }

    function newsRows() {
      return (run.state.headlines || []).map(function (headline) {
        return '<tr><td' + newsTip(headline) + '>' + esc(headline) + '</td></tr>';
      }).join('');
    }

    function officeHtml() {
      var rows = taskRows();
      var offers = offerRows();
      var matters = matterRows();
      var news = newsRows();
      return frame('office', strip() +
        '<table class="fm"><caption>수임</caption><thead><tr><th></th><th>의뢰인</th><th>사건</th><th>난이도</th><th>기간</th><th>능력</th><th>착수</th><th>성공</th></tr></thead><tbody>' +
        (offers || '<tr><td colspan="8"></td></tr>') + '</tbody></table>' +
        '<table class="fm"><caption>배정</caption><thead><tr><th>사건</th><th>업무</th><th>역할</th><th>능력</th><th>직원</th><th>확률</th></tr></thead><tbody>' +
        (assignRows(rows) || '<tr><td colspan="6"></td></tr>') + '</tbody></table>' +
        '<div class="desk-split"><table class="fm"><caption>진행</caption><thead><tr><th>사건</th><th>경과</th><th>준비</th><th>남음</th></tr></thead><tbody>' +
        (matters || '<tr><td colspan="4"></td></tr>') + '</tbody></table>' +
        '<table class="fm"><caption>직원</caption><thead><tr><th>이름</th><th>직</th><th>정확</th><th>속도</th><th>응대</th><th>피로</th><th>칸</th><th>주급</th></tr></thead><tbody>' +
        staffRows(rows) + '</tbody></table></div>' +
        (news ? '<table class="fm"><caption>소식</caption><tbody>' + news + '</tbody></table>' : ''),
        button('endWeek', '주 종료', true),
        ' data-week="' + run.state.week + '"');
    }

    function resultNotes(week) {
      var lines = [];
      (week.verdicts || []).forEach(function (verdict) {
        if (verdict.line) lines.push(verdict.line);
        else if (verdict.headline) lines.push(verdict.headline);
      });
      (week.withdrawn || []).forEach(function (row) { if (row.headline) lines.push(row.headline); });
      if (!lines.length) return '';
      return '<ul class="notes">' + lines.map(function (line) { return '<li>' + esc(line) + '</li>'; }).join('') + '</ul>';
    }

    function resultTables(week) {
      var accepted = (week.accepted || []).map(function (row) {
        var spec = run.catalog[row.id];
        return '<tr><td>' + esc(spec ? spec.title : row.id) + '</td><td class="num">' + format(row.retainer, 'money') + '</td></tr>';
      }).join('');
      var tasks = (week.taskResults || []).map(function (row) {
        var staff = staffById(row.staffId);
        var result = RESULT[row.result] || row.result;
        return '<tr><td>' + esc(row.name) + '</td><td>' + esc(staff ? staff.name : row.staffId) + '</td>' +
          '<td' + tip('업무 ' + result, '굴림 ' + format(row.roll), '성공 확률 ' + format(row.p, 'percent')) + '>' + esc(result) + '</td></tr>';
      }).join('');
      var verdicts = (week.verdicts || []).map(function (row) {
        var spec = run.catalog[row.id];
        return '<tr><td>' + esc(spec ? spec.title : row.id) + '</td><td>' + esc(OUTCOME[row.outcome] || row.outcome) + '</td>' +
          '<td class="num">' + format(row.successFee, 'money') + '</td><td class="num">' + format(row.rep, 'delta') + '</td></tr>';
      }).join('');
      return (accepted ? '<table class="fm"><caption>수임</caption><tbody>' + accepted + '</tbody></table>' : '') +
        (tasks ? '<table class="fm"><caption>업무</caption><thead><tr><th>업무</th><th>직원</th><th>결과</th></tr></thead><tbody>' + tasks + '</tbody></table>' : '') +
        (verdicts ? '<table class="fm"><caption>판결</caption><thead><tr><th>사건</th><th>결과</th><th>성공</th><th>명성</th></tr></thead><tbody>' + verdicts + '</tbody></table>' : '');
    }

    function resultHtml() {
      var week = run.state.lastWeek;
      return frame('result', resultNotes(week) + resultTables(week) + strip(week.week, week.rent),
        button('next', '다음', true),
        ' data-week="' + week.week + '"');
    }

    function endingHtml() {
      var ending = run.state.ending;
      var word = endingWord(ending);
      var kind = ending.kind === 'great' ? 'great' : ending.kind === 'bankrupt' ? 'bad' : '';
      var week = run.state.lastWeek;
      return frame('ending',
        '<h1 class="end-word ' + kind + '"' + tip(word, '종료 ' + format(run.state.weeksPlayed, 'week'), '명성 ' + format(run.state.reputation) + ' · 누적 매출 ' + format(run.state.revenue, 'money')) + '>' + esc(word) + '</h1>' +
        '<p class="end-sub">' + esc(ending.label) + '</p>' +
        (week ? resultNotes(week) + resultTables(week) : '') + strip(run.state.weeksPlayed, week ? week.rent : null),
        button('again', '다시', true),
        ' data-ending="' + esc(ending.kind) + '" data-week="' + run.state.weeksPlayed + '"');
    }

    function html() {
      if (screen === 'setup') return setupHtml();
      if (screen === 'office') return officeHtml();
      if (screen === 'result') return resultHtml();
      return endingHtml();
    }

    return {
      handle: handle,
      html: html,
      screen: function () { return screen; },
      state: function () { return run ? run.state : null; },
      ending: function () { return run && run.state.ending; },
      seed: function () { return seed; }
    };
  }

  function bindTips(doc, popRoot) {
    if (!popRoot) return;
    var tipEl = null;
    var tipFor = null;
    var tipTimer = null;
    function hideTip() {
      if (tipTimer) clearTimeout(tipTimer);
      tipTimer = null;
      if (tipEl) { tipEl.remove(); tipEl = null; tipFor = null; }
    }
    function showTip(el) {
      if (!el || !el.dataset || !el.dataset.tip || tipFor === el) return;
      hideTip();
      tipEl = doc.createElement('div');
      tipEl.className = 'tip';
      tipEl.setAttribute('role', 'tooltip');
      tipEl.innerHTML = el.dataset.tip;
      tipFor = el;
      popRoot.appendChild(tipEl);
      var rect = el.getBoundingClientRect();
      var width = tipEl.offsetWidth;
      var height = tipEl.offsetHeight;
      var view = doc.defaultView || { innerWidth: 1280, innerHeight: 800 };
      var left = Math.max(10, Math.min(view.innerWidth - width - 10, rect.left + rect.width / 2 - width / 2));
      var top = rect.top - height - 8 < 8 ? rect.bottom + 8 : rect.top - height - 8;
      tipEl.style.left = left + 'px';
      tipEl.style.top = top + 'px';
    }
    doc.addEventListener('pointerover', function (event) {
      if (event.pointerType === 'touch') return;
      var el = event.target && event.target.closest && event.target.closest('[data-tip]');
      if (tipTimer) clearTimeout(tipTimer);
      if (el) tipTimer = setTimeout(function () { showTip(el); }, 140);
      else if (tipEl) tipTimer = setTimeout(hideTip, 80);
    });
    doc.addEventListener('pointerdown', function (event) {
      var el = event.target && event.target.closest && event.target.closest('[data-tip]');
      if (event.pointerType === 'touch' && el) {
        showTip(el);
        if (tipTimer) clearTimeout(tipTimer);
        tipTimer = setTimeout(hideTip, 2600);
      } else if (!el) hideTip();
    });
    doc.addEventListener('focusin', function (event) {
      var el = event.target && event.target.closest && event.target.closest('[data-tip]');
      if (el) showTip(el);
    });
    doc.addEventListener('focusout', hideTip);
    if (doc.defaultView) doc.defaultView.addEventListener('scroll', hideTip, true);
  }

  function attach(doc, desk) {
    var app = doc.getElementById('app');
    function draw() {
      var view = doc.defaultView;
      var y = view && view.scrollY || 0;
      app.innerHTML = desk.html();
      if (view && view.scrollTo) view.scrollTo(0, y);
    }
    doc.addEventListener('input', function (event) {
      if (event.target.id === 'partner-name') desk.handle('name', {}, event.target.value);
    });
    doc.addEventListener('click', function (event) {
      var el = event.target && event.target.closest && event.target.closest('[data-act]');
      if (!el || el.disabled) return;
      var act = el.dataset.act;
      if (act === 'toggle' || act === 'assign') return;
      if (desk.handle(act, el.dataset)) {
        draw();
        if (act === 'stat' && el.id) {
          var step = doc.getElementById(el.id);
          if (step.disabled) step = doc.getElementById('step-' + el.dataset.key + '-' + (-Number(el.dataset.dir)));
          step.focus({ preventScroll: true });
        }
      }
    });
    doc.addEventListener('change', function (event) {
      var el = event.target && event.target.closest && event.target.closest('[data-act]');
      if (!el || el.disabled) return;
      var changed = false;
      if (el.dataset.act === 'toggle') changed = desk.handle('toggle', el.dataset);
      else if (el.dataset.act === 'assign') changed = desk.handle('assign', el.dataset, el.value);
      if (changed) draw();
    });
    bindTips(doc, doc.getElementById('pops'));
    draw();
    return desk;
  }

  function mount(doc, Loop) {
    var app = doc.getElementById('app');
    var search = doc.defaultView && doc.defaultView.location ? doc.defaultView.location.search : '';
    var raw = new URLSearchParams(search || '').get('seed');
    var parsed = raw == null || raw === '' ? NaN : Number(raw);
    var seed = Number.isInteger(parsed) ? parsed : 1;
    fetch('data/cases.json').then(function (res) { return res.json(); }).then(function (cases) {
      attach(doc, createDesk({ loop: Loop, cases: cases, seed: seed }));
    }).catch(function () {
      app.innerHTML = '<main class="scene scene-desk" data-screen="error">cases.json</main>';
    });
  }

  return { create: createDesk, attach: attach, mount: mount };
});
