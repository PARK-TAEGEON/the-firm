'use strict';
const pack = require('./packs/ko-career');
const { stars, firmStars } = require('./reputation');
const starText = value => `${'★'.repeat(Math.floor(value))}${value % 1 ? '½' : ''} (${value})`;
const when = week => week < 0 ? `시작 ${Math.ceil(-week / 52)}년 전` : week === 0 ? '시작 시점' : `시작 후 ${Math.ceil(week / 52)}년`;
const link = r => `[${r.id}](cases/${r.id}.md)`;
function publicRecords(s, personId) {
  return s.records.filter(r => r.visibility === 'public' && Object.values(r.parties).includes(personId));
}
function publicPerson(s, id) {
  const p = s.people.find(p => p.id === id);
  if (!p) throw Error('unknown person');
  const records = publicRecords(s, id);
  const organization = fid => s.firms.find(f => f.id === fid)?.name || '소속 없음';
  const descriptions = {
    person_entered: e => `${pack.labels.roles[e.role]} 경력 시작 · ${organization(e.firmId)}`,
    person_hired: e => `${organization(e.to)} 합류`, person_moved: e => `${organization(e.from)} → ${organization(e.to)} 이동`,
    firm_closed: () => '소속 조직 폐업', office_departure: e => `${pack.labels.roles[e.fromRole]} 퇴임 · 변호사 전환`,
    office_appointment: e => `${pack.labels.roles[e.role]} 임용`, person_retired: () => '은퇴',
    leave_started: () => '휴직 시작', leave_returned: () => '업무 복귀', market_exit: () => '개업 활동 종료',
    career_title: e => `${pack.reputation.titles[e.title][0]} 직함`, career_case: e => `${e.outcome} 사건 담당`,
    routine_performance: e => `일상 업무 ${e.count}건의 실적 기록`,
  };
  const timeline = s.events.filter(e => e.personIds?.includes(id) && e.visibility !== 'hidden' && descriptions[e.type])
    .map(e => ({ source: e.id, week: e.week - s.startWeek, text: descriptions[e.type](e), caseId: e.caseId || null, summarized: false }));
  if (p.origin.years) timeline.unshift({ source: `origin:${id}`, week: p.origin.week - s.startWeek,
    text: `선행 경력 ${p.origin.years}년 요약`, caseId: null, summarized: true });
  const rivals = new Map();
  if (['lawyer', 'prosecutor'].includes(p.role)) for (const r of records) {
    const other = p.role === 'lawyer' ? r.parties.prosecutor : r.parties.lawyer;
    if (!rivals.has(other)) rivals.set(other, []);
    rivals.get(other).push(r.id);
  }
  const status = pack.publicStatus[p.status];
  return { id: p.id, name: p.name, role: pack.labels.roles[p.role], active: p.active, status, city: p.city,
    years: p.years, stars: stars(p.reputation.value), field: p.specialtyTag,
    firmId: p.active ? p.firmId : null,
    organization: !p.active ? (p.status === 'retired' ? '은퇴' : '현재 공개 소속 없음') : p.role === 'judge' ? pack.labels.court : p.role === 'prosecutor' ? pack.labels.prosecution : organization(p.firmId),
    title: pack.reputation.titles[p.title][0],
    timeline, records: records.slice(-5).reverse().map(r => ({ id: r.id, week: r.week - s.startWeek, title: r.title,
      outcome: r.official.verdict, scene: r.scene.text || `기여 기록: ${(r.scene.recordIds || []).join(', ') || '결정적 기여 없음'}`, sentenceStatus: r.sentenceStatus })),
    rivals: [...rivals].filter(([, refs]) => refs.length >= 2).map(([id, sources]) => ({ id, sources, label: '반복 대립한 상대(공개 기록 관찰)' })),
    known: records.length ? `공개 사건 ${records.length}건의 담당 이력. 출처: ${records.map(r => r.id).join(', ')}` : '공개 경력 요약만 있음',
    unknown: pack.labels.unknown };
}
function personPage(s, id) {
  const p = publicPerson(s, id);
  return [`# ${p.name}`, '', `${p.title} · 경력 ${p.years}년 · ${p.city} · ${p.status}`,
    `현재 소속: ${p.firmId ? `[${p.organization}](${p.firmId}.md)` : p.organization}`,
    `명성 ${starText(p.stars)} · 전문 분야: ${p.field}`, '', '## 경력 타임라인', '',
    ...p.timeline.map(e => `- ${when(e.week)}: ${e.text}${e.summarized ? ' (생성된 요약 이력, 개별 사건 없음)' : ''} [출처 ${e.source}]${e.caseId ? ` · ${link({ id: e.caseId })}` : ''}`),
    '', p.role === pack.labels.roles.judge ? '## 주목 판결' : '## 최근 사건 기록', '',
    ...p.records.map(r => `- ${when(r.week)} · ${r.title}: ${r.outcome}${r.sentenceStatus === 'unsupported' ? ` (${pack.labels.sentenceMissing})` : ''} · ${link(r)}\n  ${r.scene}`),
    ...(p.records.length ? [] : ['공개 사건 기록 없음.']), '', '## 라이벌', '',
    ...p.rivals.map(r => `- [${r.id}](${r.id}.md) · ${r.label} · 출처 ${r.sources.join(', ')}`),
    ...(p.rivals.length ? [] : ['반복 대립 기록 없음. 같은 소속만으로 관계를 추정하지 않음.']), '',
    '## 알려진 점 / 모르는 점', '', p.known, '', p.unknown, ''].join('\n');
}
function firmPage(s, id) {
  const firm = s.firms.find(f => f.id === id);
  if (!firm) throw Error('unknown firm');
  const members = s.people.filter(p => p.active && p.role === 'lawyer' && p.firmId === id);
  const records = representativeCases(s, id);
  return [`# ${firm.name}`, '', `명성 ${starText(firmStars(s, firm))} · ${pack.population.sectors.find(x => x.id === firm.sector).label}`,
    '', '## 현재 소속', '', ...members.map(p => `- [${p.name}](${p.id}.md) · ${starText(stars(p.reputation.value))}`),
    ...(members.length ? [] : ['현재 활동 소속 없음.']), '', '## 대표 사건', '',
    ...records.map(r => `- ${r.title} · ${r.official.verdict} · ${link(r)}`),
    ...(records.length ? [] : ['공개 사건 기록 없음.']), '', '별은 현재 소속 명성과 이 로펌에서 담당한 사건 기록의 요약이다. 이전 소속 사건은 이관되지 않는다.', ''].join('\n');
}
function casePage(s, id) {
  const r = s.records.find(r => r.id === id && r.visibility === 'public');
  if (!r) throw Error('unknown public case');
  const name = key => s.people.find(p => p.id === r.parties[key])?.name;
  return [`# ${r.id} · ${r.title}`, '', `${when(r.week - s.startWeek)} · ${pack.labels.grades[r.grade]} 사건`, '',
    `공식 결과: ${r.official.verdict}`, `변호인 결과: ${r.official.defense || pack.labels.sentenceMissing}`,
    `검사 결과: ${r.official.prosecution}`, '',
    `담당 변호사: [${name('lawyer')}](../${r.parties.lawyer}.md)`,
    `담당 로펌: [${r.parties.firm}](../${r.parties.firm}.md)`,
    `검사: [${name('prosecutor')}](../${r.parties.prosecutor}.md)`,
    `판사: [${name('judge')}](../${r.parties.judge}.md)`, '',
    `${r.scene.kind === 'no_single_pivot' ? '기록 검토' : '결정적 장면'}: ${r.scene.text || `공개 결과 ${r.official.verdict} · 아래 기여 기록 참조`}`, `공판 출처: ${(r.scene.recordIds || [r.scene.recordId]).filter(Boolean).join(', ') || '개별 결정적 기여 없음'}`, '',
    '판결·신문 기록의 공개 요약이다. 숨은 진실·역량·예측 수치는 공개하지 않는다.', ''].join('\n');
}
function distribution(s) {
  const lawyers = s.people.filter(p => p.active && p.role === 'lawyer');
  const total = pack.population.sectors.reduce((n, r) => n + r.count, 0);
  const rows = pack.population.sectors.map(sector => ({ label: sector.label, reference: sector.count / total,
    count: lawyers.filter(p => s.firms.find(f => f.id === p.firmId)?.sector === sector.id).length }));
  rows.unshift({ label: pack.population.cities[0].name, reference: pack.population.cities[0].count / total,
    count: lawyers.filter(p => p.city === pack.population.cities[0].name).length });
  return { total: lawyers.length, rows: rows.map(r => ({ ...r, share: r.count / lawyers.length, gap: (r.count / lawyers.length - r.reference) * 100 })) };
}
function distributionTable(s) {
  const d = distribution(s);
  return ['| 활동 변호사 기준 | 현실 기준 | 관찰 세계 | 차이(%p) |', '|---|---:|---:|---:|',
    ...d.rows.map(r => `| ${r.label} | ${(r.reference * 100).toFixed(2)}% | ${r.count}/${d.total} (${(r.share * 100).toFixed(2)}%) | ${r.gap.toFixed(2)} |`)].join('\n');
}
function representativeCases(s, firmId) {
  const { evaluate } = require('./reputation');
  return s.records.filter(r => r.visibility === 'public' && r.parties.firm === firmId)
    .sort((a, b) => evaluate(b) - evaluate(a) || b.week - a.week || a.id.localeCompare(b.id)).slice(0, 5);
}
module.exports = { publicPerson, personPage, firmPage, casePage, distribution, distributionTable, when, link, representativeCases };
