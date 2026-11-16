# THE FIRM — 한 주, 그리고 한 번의 재판

사무소에서 누구에게 무엇을 맡겼는지가 변론 계획서를 정하고, 그 계획서가 판결을 정하는 10~15분짜리 한 판.

## 실행
`game/index.html`을 브라우저로 연다. 설치·서버·네트워크가 필요 없다. 정적 호스팅에는 `game/` 폴더를 그대로 올리면 된다.

## 구조
```
vendor/firm/engine.js        사무소 5일 엔진 (원본 그대로)
vendor/court/…               공판 엔진·사건 데이터·한국 법체계 팩 (원본 그대로)
src/bridge.js                두 엔진을 잇는 순수 함수 (기록 검토 단계, 성공보수)
src/plan.js                  변호사 능력치 · 초안 · 계획 → 공판 · 자동 공판의 다음 한 수
src/case-sheet.js            계획서용 이름표·연결표 (판정 수치 없음)
src/session.js               한 판의 상태 · 명령 · 저장 복원
src/ui.js · style.css        화면 (판정·경제 계산 없음)
src/glossary.js · audio.js   용어 설명 · 합성 효과음 (표시 전용)
```
DATA → SIMULATION → SERVICES → UI 순서를 지킨다. UI는 `session`의 `command`/`view`만 쓴다. 무작위가 없어 같은 선택은 같은 판결을 만든다.

## 검증
```
node --test tests/game.test.js      # 연결 규칙 · 능력치 · 개입 · 결정성 · 원자성 · 저장 복원 · 경계
python3 tests/browser_play.py       # 브라우저에서 한 판 전체 (playwright 필요)
```

규칙은 [RULES.md](RULES.md), 점검 결과와 한계는 [REPORT.md](REPORT.md), 엔진 출처는 [vendor/PROVENANCE.json](vendor/PROVENANCE.json), 자산 출처는 [assets/CREDITS.md](assets/CREDITS.md).
