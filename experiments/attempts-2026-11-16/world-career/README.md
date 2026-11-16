# WORLD-003 — 공유 ko 팩·의뢰인 배정·공개 페이지

`courtroom-prototype/`에서:

```powershell
node world/run.js --career --seed 1 --years 20 --warmup-years 10
node world/career-report.js
node --test world/world.test.js world/career.test.js
npm test
```

`career-run.js`도 같은 진입점이다. 커리어의 별도 시계/고정 인구 교체는 삭제했다. 두 서비스가 모두 `simulation.step`의 실제 채용·이직·개업·휴직·은퇴·공직 이동 원장을 사용한다. 인구/조직/별 분포를 매년 목표값으로 되돌리지 않는다.

- 결과: `out/world-003-s1-w10-y20/start/index.md`, `final/index.md`, 각 `news.md` 및 `cases/*.md`. 개발자 자료는 별도 `audit.json`.
- 명성은 직함 출발점·작은 일상 업무 성과·큰 사건 성과를 쌓는다. 장기 명성의 최고점/직함 바닥은 남고 반짝 명성만 빨리 식는다. 전문 분야1개·현재 소속·직함을 표시한다.
- 장면은 공판 기록 기여를 제외했을 때 실제 판결이 바뀌는 단일/공동 기록에서 온다. 그런 기록이 없는 사건에는 “기록 검토”를 표시한다. 유죄에서 실형을 추정하지 않는다.
- 로펌 이름은 [법무부2026-09-21 명단](https://www.moj.go.kr/bbs/moj/106/610543/artclView.do)1715행과 김앤장 등 비법인/과거 보충 목록으로 검사한다. 출처: 법무부, 공공누리1유형. 원본은 `packs/ko.json`의 `firmRegistry`와 `naming.bannedFirms`. `import-firm-banlist.ps1`은 같은 JSON의 명단만 갱신한다.
- **SETTING 공유:** `packs/ko.json`을 JSON.parse 또는 JSON loader로 직접 읽는다. `specialties`(15개), `naming.surnames`/`naming.cohorts`(minAge 내림차순), `population.cities`(name/count/sourceRegion), `firmRegistry`(names/source/asOf/hash), `naming.bannedFirms`(추가 금지명)가 공용 인터페이스다. 실행 코드나 WORLD 서비스 의존성 없이 읽을 수 있다. `ko-career.js`는 같은 객체를 내보내는 호환 경로다. 금지명은 실제 세계에 생성하는 이름이 아니라 거절용 데이터다.
- 큰 사건 배정은 별·분야 가중치로 의뢰인 유입을 표현한다. 법정 정책/판정에는 전달하지 않는다. 로펌별은 구성원·실제 인원·실적을 반영하며 서열 예외를 허용한다.
- 장면의 실제 문장은 원장당 최대2회. 세 번째에는 기여 ID/공식 결과로 표시한다. `..`와 고정 조사 결합을 제거했다. 기사와 장면은 GEN `korean.js`를 재사용한다.
- GEN 판정은 기존 b6a15ea 고정commit, 조사 helper만 별도00b59c6 고정commit을 읽기 전용 사용한다. 현재 world-003-1팩 기록만 재생하며 구버전을 자동 변환하지 않는다. 숨은 정의가 든 `openRecord()` 반환값은 감사용이고 공개 페이지는 whitelist projection만 사용한다.
- 활동/휴직/은퇴/개업 활동 종료를 구분한다. 시니어 파트너의 자발적 이동을 늦추며 폐업 후 취업은 막지 않는다. 경제 모델·공급·채용 정원·폐업 규칙은 SYS-004 결정 전까지 유지한다.
- 20년 실측 별 분포, 작은 조직 감소 등 한계, 샘플은 [REPORT](REPORT.md). 전체 authored 규칙은 [RULES](RULES.md), 검증은 [REVIEW_PACKET](REVIEW_PACKET.md)와 [test-results.log](test-results.log).
- 커밋/병합/사람 플레이테스트는 사람이 한다. 아래 내용은 이전 v1 진입점의 이력이며 현재 동작보다 우선하지 않는다.

---

# WORLD-002 v1 — 사건 기록과 커리어 (과거)

`courtroom-prototype/`에서:

```powershell
node world/career-run.js --seed 1 --years 10 --warmup-years 10
node --test world/career.test.js
node world/career-report.js
```

- 새 계약의 혼합 시작 세계와 GEN 공판 연결은 `career-run.js`가 진입점이다. 기존 WORLD-001 `run.js`는 이전 경제/인사 회귀 비교용이다. 두 상태를 합치거나 같은 결과라고 주장하지 않는다.
- 결과: `world/out/world-002-s1-w10-y10/start/index.md`(1인 신입 시작), `final/index.md`(10년 뒤), 각각의 `news.md`, `cases/*.md`. Markdown 링크로 인물·로펌·공식 사건을 오간다. UI나 save/load는 아니다.
- `audit.json`은 개발자용이며 정책·시드·버전·공판 digest 및 비결정적 실행시간을 포함한다. 플레이어 페이지와 별도 보관한다. 결과 out/는 Git 제외.
- `createCareerWorld(seed, {warmupYears}).openRecord(caseId)`로 상세 공판을 요청 시 재생성한다. 반환값은 **감사용**(숨은 정의 포함)이며 직접 플레이어 화면에 전달하지 않는다. 공개 출력에는 `casePage`/`publicPerson`을 사용한다.
- 생성기: `task/gen-001`의 고정 commit `b6a15ea37ed54864bdb13058a2b3b2874fd4d231`을 `git show`로 읽고 require한다. 해당 commit의 generator 및 의존 engine/services를 함께 사용한다. Git 객체가 없으면 오류로 중단하며 다른 버전으로 대체하지 않는다. 네트워크·추가 패키지·원본 수정 없음.
- 공식 유죄에 양형을 붙이지 않는다. GEN 양형/일부 무죄/민사/상소 지원은 REPORT 요청 항목이며 WORLD가 발명하지 않는다.
- 기준·실험 규칙: [RULES.md](RULES.md). 단계별 결과·분포·성능·샘플: [REPORT.md](REPORT.md). 검증: [REVIEW_PACKET.md](REVIEW_PACKET.md), [test-results.log](test-results.log).

---

# WORLD-001 — 법조 세계 실험, 5차 (이전 진입점)

로펌35개, 변호사600·판사50·검사30명으로 시작하는 headless 실험이다. [RULES.md](RULES.md)는 **실험용 authored 규칙, DEC 아님**이다.

courtroom-prototype/에서 실행:

```powershell
node world/run.js --years 10 --seed 1
node world/report.js
node --test world/world.test.js
npm test
```

- [REPORT.md](REPORT.md):20년×3시드 원시 이벤트 집계, 무소속·신입채용·개폐업·이직·휴직·공직 추세, 기본/3,000변호사 성능.
- [REVIEW_PACKET.md](REVIEW_PACKET.md), [test-results.log](test-results.log): 변경 범위와 검증.
- out/events-seed-N.json: 전체 사건 포함 원시 이벤트. audit.js가 생애 이벤트에서 표를 다시 계산한다.
- out/news.md, out/news-year-1.md, out/stats.json, out/comparison.json: 신문·첫해52주 표본·투영·비교 결과. report 실행은20년, run 실행은 지정 기간.

신입 전용 한도와 통계층 이탈, 규모 비례 개업/이직/휴직, 날짜 데이터 이벤트, 준비 행동을 통한 서비스 성과, 드문 대형사건/가상 판례 공보, 뉴스 중복 제한을 적용했다. 판례의 법적 효력·자동 판정·UI는 미구현이다.

1면은 통계 최대1건·전주 기사 제외가 우선이며 조용한 주에는5건 미만일 수 있다. 같은 seed/기간 결과는 재현되며 실행시간만 달라진다. out/는 Git 제외. 커밋·병합은 사람이 한다.
