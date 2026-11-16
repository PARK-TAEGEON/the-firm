'use strict';
const fs = require('node:fs'), path = require('node:path');
const { performance } = require('node:perf_hooks');
const { createCareerWorld } = require('./career-service');
const { generator } = require('./generator-source');
const { starDistribution } = require('./career-simulation');
const fame = require('./reputation'), pages = require('./career-pages');
const { exportWorld } = require('./career-run');
const { bannedFirm } = require('./names');
const registry = require('./packs/ko.json').firmRegistry;
const pack = require('./packs/ko.json');
function firmRows(s) {
  return pack.population.sectors.map(sector => {
    const firms=s.firms.filter(f=>!f.closedWeek&&f.sector===sector.id);
    return {sector:sector.label,count:firms.length,mean:firms.length ? firms.reduce((n,f)=>n+fame.firmStars(s,f),0)/firms.length : null};
  });
}
function diagnostics(s) {
  const closures=s.events.filter(e=>e.type==='firm_closed'&&e.week>s.startWeek);
  const groups={}; for(const e of closures) groups[e.reason]=(groups[e.reason]||0)+1;
  const sentences=new Map(); for(const r of s.records)if(r.scene.text)sentences.set(r.scene.text,(sentences.get(r.scene.text)||0)+1);
  const matching=s.records.filter(r=>r.assignment.specialty===r.assignment.specialtyTag).length;
  return {closures:groups,sceneMax:Math.max(0,...sentences.values()),referencesOnly:s.records.filter(r=>r.scene.display==='references').length,
    matches:matching,total:s.records.length,firmStars:firmRows(s)};
}
function risingPeople(s) {
  return s.people.filter(p => p.active && p.role === 'lawyer').sort((a,b) => b.reputation.value-a.reputation.value || a.id.localeCompare(b.id)).slice(0,10)
    .filter(p => p.reputation.initial <= 1 && p.reputation.evidence.some(e => e.caseId && e.delta > 0 && s.records.find(r=>r.id===e.caseId).grade==='major'));
}
function main() {
  const time = performance.now(); generator(); const dependencyMs = performance.now()-time;
  const measurements=[];
  for(const seed of [1,7,42]) {
    const t=performance.now(), service=createCareerWorld(seed), start=service.snapshot(), warmupMs=performance.now()-t;
    const annualMs=[], begin=performance.now();
    for(let year=0;year<20;year++) {const y=performance.now();service.advance();annualMs.push(performance.now()-y);}
    const simulationMs=performance.now()-begin, final=service.snapshot();
    measurements.push({seed,start,final,warmupMs,simulationMs,annualMs});
    console.log(JSON.stringify({seed,warmupMs,simulationMs,bands:starDistribution(final),rising:risingPeople(final).map(p=>p.id)}));
  }
  const primary=measurements[0], {start,final}=primary;
  const folder='world-003-s1-w10-y20', output=path.join(__dirname,'out',folder);
  exportWorld(start,path.join(output,'start'));exportWorld(final,path.join(output,'final'));
  fs.writeFileSync(path.join(output,'audit.json'),JSON.stringify({dependencyMs, measurements:measurements.map(m=>({seed:m.seed,warmupMs:m.warmupMs,
    simulationMs:m.simulationMs,annualMs:m.annualMs,annual:m.final.annual,diagnostics:diagnostics(m.final),initialDistribution:pages.distribution(m.start),finalDistribution:pages.distribution(m.final)})),records:final.records},null,2));
  const percent=values=>values.map(v=>(v*100).toFixed(1)+'%').join(' / ');
  const pivotKinds=final.records.reduce((out,r)=>(out[r.scene.kind]=(out[r.scene.kind]||0)+1,out),{});
  const blocks=['# WORLD-003 보완 — 2026-10-07', '',
    '실험 lane. 이번 사용자 메시지6항목을 보완 계약으로 적용(로컬/원격 main에 WORLD-003 계약 파일 없음). Owns: world/. 기존 WORLD-002 미커밋 변경을 보존. 구현 커밋·push·병합 판단은 사람이 한다.', '',
    '## 진행 기록', '',
    '- 1단계: ko.json에 전문 분야15개·세대 이름·도시·금지명/출처 통합. JS는 호환 export. 기존 WORLD 한국 값도 같은 JSON으로 옮기고 수치는 보존.',
    '- 2단계: 별/전문 분야에 따른 의뢰인 배정. 원장에 배정 당시 입력을 보존. 판정/선택 품질 보너스 없음.',
    '- 3단계: 실제 기여와 변경 결과를 한 문장으로 연결, 같은 문장2회 이후는 근거 참조. .. 제거, GEN korean.js 재사용. 반복 검사는 사건ID를 제외한 실제 문장 기준.',
    '- 4단계: 신입 은퇴 오표시 수정, 내부 용어 제거, 시니어 파트너 자발적 이동 억제. 로펌 별에 실제 소속 인원과 성과 반영.',
    '- 5단계: 아래 세 시드20년 관찰·회귀. SYS-004 전 경영 모델/분포 복원/인위적 생존 보정 없음.', '',
    '## 검증', '', '```text',fs.readFileSync(path.join(__dirname,'test-results.log'),'utf8').trim(),'```','',
    '실행: `node world/run.js --career --seed 1 --years 20 --warmup-years 10`, `node world/career-report.js` (courtroom-prototype/).', '',
    '## 별점 분포: 시작 → 20년', '',
    '분모는 활동/휴직 중 변호사이며 은퇴·통계 집단은 별도다. 구간은 0.5~1.5 / 2~3 / 3.5~5, 목표 약40/45/15%. 연말 비율을 강제로 맞추지 않았다.', '',
    '| 시드 | 시작 | 5년 | 10년 | 15년 | 20년 | 활동 변호사(시작→끝) |', '|---|---|---|---|---|---|---|',
    ...measurements.map(m=>{const rows=m.final.annual.filter(a=>!a.warmup);return `| ${m.seed} | ${percent(starDistribution(m.start))} | ${[4,9,14,19].map(i=>percent(rows[i].distribution)).join(' | ')} | ${m.start.people.filter(p=>p.active&&p.role==='lawyer').length} → ${rows.at(-1).lawyers} |`;}), '',
    '개인 별 계수는 WORLD-002 보완 값을 유지했다. 이번 변화는 배정·이직·로펌 별의 요청된 영향이다. 비율을 맞추는 별 덮어쓰기는 없다.', '',
    '## 로펌별·배정·문장 반복 관찰', '',
    '| 시드/시점 | 초대형 평균(조직수) | 중견 평균(조직수) | 소형 평균(조직수) | 법인 외 평균(조직수) |', '|---|---|---|---|---|',
    ...measurements.flatMap(m=>[['시작',m.start],['20년',m.final]].map(([label,s])=>`| ${m.seed}/${label} | ${firmRows(s).map(r=>`${r.mean?.toFixed(2)??'해당 없음'} (${r.count})`).join(' | ')} |`)), '',
    '| 시드 | 형사 분야 일치 배정/전체 | 같은 문장 최대 | 반복 대신 근거 표시 | 폐업 이유(20년) |', '|---|---:|---:|---:|---|',
    ...measurements.map(m=>{const d=diagnostics(m.final);return `| ${m.seed} | ${d.matches}/${d.total} | ${d.sceneMax} | ${d.referencesOnly} | ${JSON.stringify(d.closures)} |`;}), '',
    '로펌별은 실제 인원·구성원 명성·성과 기록의 함수이며 sector 순위를 강제하지 않는다. 배정은 (10+별×8)×분야 일치3배. 위 배정 비율은 경쟁자 구성·명성까지 섞인 관찰값이며 전문 분야의 순수 인과 효과로 주장하지 않는다. 동일 조건 별/분야 비교는 회귀에서 따로 검증한다.', '',
    '## 실행 시간·WORLD 생애 사건', '',`GEN 최초 로딩 ${dependencyMs.toFixed(1)}ms. 아래는 export 제외 측정. 선행10년80건 + 이후20년480건 = 총560개 GEN 공판.`, '',
    '| 시드 | 선행10년(ms) | 이후20년(ms) | 채용 | 이직 | 개업 | 폐업 | 휴직 |', '|---|---:|---:|---:|---:|---:|---:|---:|',
    ...measurements.map(m=>{const rows=m.final.annual.filter(a=>!a.warmup),sum=k=>rows.reduce((n,a)=>n+a[k],0);return `| ${m.seed} | ${m.warmupMs.toFixed(1)} | ${m.simulationMs.toFixed(1)} | ${sum('hires')} | ${sum('transfers')} | ${sum('openings')} | ${sum('closures')} | ${sum('leaves')} |`;}), '',
    '| 연차(seed 1) | 엔진 | 일상 업무 집계 | 별 분포 | ms |', '|---|---:|---:|---|---:|',
    ...final.annual.filter(a=>!a.warmup).map((a,i)=>`| ${i+1} | ${a.engineCount} | ${a.routineCases} | ${percent(a.distribution)} | ${primary.annualMs[i].toFixed(1)} |`), '',
    '## 현실 분포 비교와 발견한 한계', '',
    '조직 비율은 관찰값이며 성공으로 판정하지 않는다. 다음은 기존 코드 경로의 원인 분석이다. SYS-004 설계 초안의 유입/소개/현금/폐업 제안을 가져와 구현하지 않았다.', '',
    '- market: 주간 공급은 활동 변호사×12/52로 제한된다. 전 세계 의뢰인을 명성/분야 적합도에 따른 조직 간 경쟁에 넣으며 소규모 지역·소개 수요의 독립 유입은 없다. 수임료는 고정 처리점수이므로 실제 현금/고정비 생존 모델이 아니다.',
    '- monthly/annual: 1인 전략은 채용 정원0. 다른 조직은 인원비례 채용 여력이 누적된다. 신규 개업에는 기존 구성원·개업 credit·조직수 상한이 필요하므로 폐업과 대칭적인 자동 복원이 아니다.',
    '- closeFirms: 신설1인 조직은12주 후 최근 주수×16 수입 기준, 기존1인 조직은26주 수입 합계78 기준으로 정리된다. 다인 조직에는 같은 수입 폐업 기준이 없다. 초기80개 법인 외 조직은 평균 약3.2명이며 은퇴/이직으로1인에 도달하면 이 비대칭 기준을 맞는다.',
    '- 통계집단 이탈: 폐업/미채용 뒤26주 동안 취업하지 못한 인물은 활동시장 밖으로 이동한다. 이는 은퇴와 다르며 이번 공개 표시만 바로잡았다.',
    '- 이번 로펌별 변경은 기존 시장/채용 효용으로도 전달되고 시니어 이동 감소도 부문 구성에 영향을 준다. 요청된 효과는 유지하되 공급·정원·폐업 기준·창업 credit에는 손대지 않았다. 기여 크기 분해/현금·소개 경로 설계는 SYS-004 결정 뒤 검토할 사항이다.', '',
    '### 시작 시점(seed 1)', '',pages.distributionTable(start), '', '### 20년 후(seed 1)', '',pages.distributionTable(final), '',
    '분모: docs/reference/KO-LAWYERS-FIRMS-2026.md의 개업32,253명. 생성 직후에는 최대잔여법으로 600명 부문/지역을 배분하지만 선행부터는 실제 WORLD 인사·경제만 사용한다. 연차는 실제 자료 부재로 authored이며 현실 연차 통계로 주장하지 않는다.', '',
    '## 결정적 장면과 공식 결과', '',
    `단일 기록으로 바뀜 ${pivotKinds.outcome_pivot||0}건 / 공동 기여로 바뀜 ${pivotKinds.joint_pivot||0}건 / 결과를 바꾸는 기여 없음 ${pivotKinds.no_single_pivot||0}건.`,
    '반사실 검사는 동일 확정 공판의 effects만 제외한 기록 재평가다. 다른 행동을 택했을 때의 전체 법정 진행이나 법적 인과관계 판정이라고 주장하지 않는다. 공동 기록 집합은 어느 하나를 빼면 더는 결론이 바뀌지 않는 inclusion-minimal 집합이다.',
    '장면은 사건명·담당자·실제 공판 문구·변경 전후 결론을 포함하며 템플릿을 순환한다. 단순 판결문 반복을 결정적 장면으로 부르지 않는다. 기반 증거만으로 같은 결과가 나는 사건에는 기여 없음 표시. GEN 양형 지원은 여전히 미제공이다.', '',
    '## 이름과 공개 정보', '',
    `실존 로펌 금지: [법무부 원본](${registry.source})의 ${registry.count}개 행 전체 법인명 + 기존 참고 목록. 공공누리 제1유형 출처: 법무부. 원본SHA256 ${registry.sourceSha256}. 이름 칼럼만 저장(주소/인물 정보 없음).`,
    '`import-firm-banlist.ps1`로 동일 xlsx에서 재생성. 공백·법무법인·유한·공증인가를 정규화하고 검사한다. 현재 등록 목록 시점의 검사이며 이후 신설/과거 해산 법인의 완전 검출 보장은 아님. 인명은 세대별 음절 풀의 가상 조합으로 실존 인물에서 가져오지 않았다.',
    `이번 결과의 금지명 충돌 ${final.firms.filter(f=>bannedFirm(f.name)).length}건. 모든 변호사 전문 분야는 최초 생성한 단일 태그이며 이직/휴직/은퇴에도 유지. 전문 등록을 사실로 주장하지 않는 게임 설정이다.`, '',
    '## 완료 기준·TBD', '',
    '| 항목 | 상태/근거 |', '|---|---|',
    '| 1 ko 팩 단일화 | JSON 직접 로딩, 전문 분야15개·세대 이름·도시·1715명단+비법인 보충 목록. SETTING 통합 실행은 범위 밖 |',
    '| 2 큰 사건 배정 | 명성·분야 가중 RNG, 신입 가능성 보존, 판정 비간섭 |',
    '| 3 결정적 장면 | 실제 결과 변경 검증, 원장 문장 최대2회, 반복은 근거 표시로 대체, 중복 마침표 없음 |',
    '| 4 페이지·이직·조사 | 은퇴/활동시장 이탈 구분, 내부 용어 제거, 파트너 이동 간격/편익 강화, GEN 조사 재사용 |',
    '| 5 로펌별 | 규모·소속·기록 반영, 위 표의 경향 관찰, 소형 역전 fixture 검증 |',
    '| 6 분포 붕괴 | 위 원인 분석만. SYS-004 경영 모델 미구현 |',
    '| 20년 별점 분포 | 위 세 시드 관찰. 대략적 목표이며 모든 시드 보장 아님 |',
    '| 현실 조직 부문 비율 | 미충족: 작은 조직이 줄어드는 경제 편향 확인. 별도 경제 보정 검토 필요 |',
    `| 무명 출신 상위10 | 시드별 ${measurements.map(m=>`${m.seed}: ${risingPeople(m.final).length}명`).join(' / ')}. 강제 스타 없음 |`,
    '| 사람 플레이테스트·커밋 | 대기. 다음 VS/GEN 변경 없음 |', '',
    '새 authored 규칙은 RULES.md 보완 절에 전부 기재. G1: GEN 양형/일부 무죄/공소기각 구조화 결과 요청. G2: 검사 행동·판사 관찰 입력 API 요청. G3: 직접 기록에 수치 기여가 없는 원형 초기 baseline의 출처 연결 지원 요청(현재는 결정적 기록 없음으로 표시).',
    '사람 판단 질문: ① 명성·분야에 따른 의뢰인 집중이 적절한가? ② 로펌별 규모 영향과 작은 조직의 역전 폭이 적절한가? ③ 반복 장면 대신 근거 참조 표시가 읽기 쉬운가?', '',
    '## 샘플 — 시작 인물5·종료 로펌2', ''];
  const active=start.people.filter(p=>p.active),cases=p=>start.records.filter(r=>Object.values(r.parties).includes(p.id)).length;
  const select=fn=>active.filter(fn).sort((a,b)=>cases(b)-cases(a)||a.id.localeCompare(b.id))[0];
  const samples=[['신입',active.find(p=>p.id===start.playerId)],['중견',select(p=>p.role==='lawyer'&&p.years>=5&&p.years<15&&!p.formerOffice)],
    ['베테랑',select(p=>p.role==='lawyer'&&p.years>=20&&!p.formerOffice)],['전관',select(p=>p.role==='lawyer'&&p.formerOffice)],['판사',select(p=>p.role==='judge')]];
  for(const [label,p] of samples) {if(!p)throw Error('sample missing '+label);blocks.push(`### ${label} · [페이지](out/${folder}/start/${p.id}.md)`,'','```text',pages.personPage(start,p.id).trim(),'```','');}
  const firms=[...final.firms].filter(f=>!f.closedWeek&&f.caseMerit.count).sort((a,b)=>b.caseMerit.total-a.caseMerit.total).slice(0,2);
  for(const f of firms)blocks.push(`### [${f.name}](out/${folder}/final/${f.id}.md)`,'','```text',pages.firmPage(final,f.id).trim(),'```','');
  const reportPath=path.join(__dirname,'REPORT.md'),old=fs.readFileSync(reportPath,'utf8');
  const marker='<!-- WORLD-003:end -->';
  const history=old.includes(marker)?old.slice(old.indexOf(marker)+marker.length):'\n\n## 이전 보고서 — 2026-10-06 (아래 수치/경계는 당시 버전)\n\n'+old;
  fs.writeFileSync(reportPath,blocks.join('\n')+'\n'+marker+history);
}
if(require.main===module)main();
module.exports={main,risingPeople,firmRows,diagnostics};
