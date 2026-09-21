# THE FIRM — Courtroom Core v0.5

기존 v0.4 신문 코어에 검사 이의 → 대응 → 판사 결정 → 증인 답변을 연결한 별도 웹 실험이다. 정식 Godot litigation-skeleton의 법률 규칙이나 VS 진행 상태를 변경하지 않는다.

## 실행

`index.html`을 브라우저에서 열면 된다. 설치·인터넷 연결이 필요 없다. 또는 이 폴더에서 `node serve.js` 실행 후 `http://127.0.0.1:4173`을 연다.

## 이번 변경

- 반복 질문, 근거 미확립, 결론 질문 형식의 세 조건에만 검사가 개입한다.
- 상황에 따라 질문 유지 / 근거 제시 / 좁혀 묻기 / 철회를 선택한다. 판사의 설명 요청은 현재 기록과 Inference를 재사용한다.
- 질문 허용과 증인 답변은 분리된다. 차단·철회만으로 Evidence가 생기지 않는다.
- Major Commitment는 Advocacy Record 한 곳만 사용한다. 이 버전에 새로운 공개 입장 행동을 추가하지 않았다.
- 중앙 영역이 이의 대응 중에만 전환된다. 기록은 하나의 목록과 필터·펼치기로 확인한다. 체크·상태 배지·상시 설명은 없앴다.
- 정확한 11개 Inference Variant, Stop/Frame/Press, 보강 압박, hard/contestable counter, Theory별 평가를 유지한다.

## 확인할 경로

- 거리·관찰 시간·최초 진술 확보 → 세 전제 선택 → 압박: 이의 없이 기존 신문 진행.
- 거리·관찰 시간 → 두 전제 선택 → 압박 → 질문 유지: 판사가 설명 요청. 기록 연결 / 좁혀 묻기 / 철회.
- 같은 두 전제의 첫 압박을 근거 제시로 진행 → 다시 압박 → 질문 유지: 반복 확인 허용 후 친분 반대 기록. 최초 진술과 대조하고 보강 압박 가능.
- 먼저 주변 광원 질문: 근거 미확립 이의. 유지는 차단, 근거 제시는 원 질문, 좁히기는 조명 사실만, 철회는 무답변.

## 구조와 검증

DATA `data/case.js` → SIMULATION `engine/core.js`, `engine/procedure.js` → SERVICES `services/courtroom.js` → UI `ui/app.js`.

```text
npm test
npm run test:browser
node tests/ui-budget.js v05
```

앱 자체에는 외부 패키지가 없다. 브라우저 테스트에는 Playwright와 Edge가 필요하다. `tests/artifacts/`는 생성 결과이며 커밋 대상이 아니다.

- 100 Node tests, 92 browser checks, 기존 Godot 2,280 checks 및 시작 검사 통과.
- 상세 결과와 요청된 8개 질문의 답: `REVIEW_PACKET.md`.
- UI 전후 수치와 문구 감사: `UI_TEXT_AUDIT.md`.
- 사건 전용 규칙과 미구현 범위: `EXPERIMENT_RULES.md`.

기반은 별도 보관된 실제 v0.4 배포본이다. 이 저장소의 이전 커밋은 v0.3였으므로 Git diff에는 v0.4 가져오기도 포함된다. 범용 법률 판단, 판사·상대 AI, 판결, 새 사건 또는 다음 VS는 구현하지 않았다.
