'use strict';

const { calendar, TYPE_NAMES, LEAVES, NEWS } = require('./data');

const unique = values => [...new Set(values.filter(Boolean))];
const articleOrder = (a, b) => b.importance - a.importance || a.week - b.week || (a.eventId < b.eventId ? -1 : a.eventId > b.eventId ? 1 : 0);

function frontPage(articles, week, context = {}) {
  const relevance = a => (a.firmIds.includes(context.myFirmId) ? 100 : 0)
    + (a.firmIds.some(id => context.rivalFirmIds?.includes(id)) ? 30 : 0)
    + (a.personIds.some(id => context.personIds?.includes(id)) ? 30 : 0)
    + (a.specialties.some(type => context.specialties?.includes(type)) ? 10 : 0);
  const excluded = new Set(context.previousArticleIds || []);
  const candidates = articles.filter(a => a.week <= week && a.week > week - NEWS.lookbackWeeks && !excluded.has(a.eventId))
    .sort((a, b) => relevance(b) - relevance(a) || b.importance - a.importance || b.week - a.week || articleOrder(a, b));
  const selected = [], counts = new Map();
  const statistical = a => ['weekly_market', 'service_brief', 'monthly_ranking', 'year_closed', 'personnel_summary'].includes(a.type);
  let statistics = 0;
  for (const a of candidates) {
    if (statistical(a) && statistics >= 1) continue;
    if ((counts.get(a.category) || 0) >= NEWS.perCategory) continue;
    selected.push(a); statistics += Number(statistical(a)); counts.set(a.category, (counts.get(a.category) || 0) + 1);
    if (selected.length === NEWS.maximum) break;
  }
  // Diversity is a preference; real records fill the remaining minimum slots.
  for (const a of candidates) {
    if (selected.length >= NEWS.minimum) break;
    if (!selected.includes(a) && (!statistical(a) || statistics < 1)) { selected.push(a); statistics += Number(statistical(a)); }
  }
  return selected;
}

function renderNews(projection, year = null) {
  const { articles, annualTopTen, weeklyFrontPages, seed, weeks } = projection;
  const selectedYears = annualTopTen.filter(y => year === null || y.year === year);
  const lines = ['# 법조 주간 — WORLD-001', '',
    `시드 ${seed} · ${year === null ? `${weeks / 52}년` : `${year}년 표본 전체 52주`} · 실험용 authored 규칙, DEC 아님`, '',
    '기사는 세계 기록의 투영이다. 서비스 성과는 판결이 아니다. 대형사건은 서비스 기록, 판례 공보는 실험용 주입 자료이며 법적 효력·판정은 WORLD-002 범위다.', ''];
  for (const y of selectedYears) lines.push(`## ${y.year}년 올해의 법조 10대 뉴스`, '',
    ...y.articles.map((a, i) => `${i + 1}. [${a.title}](#${a.eventId}) — ${a.category} · 중요도 ${a.importance}`), '');
  for (const page of weeklyFrontPages.filter(p => year === null || calendar(p.week).year === year)) {
    lines.push(`## ${calendar(page.week).year}년 ${(page.week - 1) % 52 + 1}주 · 주간 1면`, '',
      ...page.articles.map(a => `- [${a.title}](#${a.eventId}) — ${a.category} · 중요도 ${a.importance}${a.week !== page.week ? ` · ${a.week}주차 기록 다시 보기` : ''}`), '');
    const current = articles.filter(a => a.week === page.week);
    for (const category of NEWS.categories) {
      const section = current.filter(a => a.category === category);
      if (!section.length) continue;
      lines.push(`### ${category}`, '');
      for (const a of section) lines.push(`<a id="${a.eventId}"></a>`, '', `#### ${a.title}`, '', a.body, '',
        `분류: ${a.category} · 중요도: ${a.importance} · 로펌 ID: ${a.firmIds.join(', ') || '없음'} · 인물 ID: ${a.personIds.join(', ') || '없음'}`, '',
        `기록: ${a.eventIds.join(', ')} · ${a.week}주차`, '');
    }
  }
  return lines.join('\n');
}

