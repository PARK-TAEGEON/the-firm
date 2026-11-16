# PORTFOLIO-001 — 한 판 완성본: 사무소의 한 주 → 공판 → 결산

Lane: experiment
Branch: `task/portfolio-001` · Owns: `game/`, 루트 `README.md`(신규), `docs/CURRENT.md`·`docs/CHANGELOG.md`(안내 항목 추가만) · 사용자 결정(2026-11-16): 경영 + 재판 연결, UI는 TF-UI-001 B안(법정 장면), 새 브랜치 push + PR.

## Goal
흩어진 실험 가운데 두 개(경영 5일 v0.4, DEMO-001 공판)를 **처음부터 끝까지 플레이되는 한 판**으로 잇는다. 링크 하나로 열려 10~15분 안에 끝나고, 사무소에서의 배정이 법정에서 쓸 준비 시간으로 이어진다.

## Scope
- `game/vendor/`: 두 엔진과 사건 데이터의 **바이트 동일 사본**(출처·해시는 `PROVENANCE.json`). 수정하지 않는다.
- `game/src/bridge.js`: 두 엔진을 잇는 순수 함수. `game/src/session.js`: 한 판의 상태·저장.
- `game/src/ui.js`·`style.css`: B안 방향의 실제 게임 화면. 원인 표시, 중첩 용어 설명, 핵심 우선·상세 펼침(DESIGN-NOTES §2.16).
- 서버·빌드 없이 `game/index.html`로 실행(정적 호스팅 가능).

## Forbidden
- `courtroom-prototype/`, `litigation-skeleton/`, Accepted DEC, 기존 `docs/DESIGN.md` 수정.
- vendor 사본 수정, 엔진 안의 판정·경제 수치 변경, 무작위.
- `experiments/attempts-2026-11-16/`를 런타임에서 import(보관함 AGENTS 규칙). 사본으로만 가져온다.

## 완료 기준
1. 타이틀 → 상담 → 5업무일 → 공판 준비 → 법정 → 판결·결산이 막힘 없이 이어진다.
2. 기록 검토 완료 시점이 공판 준비 횟수(4/3/2)를 정하고, 세 단계 모두 실제 플레이로 도달한다.
3. 같은 선택 → 같은 기록·판결. 실패한 명령은 상태를 바꾸지 않는다. 저장을 다시 읽으면 같은 화면이 된다.
4. 화면에서 "왜 이렇게 됐는가"를 알 수 있다(질문 횟수, 재판장 신뢰, 배정 변경 전후).
5. 새로 정한 규칙은 `game/RULES.md`, 자체 점검은 `game/REPORT.md`에 적는다.

## Tests
`cd game && node --test tests/game.test.js` · `python3 tests/browser_play.py`(브라우저 한 판 자동 진행) · 기존 `courtroom-prototype` `npm test` 불변 확인.

## 통과 기준
위 완료 기준과 **사람 플레이테스트**. 자동 검사 통과는 재미의 증거가 아니다. 병합은 사람이 결정한다.
