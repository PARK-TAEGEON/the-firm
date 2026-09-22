# THE FIRM Courtroom Core v0.65

기존 v0.6 웹 프로토타입에 증인의 명시적 인정, 결론 질문의 범위, 답변에 따른 후속 경로, 지나친 결론 요구의 역효과를 추가한 실험입니다. Godot 프로젝트와 독립되어 있습니다.

## 실행

`index.html`을 열거나 이 폴더에서 `npm start` 후 http://127.0.0.1:4173/?v=0.65 로 접속합니다. Pretendard 파일이 포함되어 인터넷 없이 실행됩니다. 대사는 Noto Serif KR가 설치되어 있으면 사용하고, 없으면 바탕 계열 serif로 표시됩니다.

## 확인할 흐름

- 한서윤: 시점 확인 → 이전 사용 기회 질문 → 「확답을 요구한다」 → 범행 당시 사용을 특정할 수 없다는 결론. 이전 접촉을 배제할 수 없다는 인정이 응답을 바꿉니다.
- 처음부터 같은 결론을 요구하면 혈흔과 현장 정황을 설명합니다.
- 유리한 인정 후 「사용하지 않았다는 뜻입니까?」까지 요구하면 한정 설명과 불리한 기록이 남습니다. 여기서 멈추는 선택에는 별도 보너스가 없습니다.
- 서지훈도 시간·거리 확인 → 제한된 결론 → 증언 자체의 오류 요구라는 같은 문법을 사용합니다.
- 기록 두 개 이상을 연결하면 기존 Frame을 남길 수 있습니다. 실제 결론 질문은 선택한 조합의 강도와 별개로 문장을 읽고 고릅니다.

## 검증

`npm test`, `npm run test:browser`, `npm run test:budget`.
브라우저 테스트는 Playwright와 Edge를 사용합니다. 이 환경에서는 NODE_PATH에 번들 dependencies/node/node_modules를 지정합니다. 기존 두 브라우저 회귀는 claimVariants를 제외한 콘텐츠 fixture로 v0.6 resolver를 검사하고, browser-tactics.test.js는 수정하지 않은 배포 데이터를 검사합니다.

개발 전 root DESIGN.md와 `.agent/tasks/COURTROOM-CORE-065.md`를 읽으십시오. 상세 결과와 제한, 요청된 12개 답변은 REVIEW_PACKET.md에 있습니다. Opening/Closing/Verdict 및 실제 재주신문은 구현하지 않았습니다.
