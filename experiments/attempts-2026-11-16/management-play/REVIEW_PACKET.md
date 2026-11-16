# THE FIRM UI 개선 · 검토 패킷

2026-10-27 · Lane: experiment. 현재 계약은 입력 `01_UI_IMPROVEMENT_TASK.md`와 TASK.md의 UI 개선 계약이다.

## 목적과 결과

업무실에서 위험·의뢰·시간을 읽고 사건 문맥을 유지하면서 인력을 비교해 배정한 뒤 하루를 진행하는 UI를 구현했다. Graphite 운영 화면과 Paper 문서,세 시각 테마 및 기존 폰트 후보를 복원했다. 경영 엔진·경제 규칙은 유지했다. 상세 보고는 `REPORT.md`,전후 화면은 `docs/UI_COMPARISON.html`이다.

## 변경 파일

- `src/ui.js`: 위험 중심 업무실,문맥 유지 서류철,인력 정렬·배정 전후 비교,별도 테마/폰트 설정과 로딩 표시.
- `src/style.css`: 테마·탐색·표·문서·직원·모달·반응형과 가독성.
- `src/index.template.html`: 제목·설명.
- `tests/ui-improvement-smoke.cjs`: 실제 조작·저장 불변식·엔진 일치·폰트·화면 검사.
- `tools/play-verify.cjs`: 새 UI suite와 suite별 근거 분리.
- `tools/capture-ui.cjs`,`tools/package-ui.py`: 화면 캡처,입력 바이트 보존 검사,실행본·소스 패키지.
- `REPORT.md`,`README.md`,`TASK.md`,`CREDITS.md`,현재 패킷과 `docs/ui-*`,`docs/UI_COMPARISON.html`,`docs/UI_IMPROVEMENT_REVIEW.md`: 결과와 근거.
- `docs/github-file-inventory.json`,`docs/source-context/`,`docs/local-reference-check.json`: 읽기 전용 참고 기록.
- `dist/*.html`: 새 소스 빌드. v0.3 파일명은 동일 바이트 호환 별칭.

정확한 변경 목록은 `docs/ui-provenance.json`,텍스트 diff는 `docs/ui-source-diff.patch`에 있다. 엔진·RULES·원래 자산·Godot는 입력 바이트를 유지했다. state.version/schemaVersion을 올리지 않았다.

## 불변식과 검증

조회·정렬·테마·폰트·화면 구조·배정 초안/취소는 게임 저장을 바꾸지 않는다. 실제 수임·배정·5일 진행은 기존 엔진과 같다. 현재 책임과 과거 수행 기록,현금과 미수,예측과 실제,준비 완료와 사건 종결을 구분한다. 계약 환급은 수임 전에 공개한다. 실제 수행은 가용시간 안에서만 진행한다.

실행: `python tools/build.py`(설치Python경로 사용),`node tools/play-verify.cjs --browser`,`node tools/capture-ui.cjs`,패키지 명령은 REPORT 참조.

- Node46/46,기존 브라우저20/20,v0.4브라우저11/11,신규UI16/16 PASS.
- 화면·모달35검사 PASS:1366×768·1440×900·390×844.
- 원본전략70+70재실행:12,699검증·실패0. 실험64+64재실행:14,035검증·실패0.
- 명령그룹7개·실패0·모두exit0. 기본 오프라인 오류0·외부 요청0. 명시적 온라인 폰트 실패 경로는 별도 기록.
- HTML SHA256:`db0aac8a264ecdf3a75f5343a0e03f9df51e5c713c46a343e616dc9939455727`.
- 독립 최종 검토 PASS:`docs/UI_IMPROVEMENT_REVIEW.md`.
- 입력과 고정24개 파일 동일,ZIP CRC 통과,소스ZIP 추출 후 재빌드한 HTML과 납품 실행본 바이트 동일:`docs/delivery-validation.json`.

## Fixture·미구현·한계

사건·직원·시간·금액·보고 문구는 기존 고정 시나리오다. 새 법률 추론·능력·재판·평판·채용·장기 경영·Godot 이식이 아니다. 자동 검사 통과는 재미 입증이 아니다. 사람 플레이,최종 선호,원격 후보의 온라인 성공은 미검증이다. 원격 레퍼런스 이미지를 픽셀 수준으로 직접 검수했다고 주장하지 않는다. 모바일 표는 내부 스크롤이 필요하다.

독립 소스에는 Git저장소가 없어 커밋·Git diff가 없다. 입력ZIP과 이전 로컬 소스,GitHub 목록을 읽기 전용으로 검토했다. 원본 작업본 변경·push·외부 배포는 없다.
