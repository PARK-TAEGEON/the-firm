'use strict';

const { calendar, TYPE_NAMES, LEAVES } = require('./data');

function present(state) {
  const people = new Map(state.people.map(p => [p.id, p]));
  const firms = new Map(state.firms.map(f => [f.id, f]));
  const person = id => `${people.get(id).name}(${id})`;
  const firm = id => firms.get(id)?.name || '채용 시장';
  const role = value => ({ judge: '판사', prosecutor: '검사', lawyer: '변호사' }[value]);
  const years = state.events.filter(e => e.type === 'year_closed');
  const counts = {};
  const articles = [];
  const leaves = new Map();
  const highlighted = new Set();
  for (const e of state.events) {
    counts[e.type] = (counts[e.type] || 0) + 1;
    const date = e.week ? calendar(e.week) : { year: 0, month: 0 };
    const p = e.personIds?.[0];
    let title, body;
    switch (e.type) {
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
        body = `이전 소속: ${firm(e.from)}. 새 소속: ${firm(e.to)}. 선택 이유: ${{ founding: '독립 선호와 경력 축적', recruitment: '신규 채용', former_office: '공직 퇴직 후 진로', money: '보수', honor: '명성과 성장', balance: '업무 부담', public: '공익 지향', independence: '독립성' }[e.reason]}.`;
        break;
      case 'leave_started':
        leaves.set(p, e);
        title = `${person(p)}, ${LEAVES[e.leaveType][0]} 휴직`;
        body = `${e.firmId ? firm(e.firmId) : '공직'}의 근무 명단에서 잠시 빠진다. ${LEAVES[e.leaveType][1]}주 뒤인 ${e.returnWeek}주차 복귀 예정. 휴직 직전 누적 피로는 ${e.fatigue}/100이었다. 휴직 중 신규 사건을 맡지 않는다.`;
        break;
      case 'leave_returned': {
        const departure = leaves.get(p);
        title = `${person(p)}, ${LEAVES[e.leaveType][0]}을 마치고 복귀`;
        body = `${departure ? `${departure.week}주차에 떠났던` : '휴직했던'} 법조인이 복귀했다. 복귀 소속: ${e.firmId ? firm(e.firmId) : '공직'}.${e.leaveType === 'study' ? ' 유학을 마치고 실무 역량을 키워 돌아왔다.' : ' 피로를 회복하고 다시 업무에 합류한다.'}`;
        break;
      }
      case 'person_retired':
        title = `${person(p)}, ${e.age}세에 은퇴`;
        body = `${e.firmId ? firm(e.firmId) : '공직'}에서 물러났다. 그동안의 이동과 사건 경력은 인물 기록에 남는다.`;
        break;
      case 'spring_intake':
        title = `봄 채용 시장, 신입 ${e.count}명 유입`;
        body = '활동 인구 74명을 기준으로 생긴 빈자리를 보충한다. 신입들은 선호하는 보수·성장·업무 부담 등을 비교해 소속을 정한다.';
        break;
      case 'judge_rotation':
        if (highlighted.has(`rotation-${date.year}`)) break;
        highlighted.add(`rotation-${date.year}`);
        title = `2월 정기인사: ${person(p)}, 제${e.from}구역에서 제${e.to}구역으로`;
        body = '올해 법관 순환 배치가 기록됐다. 이 실험은 사건을 같은 주에 압축 종결하므로 계속 중 사건의 재판장 교체는 다루지 않는다.';
        break;
      case 'person_prominent':
        title = `${person(p)}, 일반 인물에서 주요 인물로`;
        body = '경험과 명성이 쌓여 인물 상세도 분류가 바뀌었다. ID와 이력, 사건 처리 규칙은 그대로 유지된다.';
        break;
      case 'case_completed':
        if (!e.achieved || highlighted.has(`case-${date.year}`)) break;
        highlighted.add(`case-${date.year}`);
        title = `${firm(e.firmId)}, ${TYPE_NAMES[e.caseType]} 업무 목표 달성`;
        body = `${person(p)}가 맡은 ${e.caseId}의 처리 역량 ${e.strength}가 요구 난도 ${e.difficulty}를 충족했다. 경험과 명성에 반영됐다. 이는 납기·서비스 목표를 압축한 성과이며 유무죄나 법적 사실판정이 아니다.`;
        break;
      case 'year_closed': {
        const leader = e.ranking[0];
        title = `${date.year}년 결산: ${leader.name} 연간 성과 1위${e.previousLeader && e.previousLeader !== leader.firmId ? ', 선두 교체' : ''}`;
        body = `활동 법조인 ${e.total}명, 누적 은퇴 ${e.retired}명. ${leader.name}은 ${leader.cases}건 중 ${leader.achieved}건의 서비스 목표를 달성했다(순위 점수 ${leader.score}). ${e.previousLeader && e.previousLeader !== leader.firmId ? `지난해 선두 ${firm(e.previousLeader)}를 앞섰다.` : '순위는 해당 연도의 성과로 산정했다.'}`;
        break;
      }
    }
    if (title) articles.push({ eventId: e.id, week: e.week, year: date.year, month: date.month, title, body });
  }
  const populations = [74, ...state.events.filter(e => e.type === 'weekly_census').map(e => e.total)];
  const leaders = [...new Set(years.map(e => e.ranking[0].firmId))];
  const selections = [
    e => e.type === 'person_hired' && e.reason === 'former_office',
    e => e.type === 'person_moved' && e.reason === 'founding',
    e => e.type === 'leave_returned' && e.leaveType === 'study',
    e => e.type === 'leave_returned' && e.leaveType === 'burnout',
    e => e.type === 'year_closed' && e.previousLeader && e.previousLeader !== e.ranking[0].firmId,
  ].map(predicate => state.events.find(predicate))
    .filter(Boolean).map(e => articles.find(a => a.eventId === e.id)).filter(Boolean);
  const news = [
    '# 법조 주간 — WORLD-001', '',
    `시드 ${state.seed} · ${state.week / 52}년 · 실험용 authored 규칙, DEC 아님`, '',
    '가상의 법조 시장이다. 기사에 붙은 기록 ID는 재실행한 사건 기록과 연결된다. 성과는 서비스 목표 달성으로, 판결을 생성하지 않는다.', '',
    '## 연도별 한눈에 보기', '',
    '| 연도 | 활동 인구 | 휴직 중 | 연간 1위 |', '|---|---:|---:|---|',
    ...years.map(e => `| ${e.year} | ${e.total} | ${Object.values(e.onLeave).reduce((a, b) => a + b, 0)} | ${e.ranking[0].name} |`), '',
    '## 먼저 읽을 기사', '',
    ...selections.map(a => `- [${a.year}년 ${a.month}월 · ${a.title}](#${a.eventId})`), '',
    '## 기사', '',
    ...articles.flatMap(a => [`<a id="${a.eventId}"></a>`, '', `### ${a.year}년 ${a.month}월 · ${a.title}`, '', a.body, '', `기록: ${a.eventId} · ${a.week}주차`, '']),
  ].join('\n');
  const stats = {
    schemaVersion: 1, rules: '실험용 authored 규칙, DEC 아님', seed: state.seed, weeks: state.week,
    initialPopulation: { lawyer: 60, judge: 8, prosecutor: 6, total: 74 },
    annual: years.map(({ id, week, type, ...detail }) => ({ eventId: id, week, ...detail })),
    eventCounts: counts, articleCount: articles.length,
    observations: { minWeeklyPopulation: Math.min(...populations), maxWeeklyPopulation: Math.max(...populations),
      withinExperimentalPopulationBand: populations.every(n => n >= 60 && n <= 90),
      distinctAnnualLeaders: leaders, noSingleFirmLeadsEveryYear: leaders.length > 1,
      fiveOrMoreArticles: articles.length >= 5, humanStoryReview: 'pending' },
    // Includes retirees and their history references; IDs are never removed or reused.
    people: state.people.map(p => ({ ...p,
      careerHistory: state.events.filter(e => e.type !== 'case_completed' && e.personIds?.includes(p.id)),
    })),
  };
  return { news, stats, articles };
}
module.exports = { present };