function present(state, context = {}) {
  const people = new Map(state.people.map(p => [p.id, p]));
  const firms = new Map(state.firms.map(f => [f.id, f]));
  const person = id => `${people.get(id).name}(${id})`;
  const firm = id => firms.get(id)?.name || '채용 시장';
  const role = value => ({ judge: '판사', prosecutor: '검사', lawyer: '변호사' }[value]);
  const years = state.events.filter(e => e.type === 'year_closed');
  const counts = {};
  const articles = [];
  const personnel = new Map();
  const weeklyCases = new Map();
  const leaves = new Map();
  const highlighted = new Set();
  const rotations = new Map();
  const history = new Map(state.people.map(p => [p.id, []]));
  for (const e of state.events) {
    if (e.type !== 'case_completed') for (const id of e.personIds || []) history.get(id).push(e);
    if (e.type === 'judge_rotation') rotations.set(e.week, (rotations.get(e.week) || 0) + 1);
  }
  const major = new Set();
  let topFirms = new Set(state.firms.slice(0, 10).map(f => f.id));
  for (const e of state.events) {
    counts[e.type] = (counts[e.type] || 0) + 1;
    const date = e.week ? calendar(e.week) : { year: 0, month: 0 };
    const p = e.personIds?.[0];
    if (e.type === 'case_completed') {
      if (!weeklyCases.has(e.week)) weeklyCases.set(e.week, []);
      weeklyCases.get(e.week).push(e);
    }
    if ((e.type === 'person_entered' && e.detail === 'major') || e.type === 'person_prominent') major.add(p);
    if (e.ranking) topFirms = new Set(e.ranking.slice(0, 10).map(f => f.firmId));
    if (e.type === 'leave_started') leaves.set(p, e);
    const relatedFirms = [e.firmId, e.from, e.to].filter(id => typeof id === 'string');
    const eligible = (e.personIds || []).some(id => major.has(id)) || relatedFirms.some(id => topFirms.has(id))
      || relatedFirms.some(id => id === context.myFirmId || context.rivalFirmIds?.includes(id))
      || (e.personIds || []).some(id => context.personIds?.includes(id))
      || ['year_closed', 'monthly_ranking', 'market_year', 'spring_intake', 'firm_closed', 'firm_opened', 'weekly_market', 'major_case', 'precedent_notice', 'policy_changed'].includes(e.type);
    if (!eligible) continue;
    if (!e.week) continue;
    let title, body;
    switch (e.type) {
      case 'major_case':
        title = `${firm(e.firmId)}, 주목받는 대형 사건의 서비스 단계 종결`;
        body = `${person(p)}의 준비 기록에 따라 의뢰 서비스 목표 ${e.achieved ? '달성' : '미달'}. 대형 분류는 실험용 관심도이며 법적 승패를 뜻하지 않는다.`;
        break;
      case 'precedent_notice':
        title = e.title;
        body = '가상 판례 공보가 도착했다. 실험용 주입 자료이며 자동 판결 생성·게임 규칙 수정 효과는 없다.';
        break;
      case 'policy_changed':
        title = `${e.effectiveDate} ${e.label}`;
        body = `실험 세계 검사 정원 ${e.quota}명으로 변경. 초과 인원은 변호사 채용 시장으로 이동한다. 실제 법령 정원을 재현한 수치가 아니다.`;
        break;
      case 'firm_opened':
        title = `${firm(e.firmId)} 개업`;
        body = `${e.strategy} 전략의 새 사무소가 사건 시장에 들어왔다.`;
        break;
      case 'firm_closed':
        title = `${firm(e.firmId)} 폐업`;
        body = e.reason === 'empty' ? '활동 소속 인원이 없어 영업을 종료했다. 사무소 ID와 과거 실적은 보존된다.'
          : `최근 ${e.windowWeeks}주 수입 ${e.windowRevenue}로 독립 사무소 유지 기준에 미달했다. 소속 인물은 채용 시장에서 다음 자리를 찾는다.`;
        break;
      case 'weekly_market':
        title = `${date.year}년 ${(e.week - 1) % 52 + 1}주 사건 시장: ${e.supply}건 유입`;
        body = `활동 변호사 ${e.activeLawyers}명, 영업 사무소 ${e.capacities.length}곳. 근무·복귀 상태에 따른 총 수용 여력은 ${e.capacities.reduce((n, f) => n + f.capacity, 0)}건이다.`;
        break;
      case 'monthly_ranking':
        title = e.ranking[0]?.revenue > 0 ? `${date.month}월 수입 순위: ${e.ranking[0].name} 선두` : `${date.month}월 집계 시작: 아직 매출 없음`;
        body = `월초까지의 연간 누적 실적이다. 상위 3곳: ${e.ranking.slice(0, 3).map(f => `${f.name}(${f.firmId}), 수입 ${f.revenue}`).join('; ')}.${date.month === 1 ? ' 1월 실적 초기화 직후다.' : ''}`;
        break;
      case 'market_year':
        title = `${date.year}년 시장 전망: ${TYPE_NAMES[e.demand]} 수요가 중심으로`;
        body = '이번 해의 사건 유입 구성이 바뀌었다. 각 사무소의 전문 분야와 인력 배치가 연말 성과에 어떻게 나타날지 주목된다.';
        break;
      case 'office_departure':
        title = `${person(p)}, ${role(e.fromRole)} 생활을 마치고 변호사로`;
        body = '공직 경력을 가진 새 변호사가 채용 시장에 나왔다. 다음 소속을 찾는 이 인물의 경력은 의뢰인의 사무소 선택에도 영향을 줄 수 있다.';
        break;
      case 'office_appointment':
        title = `${person(p)}, ${role(e.role)} 임용`;
        body = `${firm(e.from)}에서 공직으로 자리를 옮긴다. 떠난 인력의 사건 처리 여력은 이후 수임에 반영된다.`;
        break;
      case 'person_moved':
      case 'person_hired':
        title = `${person(p)}, ${firm(e.to)}${e.reason === 'founding' ? ' 개업' : ' 합류'}`;
        body = `이전 소속: ${firm(e.from)}. 새 소속: ${firm(e.to)}. 선택 이유: ${{ founding: '독립 선호와 경력 축적', recruitment: '채용', spring: '봄 신입 채용', former_office: '공직 퇴직 후 진로', money: '보수', honor: '명성과 성장', balance: '업무 부담', public: '공익 지향', independence: '독립성' }[e.reason]}.`;
        break;
      case 'leave_started':
        leaves.set(p, e);
        title = `${person(p)}, ${LEAVES[e.leaveType][0]} 휴직`;
        body = `${e.firmId ? firm(e.firmId) : e.role === 'lawyer' ? '무소속' : '공직'}의 근무 명단에서 잠시 빠진다. ${LEAVES[e.leaveType][1]}주 뒤인 ${e.returnWeek}주차 복귀 예정. 휴직 중 신규 사건을 맡지 않는다.`;
        break;
      case 'leave_returned': {
        const departure = leaves.get(p);
        title = `${person(p)}, ${LEAVES[e.leaveType][0]}을 마치고 복귀`;
        body = `${departure ? `${departure.week}주차에 떠났던` : '휴직했던'} 법조인이 복귀했다. 복귀 소속: ${e.firmId ? firm(e.firmId) : e.role === 'lawyer' ? '무소속' : '공직'}.${e.leaveType === 'study' ? ' 유학을 마치고 실무 역량을 키워 돌아왔다.' : e.leaveType === 'burnout' ? ' 피로를 회복하고 다시 업무에 합류한다.' : ' 휴직 기간을 마치고 업무에 합류한다.'}${e.leaveType === 'burnout' ? ` ${e.recoveryUntil}주차까지 신규 수임 상한을 낮춘다.` : ''}`;
        break;
      }
      case 'person_retired':
        title = `${person(p)}, ${e.age}세에 은퇴`;
        body = `${e.firmId ? firm(e.firmId) : e.role === 'lawyer' ? '무소속' : '공직'}에서 물러났다. 그동안의 이동과 사건 경력은 인물 기록에 남는다.`;
        break;
      case 'spring_intake':
        title = `봄 채용 시장, 신입 ${e.count}명 유입`;
        body = '활동 변호사의 3.5%가 신규 유입된다. 신입들은 선호하는 보수·성장·업무 부담 등을 비교해 소속을 정한다.';
        break;
      case 'judge_rotation':
        if (highlighted.has(`rotation-${date.year}`)) break;
        highlighted.add(`rotation-${date.year}`);
        title = `2월 정기인사: ${person(p)}, 제${e.from}구역에서 제${e.to}구역으로`;
        body = `올해 법관 ${rotations.get(e.week)}명의 순환 배치가 기록됐다. 이 실험은 사건을 같은 주에 압축 종결하므로 계속 중 사건의 재판장 교체는 다루지 않는다.`;
        break;
      case 'person_prominent':
        title = `${person(p)}, 일반 인물에서 주요 인물로`;
        body = '경험과 명성이 쌓여 인물 상세도 분류가 바뀌었다. ID와 이력, 사건 처리 규칙은 그대로 유지된다.';
        break;
      case 'case_completed':
        // Covered by the weekly service briefs below.
        break;
      case 'year_closed': {
        const leader = e.ranking[0];
        title = `${date.year}년 결산: ${leader.name} 연간 수입 1위${e.previousLeader && e.previousLeader !== leader.firmId ? ', 선두 교체' : ''}`;
        body = `활동 법조인 ${e.total}명, 누적 은퇴 ${e.retired}명. ${leader.name}은 ${leader.cases}건 중 ${leader.achieved}건의 서비스 목표를 달성했다(수입 ${leader.revenue}, 달성률 점수 ${leader.score}). ${e.previousLeader && e.previousLeader !== leader.firmId ? `지난해 선두 ${firm(e.previousLeader)}를 앞섰다.` : '순위는 해당 연도의 수입으로 산정했다.'} 전략별 수입 1위: ${e.strategyLeaders.map(f => `${f.strategy} — ${f.name}(${f.firmId}), 수입 ${f.revenue}`).join('; ')}.`;
        break;
      }
    }
    if (title) {
      const [category, baseImportance] = NEWS.types[e.type];
      const importance = e.largeTransfer ? 5 : e.reason === 'former_office' ? 4 : baseImportance;
      const firmIds = unique([...relatedFirms, ...(e.ranking ? e.ranking.slice(0, 3).map(f => f.firmId) : []),
        ...(e.strategyLeaders || []).map(f => f.firmId), e.previousLeader]);
      const article = { eventId: e.id, eventIds: e.sourceEventId ? [e.id, e.sourceEventId] : [e.id], largeTransfer: Boolean(e.largeTransfer), type: e.type, week: e.week, year: date.year, month: date.month,
        category: firmIds.includes(context.myFirmId) ? '내 로펌' : category, importance,
        firmIds, personIds: e.personIds || [], specialties: e.caseType ? [e.caseType] : e.demand ? [e.demand] : [], title, body };
      if (category === '인사' && importance <= 2) {
        const key = `${date.year}/${date.month}`;
        if (!personnel.has(key)) personnel.set(key, []);
        personnel.get(key).push(article);
      } else articles.push(article);
    }
  }
  for (const group of personnel.values()) {
    const last = group.at(-1);
    const totals = new Map();
    for (const a of group) totals.set(a.type, (totals.get(a.type) || 0) + 1);
    const labels = { person_prominent: '주요 인물 전환', person_hired: '채용', leave_started: '휴직', leave_returned: '복귀' };
    const monthEnd = Math.min(state.week, (last.year - 1) * 52 + Math.ceil(last.month * 52 / 12));
    const firmIds = unique(group.flatMap(a => a.firmIds)).filter(id => !firms.get(id).closedWeek || firms.get(id).closedWeek > monthEnd);
    articles.push({ ...last, week: monthEnd, type: 'personnel_summary', eventId: group[0].eventId,
      eventIds: group.flatMap(a => a.eventIds), category: firmIds.includes(context.myFirmId) ? '내 로펌' : '인사', importance: 1,
      firmIds, personIds: unique(group.flatMap(a => a.personIds)), specialties: [],
      title: `${last.year}년 ${last.month}월 인사 요약: ${group.length}건`,
      body: [...totals].map(([type, count]) => `${labels[type]} ${count}건`).join(' · ')
        + '. 주요 인물 전환은 상세도 변경이며 직급 승진은 아니다. 개별 경력 기록은 그대로 보존된다.' });
  }
  // Actual weekly service records supply quiet-week briefs; no invented major disputes.
  for (const [week, cases] of weeklyCases) {
    const groups = new Map();
    for (const e of cases) {
      const strategy = firms.get(e.firmId).strategy;
      if (!groups.has(strategy)) groups.set(strategy, new Map());
      const byFirm = groups.get(strategy);
      if (!byFirm.has(e.firmId)) byFirm.set(e.firmId, []);
      byFirm.get(e.firmId).push(e);
    }
    for (const [strategy, byFirm] of groups) {
      const entries = [...byFirm].sort((a, b) => b[1].length - a[1].length || (a[0] < b[0] ? -1 : 1));
      const [id, records] = entries[0], e = records[0], date = calendar(week);
      articles.push({ eventId: e.id, eventIds: records.map(r => r.id), type: 'service_brief', week,
        year: date.year, month: date.month, category: id === context.myFirmId ? '내 로펌' : '시장', importance: 1,
        firmIds: [id], personIds: unique(records.flatMap(r => r.personIds)), specialties: unique(records.map(r => r.caseType)),
        title: `${strategy} 주간 처리 동향: ${firm(id)} ${records.length}건`,
        body: `이번 주 이 전략의 처리량 선두다. 서비스 목표 달성 ${records.filter(r => r.achieved).length}건, 수입 ${records.reduce((n, r) => n + r.fee, 0)}. 법적 판정이나 대형 분쟁 결과를 뜻하지 않는다.` });
    }
  }
  articles.sort((a, b) => a.week - b.week || articleOrder(a, b));
  const initial = state.events.find(e => e.type === 'world_started').population;
  const populations = [initial, ...state.events.filter(e => e.type === 'weekly_census').map(e => e.total)];
  const leaders = [...new Set(years.map(e => e.ranking[0].firmId))];
  const annualTopTen = years.map(y => {
    const pool = articles.filter(a => a.year === y.year && a.type !== 'personnel_summary' && a.type !== 'service_brief').sort(articleOrder);
    const selected = [], persons = new Set();
    const take = a => {
      if (!a || selected.includes(a) || a.personIds.some(id => persons.has(id))) return;
      selected.push(a); a.personIds.forEach(id => persons.add(id));
    };
    take(pool.find(a => a.type === 'firm_opened'));
    take(pool.find(a => a.largeTransfer && !a.personIds.some(id => persons.has(id))));
    for (const a of pool) { if (selected.length === 10) break; take(a); }
    return { year: y.year, articles: selected.sort(articleOrder) };
  });
  const weeklyFrontPages = [];
  for (let week = 1; week <= state.week; week++) weeklyFrontPages.push({ week,
    articles: frontPage(articles, week, { ...context, previousArticleIds: weeklyFrontPages.at(-1)?.articles.map(a => a.eventId) || [] }) });
  const projection = { articles, annualTopTen, weeklyFrontPages, seed: state.seed, weeks: state.week };
  const news = renderNews(projection);
  const stats = {
    schemaVersion: 5, pack: state.pack, rules: '실험용 authored 규칙, DEC 아님', seed: state.seed, weeks: state.week,
    initialPopulation: Object.fromEntries(['lawyer', 'judge', 'prosecutor', 'total'].map(role => [role, state.events.filter(e => e.week === 0 && e.type === 'person_entered' && (role === 'total' || e.role === role)).length])),
    annual: years.map(({ id, week, type, ...detail }) => ({ eventId: id, week, ...detail })),
    events: state.events.filter(e => e.type !== 'case_completed'),
    eventCounts: counts, articleCount: articles.length,
    articles, annualTopTen: annualTopTen.map(y => ({ year: y.year, articleIds: y.articles.map(a => a.eventId) })),
    weeklyFrontPages: weeklyFrontPages.map(p => ({ week: p.week, articleIds: p.articles.map(a => a.eventId) })),
    firms: state.firms,
    observations: { minWeeklyPopulation: Math.min(...populations), maxWeeklyPopulation: Math.max(...populations),
      distinctAnnualLeaders: leaders, noSingleFirmLeadsEveryYear: leaders.length > 1,
      fiveOrMoreArticles: articles.length >= 5, humanStoryReview: 'pending' },
    // Includes retirees and their history references; IDs are never removed or reused.
    people: state.people.map(p => ({ ...p,
      careerHistory: history.get(p.id),
    })),
  };
  return { news, stats, ...projection };
}
module.exports = { present, frontPage, renderNews, articleOrder };
