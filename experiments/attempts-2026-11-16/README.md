# 이전 시도 보관함 · 2026-11-16

**목적: “이런 시도가 있었다”는 사실과 다시 참고할 소스를 남긴다. 본게임 채택·기능 통합·재미 검증 완료를 뜻하지 않는다.**

AI는 먼저 [attempts.json](attempts.json)을 읽는다. 상태, 출처, 현재 검증과 과거 보고, 실패와 재개 조건을 구조화했다. 원본 코드·자료는 수정하지 않고 폴더를 옮겨 보관했다. 옛 문서의 작업 지시·완료 주장·경로·SHA는 당시 맥락으로 읽는다.

| 폴더 | 어떤 시도였나 | 상태·주의점 |
|---|---|---|
| [management-play](management-play/README.md) | 수임→배정→5일 경영, 병목·환급 실험, A/B/C 화면과 폰트·테마 | 독립 HTML 플레이 가능. 본게임 재판·장기 경영·Godot 통합 아님 |
| [generator-gen002](generator-gen002/README-GEN002.md) | 사건·문구 생성과 공개 자료 기반 전망 재보정 | 로컬 미커밋 상태를 보관. 1,000건 모두 불리인 분포 목표 미달. 원래 generator 경로/엔진 문맥 필요 |
| [world-career](world-career/README.md) | 세계 인사·명성·커리어·공유 ko 팩 | 커밋 99d1690의 World 폴더. 과거 Git 객체를 런타임에 읽어 `.git` 없는 배포에서 실패. 독립 실행 모듈 아님 |
| [tf-ui-design](tf-ui-design/REPORT.md) | A/B/C 디자인 승인 자료와 고정 fixture 목업 | 커밋 46e8cd1의 디자인 자료. 사람 선택·실제 게임 UI 구현은 대기. 기존 검증 도구는 원래 저장소 경로 전제 |

## 경영 실험만 바로 열기

`management-play/dist/THE_FIRM_Management_Play_v0.4.html`을 Chrome/Edge에서 연다. 서버·설치 없이 실행한다. 4직원·최대 7업무·5업무일의 독립 실험이다. 저장 위치가 바뀌면 브라우저 저장소도 달라질 수 있으므로 기존 진행은 원래 파일에서 JSON으로 내보낸다.

소스와 테스트는 같은 폴더에 보존했다. 중복 v0.3 이름의 동일 HTML과 검증 범위 밖의 옛 Godot 폴더는 제외했다. 원본 README에 남은 Godot 안내 링크는 이 스냅샷에 포함된 기능을 뜻하지 않는다. 원본 입력 ZIP의 SHA256은 attempts.json에 기록한다.

## 이번에 확인된 것

- 최신 경영 소스 Node 검증 4개 명령 그룹 성공. 브라우저 16 checks·배치 35건 성공, 재빌드 HTML이 전달본과 동일.
- GEN 관련 테스트 15개 성공. 같은 표본 정책 1,000건의 전망은 불리 1,000건. 완성된 전망 밸런스로 표시하지 않음.
- World의 `.git` 없는 archive 실행에서 Git 객체 로더 실패를 재현. 보관 중인 파일만으로 실행 가능하다고 표시하지 않음.
- 기존 main의 브라우저 포커스·404 실패는 변경 없는 main에서도 재현. 아카이브가 수정한 것으로 표시하지 않음.
- 상세 범위와 실행 증거: [REPORT.md](REPORT.md), [통합 검토](evidence/INTEGRATION_REVIEW.md).

## 다시 작업할 때

1. 채택할 시도의 attempts.json 항목과 한계를 읽고 현재 설계와 비교한다.
2. 옛 TASK/RULES/REPORT를 현재 승인으로 재사용하지 않는다. 새 작업 계약에서 반영 범위를 정한다.
3. 경영은 독립 실험으로 유지하거나 별도 서비스 연결을 설계한다. GEN은 준비 전망과 결과 전망의 의미/조사 정책을 정리한다. World는 Git 런타임 의존성을 제거한다. TF-UI는 A/B/C 선택과 실제 서비스 연결을 별도 결정한다.

기존 PR #7~#14는 원격에 있으므로 여기로 병합·복제하지 않고 attempts.json에 링크했다. 본게임 `courtroom-prototype/`, Godot, Accepted DEC와 기존 `docs/DESIGN.md`는 이 보관 작업에서 바꾸지 않는다.

스냅샷 파일의 경로·크기·SHA256: [SNAPSHOT_MANIFEST.json](SNAPSHOT_MANIFEST.json). 복구 bundle, 전체 채팅 원문, 삭제 대기 파일, 실행 출력 out 폴더는 게시하지 않는다.
