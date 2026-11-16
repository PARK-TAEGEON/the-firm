'use strict';
const fs = require('node:fs');
const path = require('node:path');
const C = require('./content');
const { automaticCase } = require('./core/automatic');
const { schedule, sampleReport } = require('./report-gen002');
const bands = ['유리', '정석', '변수', '불리'];
const actualBands = ['유리', '다툼', '불리'];
const targets = [[15,25],[35,45],[20,30],[10,20]];
const pct = (n,d) => d ? `${(100*n/d).toFixed(1)}%` : '—';
function measure() {
  const rows=[];
  for(const a of Object.values(C.archetypes)) {
    const row={id:a.id,title:a.title,n:100,matrix:bands.map(()=>[0,0,0]),matched:0};
    for(let seed=1;seed<=100;seed++) {
      const d=C.buildContestedCase(a.id,seed);
      const {audit}=automaticCase(d,{...schedule(d,seed),skill:'novice'});
      row.matrix[bands.indexOf(audit.forecast)][actualBands.indexOf(audit.actualBand)]++;
      row.matched+=audit.matched;
    }
    rows.push(row);
  }
  const matrix=bands.map((_,i)=>actualBands.map((_,j)=>rows.reduce((n,r)=>n+r.matrix[i][j],0)));
  return {n:rows.reduce((n,r)=>n+r.n,0),rows,matrix};
}
function generateReport() {
  const out=path.join(__dirname,'out'); fs.mkdirSync(out,{recursive:true});
  const results=measure();
  fs.writeFileSync(path.join(out,'forecast-results.json'),JSON.stringify(results,null,2)+'\n');
  const checks=JSON.parse(fs.readFileSync(path.join(out,'verification.json'),'utf8'));
  const preservationLog=path.join(out,'preservation-test-results.log');
  const preservation=fs.existsSync(preservationLog) ? fs.readFileSync(preservationLog,'utf8').trim() : 'HEAD 대비 보존 비교는 별도 실행이 필요합니다.';
  const lines=['# GEN-002 전망 재보정 REPORT','',
    '2026-10-07 · Lane: experiment · task/gen-001 · 커밋·병합 없음 · 분포 목표 미충족 · 사람 플레이테스트 대기','',
    '## 실행과 검증','',
    'courtroom-prototype에서 `node generator/verify.js` 후 `node generator/report-gen002.js`. 최신 로그: generator/out/test-results.log 및 같은 폴더의 npm/balance-test-results.log. 집계 원본: generator/out/forecast-results.json.','',
    '| 실행 | checks | failures | exit code |','|---|---:|---:|---:|',
    ...checks.map(r=>`| ${r.command} | ${r.checks} | ${r.failures} | ${r.exitCode} |`),'',
    '추가 보존 검사: `Get-Content -Raw generator/out/compare-head.source.txt | node -` (PowerShell). 현재 코드와 HEAD의 콘텐츠 원고를 같은 시드·동일 신참 정책으로 대조했다. 사건 정의는 허용한 briefing만 제외하며 공판 기록과 판결은 그대로 비교한다.','',
    '```text',preservation,'```','',
    '## 신참 생성 1,000건 전망 분포','',
    '10개 원형별 시드 1~100, 각 100건을 동일 가중으로 합쳤다. 이전 schedule을 유지한다. 선택 쟁점을 교대하고 무준비 / 선택 쟁점 기본 하나 / 기본 둘 / 기본 둘+추가 하나 / 기본 둘+추가 둘을 순환하며 실제 예산을 적용한다. 조사 일정이나 생성 표본을 목표 비율에 맞춰 바꾸지 않았다.','',
    '| 전망 | 건수 | 비율 | 목표 | 판정 |','|---|---:|---:|---|---|',
    ...bands.map((b,i)=>{const n=results.matrix[i].reduce((s,x)=>s+x,0),p=100*n/results.n;return `| ${b} | ${n} | ${pct(n,results.n)} | ${targets[i].join('~')}% | ${p>=targets[i][0]&&p<=targets[i][1]?'충족':'미충족'} |`;}),'',
    '**목표 미달 원인:** 기존 일정은 한 쟁점의 기본 자료만 조사한다. 다른 핵심 쟁점의 우리 자료가 없으므로 새 필수 조건에 따라 모두 불리다. 표시 임계값만 조절해서 이 표본의 불리를 줄이면 요청한 자료 누락 규칙을 위반한다. 생성·판정·조사 정책을 바꾸지 않고 미달을 그대로 기록했다.','',
    '## 전망과 실제 결과','',
    '실제 판정은 변경하지 않았다. 무죄=유리, 유죄이면서 흔들린 쟁점 존재=다툼, 나머지 유죄=불리다. 정석과 변수는 서로 다른 준비 전망이며 별도 실제 결과 등급이 없다. 아래 일치율은 이 둘을 다툼으로 합친 **세 단계 환산 일치율**이다. 네 단계의 정확 일치율이나 승률 예측 정확도로 해석하지 않는다. 표본이 없는 행은 0% 대신 —로 표시한다.','',
    '| 전망 | 실제 유리(무죄) | 실제 다툼(유죄) | 실제 불리(유죄) | 환산 일치율 |','|---|---:|---:|---:|---:|',
    ...bands.map((b,i)=>`| ${b} | ${results.matrix[i].join(' | ')} | ${pct(results.matrix[i][i===0?0:i===3?2:1],results.matrix[i].reduce((s,x)=>s+x,0))} |`),'',
    '| 원형 | 건수 | 환산 일치 | 환산 일치율 |','|---|---:|---:|---:|',
    ...results.rows.map(r=>`| ${r.title} | ${r.n} | ${r.matched} | ${pct(r.matched,r.n)} |`),
    `| 합계 | ${results.n} | ${results.rows.reduce((n,r)=>n+r.matched,0)} | ${pct(results.rows.reduce((n,r)=>n+r.matched,0),results.n)} |`,'',
    '불리 전망에서도 실제 무죄가 나올 수 있다. 핵심 쟁점 전체의 준비 수준을 보는 새 전망과 선택 쟁점에 집중해 진행하는 기존 신참 정책은 서로 다르며, 전망은 판결을 확정하지 않는다.','',
    '## 완료 기준 자체 점검','',
    '1. 구현: 신참 유리는 모든 핵심 쟁점의 독립 기본 자료 쌍 확보, 알려진 상대 추가 반박 없음, 입증 유지 표시 없음일 때만 허용한다. 표시된 의심만으로 준비 부족을 건너뛰지 않는다.',
    '2. 구현: 어느 핵심 쟁점이든 우리 기본 자료가 없거나 확보 자료에 상대 추가 반박이 있으면 불리다. 중복 카드로 확보 수준을 부풀리지 않는다.',
    '3. 미충족: 요청한 분포 목표. 1,000건 실측 분포·결과 교차표·환산 일치율은 위에 기록했다. 임의 표본 재가중이나 숨은 사실 조회로 목표를 맞추지 않았다.',
    '4. 구현: 10종의 기본·변형 브리핑을 대표에게 보고하는 하십시오체로 통일했다. 증인·의뢰인의 고유 대사는 변경하지 않았다.',
    '5. 구현: 플레이어 전망은 유리/정석/변수/불리와 존댓말 설명만 반환한다. 숫자·확률·승률을 노출하지 않는다. 수치는 검토용 보고서에만 있다.','',
    '## 새 실험 규칙과 한계','',
    '실험용 authored 규칙, DEC 아님. RULES.md의 전망 재보정 절 참조. 모든 공개 쟁점을 핵심으로 취급하고, 기존 기본 관찰 자료의 서로 다른 카드 쌍을 결정적 준비의 대용 기준으로 사용한다. 개별 자료의 법적 결정성·증명력을 새로 판정한 것은 아니다. 추가 발견은 신참이 재반대하지 않는 기존 정책에서 강한 반박 위험으로 취급한다. 숨은 상대 자료는 전망에서 볼 수 없다.',
    '사건 진실·자료·반전 생성, 준비 예산, 실제 신문 정책, 판정 수치와 서비스는 유지했다. 회귀에는 기존 전망 개선을 요구하던 낡은 기대값 대신 새 보수적 전망 및 실제 결과 불변 검사를 넣었다. 기존 생성기 검증·밸런스·npm 테스트는 유지했다.',
    '아직 authored 인물·사건·대사 및 고정 신참/숙련 정책이다. 법률 추론, 증거능력, 항소, World/Career/Business, UI/save 등 다음 단계는 시작하지 않았다.','',
    '사람 판단 질문: 분포 목표를 측정할 실제 조사 상태의 모집단을 무엇으로 정할까요? 기존 한 쟁점 집중 일정에서는 새 불리 조건과 목표 비율이 양립하지 않습니다.','',
    sampleReport(),''];
  fs.writeFileSync(path.join(__dirname,'REPORT.md'),lines.join('\n').trimEnd()+'\n');
  console.log(JSON.stringify({cases:results.n,distribution:results.matrix.map(r=>r.reduce((a,b)=>a+b,0)),matched:results.rows.reduce((n,r)=>n+r.matched,0),targetMet:false}));
}
if(require.main===module)generateReport();
module.exports={measure,generateReport};
