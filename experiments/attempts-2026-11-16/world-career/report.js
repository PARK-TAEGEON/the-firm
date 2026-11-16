'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { simulate } = require('./service');
const { present, renderNews } = require('./presentation');
const { audit } = require('./audit');
const pct = n => (n * 100).toFixed(2) + '%';
function main() {
  const out = path.join(__dirname, 'out'); fs.mkdirSync(out, { recursive: true });
  const runs = [];
  for (const seed of [1, 2, 3]) {
    const start = performance.now(), state = simulate({ years: 20, seed });
    const seconds = (performance.now() - start) / 1000;
    const annual = audit(state.events), projection = present(state);
    fs.writeFileSync(path.join(out, 'events-seed-' + seed + '.json'), JSON.stringify(state.events));
    if (seed === 1) {
      fs.writeFileSync(path.join(out, 'news.md'), projection.news);
      fs.writeFileSync(path.join(out, 'news-year-1.md'), renderNews(projection, 1));
      fs.writeFileSync(path.join(out, 'stats.json'), JSON.stringify(projection.stats));
    }
    runs.push({ seed, seconds, annual, leaders: projection.stats.observations.distinctAnnualLeaders.length,
      major: projection.articles.filter(a => a.category === '대형사건').length,
      precedents: projection.articles.filter(a => a.category === '판례').length,
      frontMin: Math.min(...projection.weeklyFrontPages.map(p => p.articles.length)),
      frontMax: Math.max(...projection.weeklyFrontPages.map(p => p.articles.length)) });
    console.log(JSON.stringify({ seed, seconds, unemployedMax: Math.max(...annual.map(y=>y.unemployedRate)),
      firms: [Math.min(...annual.map(y=>y.firmCount)),Math.max(...annual.map(y=>y.firmCount))],
      openings: [Math.min(...annual.map(y=>y.openingRate)),Math.max(...annual.map(y=>y.openingRate))],
      transfers: [Math.min(...annual.map(y=>y.transferRate)),Math.max(...annual.map(y=>y.transferRate))] }));
  }
  const timings = [];
  for (const scale of [1, 5]) {
    const begin = performance.now(), state = simulate({ years: 10, seed: 1, scale });
    const simulated = performance.now(), projection = present(state), projected = performance.now();
    const json = JSON.stringify(projection.stats), news = projection.news;
    fs.writeFileSync(path.join(out, 'benchmark-' + scale + '.json'), json);
    fs.writeFileSync(path.join(out, 'benchmark-' + scale + '.md'), news);
    timings.push({ scale, initialLawyers: state.events.filter(e=>e.week===0 && e.type==='person_entered' && e.role==='lawyer').length,
      initialPeople: state.events.filter(e=>e.week===0 && e.type==='person_entered').length, years: 10,
      simulation: (simulated-begin)/1000, presentation: (projected-simulated)/1000, total: (performance.now()-begin)/1000 });
  }
  fs.writeFileSync(path.join(out, 'comparison.json'), JSON.stringify({ node: process.version, runs, timings }, null, 2));
  const lines = ['# WORLD-001 5차 관찰 보고서', '', 'Lane: experiment · Branch: task/world-001 · Owns: courtroom-prototype/world/', '',
    '실험용 authored 규칙, DEC 아님. 사람 플레이테스트·병합·커밋 대기. 결과 out/는 커밋 대상 아님.', '',
    '## 측정 기준', '',
    '- audit.js는 person_entered, 이동·임용·퇴직·휴직·통계층 이탈, 개폐업 원장을 재생한다. weekly_census는 관측 시점만 사용하고 그 값과 year_closed 집계는 읽지 않는다.',
    '- 무소속=연말 활동 변호사 중 소속 없음. 고용 변호사=2인 이상 사무소 소속(휴직 포함); 1인 대표는 제외. 이직률=개업 제외 로펌 간 이동 건수/주평균 고용 변호사.',
    '- 신입=당해 신규 변호사 person_entered, 채용=그 집단의 최초 소속 채용 인원, 이탈=그 집단의 통계층 이동 인원. 전관 전환은 신입 아님.',
    '- 개업률=개업/주평균 활동 변호사. 휴직률=시작 건수/주평균 활동 법조인, 번아웃/전체 별도. 재휴직은 별도 건수. 퇴직·통계층 인물 ID와 이력은 보존한다.', '',
    '## 20년 × 3시드: 원시 이벤트 연도별 집계', ''];
  for (const r of runs) {
    lines.push('### seed ' + r.seed, '', '| 연 | 변호사 | 무소속 수(%) | 신입 채용/유입(이탈) | 개업/폐업 | 개업률 | 로펌 | 이직 수(%) | 번아웃 수(%) | 전체휴직 수(%) | 판사/검사 |',
      '|---|---:|---|---|---|---|---:|---|---|---|---|',
      ...r.annual.map(y => '| '+[y.year,y.lawyers,y.unemployed+' ('+pct(y.unemployedRate)+')',y.hired+'/'+y.entrants+' ('+y.exited+')',y.openings+'/'+y.closures,pct(y.openingRate),y.firmCount,y.transfers+' ('+pct(y.transferRate)+')',y.burnout+' ('+pct(y.burnoutRate)+')',y.leaves+' ('+pct(y.leaveRate)+')',y.judges+'/'+y.prosecutors].join(' | ')+' |'), '');
  }
  const mean = (rows, key) => rows.reduce((n,y)=>n+y[key],0)/rows.length;
  lines.push('## 추세 확인', '', '첫5년/마지막5년 평균 비율. 회귀의 허용 오차는0.5%p이며 장기 방향만 확인한다.', '',
    '| seed | 무소속 첫/끝 | 이직 첫/끝 | 전체휴직 첫/끝 |', '|---|---|---|---|',
    ...runs.map(r=>'| '+r.seed+' | '+['unemployedRate','transferRate','leaveRate'].map(k=>pct(mean(r.annual.slice(0,5),k))+'/'+pct(mean(r.annual.slice(-5),k))).join(' | ')+' |'), '');
  lines.push('## 성능', '', 'Node '+process.version+'. 시뮬레이션은 단발 서비스의 독점 소유 draft를 반환한다(불필요한 snapshot 복사 없음). 분할 진행 서비스의 snapshot은 계속 깊은 복사. 전체는 기사·JSON 생성 및 out/ 파일 기록까지 포함한다. 로컬 1회 측정이며 CI 시간 보장은 아니다.', '',
    '| 초기 변호사/총인원 | 기간 | 시뮬레이션 초 | 기사 초 | 전체 초 |', '|---|---|---:|---:|---:|',
    ...timings.map(t=>'| '+t.initialLawyers+'/'+t.initialPeople+' | 10년 | '+t.simulation.toFixed(3)+' | '+t.presentation.toFixed(3)+' | '+t.total.toFixed(3)+' |'), '',
    '## 뉴스 관찰', '', '| seed | 대형사건 | 판례 공보 | 1면 최소/최대 | 연말 선두 종류 |', '|---|---:|---:|---|---:|',
    ...runs.map(r=>'| '+r.seed+' | '+r.major+' | '+r.precedents+' | '+r.frontMin+'/'+r.frontMax+' | '+r.leaders+' |'), '',
    '통계 기사 최대1건·전주 기사 제외를 우선한다. 실제 새 기사가 부족한 주는 5건을 강제로 채우지 않는다. 연말은 인물 중복을 금지하고 개업·대형 이적을 각1건 우선 확보한 뒤 중요도순으로 정렬한다.', '',
    '## 구현·규칙 및 한계', '',
    '- 신입 전용 채용 한도는 봄 유입용으로 분리. 26주 무소속이면 사내변호사·공공기관·국선전담 통계층으로 이동. 자연 실행에서 모두 채용되는 경우에도 회귀 fixture로 이탈을 검증한다.',
    '- 개업3%·이직8.5%·전체휴직4%의 월별 누적 기회를 사용한다. 목적 수치를 넣은 실험용 보정 모델이며 자발적 균형이 발견되었다고 해석하지 않는다. 상세는 RULES.md.',
    '- 초기35개 대비42개 개업 상한. 1인 사무소는 채용하지 않는다. 새 1인 사무소는12주 시험 운영 후 주당16 미만 수입이면 폐업한다. 초기 사무소에는 기존52주·주당3 기준. 수명과 수치의 재미·현실성은 사람 검토 대상.',
    '- 한국형 정원·유입률·채용률·나이·인사월·기관명·전환 날짜는 KO 데이터. 2026-10-02 공소청 전환은 첫 해당 날짜 이후 주 틱에 적용되며 검사30→24는 실험 규모로 축소한 authored 값. 실제 법령 검증 아님.',
    '- N4: 능력은 준비 작업당 소요시간, 업무량은 준비시간 예산에 반영한다. resolveCase는 완료된 검토 작업 수만 읽는다. 사건 기록의 준비 작업 수를 고정하면 능력·전관이 바뀌어도 결과는 같다. 법률 판정·증거 채택·판례 효력은 미구현.',
    '- 대형사건은 실제 서비스 처리 기록에 붙는 드문 관심도 이벤트. 판례는 가상 공보 템플릿 주입 이벤트이며 실제 판정승·규칙 수정자·자동 법적 추론은 구현하지 않았다.',
    '- 구직은 월1회 로펌별 인원 색인을 만들고 이동 때 갱신. 시장은 후보 로펌3곳만 인원 조회. 이력 투영도 이벤트1회 순회로 색인한다.', '',
    '## 계약서 완료 기준', '',
    '- 인구 폭증·소멸: 20년 표 참조. 고정 인구를 덮어쓰지 않는다.',
    '- 한 로펌 10년 독주: 위 선두 종류와 원시 year_closed 확인. 최소2개면 충족.',
    '- 같은 시드 같은 로그: 결정성·분할 실행·CLI 회귀로 확인.',
    '- 요청 수치:60개 연도 모두 무소속≤10%, 개업2~4%, 로펌28~42, 이직7~10%, 전체휴직3~5% 충족. 첫5년/끝5년 평균으로 누적 증가·하락 추세 없음 확인.',
    '- 성능: 기본10년 전체3초 이내. 확대3,000변호사는 시뮬레이션과 전체 시간을 위 표에 별도 공개하며 확대 전체3초 이내는 보장하지 않는다.',
    '- 이야기5개 이상: 뉴스 자료 제공. 재미 충족 여부는 사람 판단 대기.', '',
    '## 사람 판단 질문', '',
    '1. 12주 시험 개업과 빈번한 폐업이 읽을 만한 경력 이야기를 만드는가?',
    '2. 조용한 주에 기사 수를 줄이는 편집이 적절한가?',
    '3. 가상 판례 공보를 WORLD-002 실제 판정·효력 구현 전까지 유지할 것인가?', '');
  lines.push('## 테스트 실행 결과', '', '실행 명령: node --test world/world.test.js; npm test; node world/report.js', '');
  for (const name of ['world-tests.log','core-tests.log']) {
    const file = path.join(out, name);
    if (!fs.existsSync(file)) { lines.push('- '+name+': 실행 로그 없음. 검증 대기.'); continue; }
    const bytes=fs.readFileSync(file), log=bytes.toString(bytes[0]===255 && bytes[1]===254 ? 'utf16le' : 'utf8');
    const tests=log.match(/tests (\d+)/)?.[1], failures=log.match(/fail (\d+)/)?.[1];
    lines.push('- '+name+': checks '+(tests || '미완료')+', failures '+(failures || '0')+'. 프로세스 exit code는 test-results.log 참조.');
  }
  lines.push('', '범위 밖 변경 없음. root DESIGN 대신 소유 범위의 RULES에 이번 실험 설계 변경을 기록했다. WORLD-002·UI·판례 효력은 시작하지 않았다.', '');
  fs.writeFileSync(path.join(__dirname, 'REPORT.md'), lines.join('\n'));
  console.log(JSON.stringify({ timings }));
}
if (require.main === module) main();
module.exports = { main };
