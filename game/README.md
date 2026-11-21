# THE FIRM — 12주

대표 능력치 20점을 나누고, 수임과 배정을 확인한 뒤 주를 넘긴다. 12주가 끝나면 위대한 로펌, 보통, 폐업 중 하나로 끝난다. 그 전에 현금이 끊겨도 엔딩으로 간다.

## 실행

`game/`을 정적 서버로 연다. 시드는 주소의 `?seed=`다. 파일을 직접 열면 `data/cases.json`을 읽지 못한다.

```
cd game && python3 -m http.server 4173
```

`http://127.0.0.1:4173/?seed=7`

## 구조

```
data/cases.json          사건
src/loop.js              12주 위임. 수식과 난수 순서의 기준
src/ui.js                대표 · 사무소 · 결산 · 엔딩. 조회와 입력만
src/tokens.css           디자인 토큰. 색·간격·테두리·그림자·글꼴의 값은 여기에만
src/style.css            화면. tokens.css의 변수만 쓴다
```

화면은 `openWeek`로 그 주 후보를 보고, `settleWeek`로 고른 수임·배정을 확정한다. 손대지 않으면 엔진의 자동 정책과 같다.

## 검증

```
cd game && node --test tests/*.test.js
```

규칙은 [RULES.md](RULES.md). 토큰 목록과 쓰임은 [TOKENS.md](TOKENS.md). 12주 수치의 기록은 [reports/LOOP-001-endings.md](reports/LOOP-001-endings.md).
