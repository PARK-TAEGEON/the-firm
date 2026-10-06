# GEN-002 실행

실제 체크아웃: `C:/Users/Admin/Documents/ChatGPT/The Firm`, 브랜치 `task/gen-001`.
`courtroom-prototype/`에서 실행한다.

```powershell
node generator/auto.js ARCH_THEFT 1 experienced
node generator/auto.js ARCH_FALSE_REPORT 12 novice
node generator/verify.js
node generator/report-gen002.js
```

`verify.js`는 생성기 전체 테스트, 기존 `npm test`, 10종 × 300시드 숫자 게이트를 실행한다. 명령별 합계와 exit code는 `out/verification.json`, 원문 로그는 `out/test-results.log`, `out/npm-test-results.log`, `out/balance-test-results.log`에 저장한다. `out/`은 generator/.gitignore로 제외한다.

`auto.js`는 첫 쟁점의 기본 자료 둘을 조사하고, 내부 ID나 수치 없이 전망·판결·복기를 출력한다. 콘텐츠 API의 내부 메타데이터를 그대로 화면에 출력하지 않는다.

```js
const C = require('./generator/content');
const d = C.buildContestedCase('ARCH_THEFT', 1);
const targetIssue = d.issues[1].id;
const investigations = d.investigations
  .filter(i => i.id.startsWith(`INV_${targetIssue}_`)).map(i => i.id);
const player = C.resolveCase('ARCH_THEFT', 1, {
  grade: 'daily', targetIssue, investigations, skill: 'experienced'
});
console.log(require('./generator/auto').formatResult(player));
```

전망은 `core/forecast.js`의 공개 정보 순수 함수다. 사건 정의나 엔진을 전달하지 않는다. 실제 공판만 기존 서비스로 실행한다. `grade: 'contested'`도 같은 정책과 판결을 사용한다.

`REPORT.md`에는 숫자 게이트, 10종·두 정책의 전망/실제 행렬, 원형별 3시드 공판 전문 30건과 대안 대사가 있다. `RULES.md`는 실험 규칙, `REVIEW_PACKET.md`는 변경 인계다. 사람 플레이테스트와 커밋·병합은 사람이 결정한다.
