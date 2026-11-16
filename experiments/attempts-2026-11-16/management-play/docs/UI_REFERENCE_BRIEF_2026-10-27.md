# THE FIRM UI reference brief

조사일: 2026-10-27. 목적: 경영 시뮬레이터의 정보 밀도와 게임의 역할감을 함께 살리는 UI 레퍼런스. 기능 구현본의 작은 글씨를 더 줄이는 방향으로 해결하지 않는다.

이 문서는 공식 개발자 글·도움말·공식 이미지와 일부 커뮤니티 화면을 구분한다. 화면의 픽셀 수준 글자 크기·대비를 전부 측정한 감사가 아니다. 아래 적용 방향과 THE FIRM 수치는 자체 설계 제안이다. 2026-10-27 업데이트로 실제 화면 이미지 미리보기 7개와 관찰 포인트를 추가했다. 미리보기는 원문 이미지를 불러오므로 인터넷 연결이 필요하며, 표시되지 않으면 각 이미지 아래의 원본 보기를 이용한다.

## 이미지로 먼저 보기

각 이미지의 설명은 THE FIRM에 대한 적용 제안이다. 원본 게임·제품의 글자 크기, 데이터 열 수, 색상을 그대로 복제하라는 뜻은 아니다.

### 이미지 1 — FM24: 많은 대상을 비교하는 목록

![Football Manager 2024 National Pool List 화면. 많은 대상을 열 단위로 비교하는 목록 레퍼런스.](https://cdn.footballmanager.com/site/inline-images/England_%20National%20Pool%20List.jpg)

**볼 부분:** 대상 이름과 여러 속성을 같은 행에서 비교하는 구조. **THE FIRM 적용:** 업무명·담당·남은 시간·기한·예상 완료를 비교하고 조정할 행을 고른다. 열 수를 그대로 옮기지 말고 현재 규모에 필요한 정보부터 남긴다.

[원본 크게 보기](https://cdn.footballmanager.com/site/inline-images/England_%20National%20Pool%20List.jpg) · [공식 개발자 설명](https://www.footballmanager.com/features/more-gameplay-deep-dives)

### 이미지 2 — FM24: 편성과 대상 상세를 연결

![Football Manager 2024 Squad Planner Position 화면. 편성 목록과 역할 분석을 연결하는 레퍼런스.](https://cdn.footballmanager.com/site/inline-images/Watford_%20Squad%20Planner%20position.jpg)

**볼 부분:** 편성 중인 역할과 후보 정보를 함께 검토하는 구조. **THE FIRM 적용:** 담당자를 바꿀 때 다른 화면으로 이동하지 않고 해당 직원의 오늘 가용시간·비용·다른 담당 업무를 비교한다.

[원본 크게 보기](https://cdn.footballmanager.com/site/inline-images/Watford_%20Squad%20Planner%20position.jpg) · 자료 범위: FM24 관련 2023년 공식 기사 이미지.

### 이미지 3 — Carbon: 표의 정보 위계

![IBM Carbon Data table anatomy. 제목, 도구 모음, 열 머리글, 데이터 행을 구분하는 표 구성도.](https://s3.us-south.cloud-object-storage.appdomain.cloud/cxp-prod-payload-cms/datatable-anatomy-1.png)

**볼 부분:** 표 제목·도구 모음·열 제목·행을 역할별로 분리하는 방식. **THE FIRM 적용:** 검색·필터·정렬을 한 위치에 두고, 같은 종류의 정보가 매번 같은 열에 나오게 한다. 표의 가독성을 점검하는 기준 자료다.

[원본 크게 보기](https://s3.us-south.cloud-object-storage.appdomain.cloud/cxp-prod-payload-cms/datatable-anatomy-1.png) · [공식 가이드](https://www.carbondesignsystem.com/building-blocks/core/components/data-table/guidelines)

### 이미지 4 — Carbon: 상세는 필요할 때 펼치기

![IBM Carbon의 행 펼치기 표 예시. 기본 행 아래에 보조 정보를 공개하는 레퍼런스.](https://s3.us-south.cloud-object-storage.appdomain.cloud/cxp-prod-payload-cms/datatable-expand-1.png)

**볼 부분:** 기본 행과 보조 상세를 구분하는 방식. **THE FIRM 적용:** 평소에는 업무·담당·시간·기한을 읽고, 수행 이력과 비용 근거는 펼쳐서 본다. 글씨를 줄여 모든 정보를 동시에 넣는 문제를 줄인다.

[원본 크게 보기](https://s3.us-south.cloud-object-storage.appdomain.cloud/cxp-prod-payload-cms/datatable-expand-1.png)

### 이미지 5 — RimWorld: 사람과 업무를 교차 비교

![RimWorld Manual priorities 표. 인물과 업무 유형을 교차해 우선순위를 정하는 오래된 화면 예시.](https://rimworldwiki.com/images/e/e9/Manual_priorities.png)

**볼 부분:** 사람×업무의 교차표에서 배정과 우선순위를 비교하는 방식. **THE FIRM 적용:** 누가 어떤 업무를 담당할 수 있는지, 어디에 우선순위를 주었는지 한 번에 읽는 배정 화면의 보조 참고. 숫자와 색만으로 의미를 전달하지 말고 '높음·보통·낮음'과 배정 제약 설명을 함께 둔다.

[원본 크게 보기](https://rimworldwiki.com/images/e/e9/Manual_priorities.png) · [커뮤니티 위키 설명](https://rimworldwiki.com/wiki/Work). 최신판이 아닌 오래된 패턴 참고 이미지다.

### 이미지 6 — Suzerain: 세계의 상황과 정보를 함께 읽기

![Suzerain 공식 PC 스크린샷 Sordland Country Map Situations. 지도와 상황 정보를 연결하는 화면.](https://images.squarespace-cdn.com/content/v1/5c425ce655b02c911da1176d/4d63a7a1-f9ec-4270-b00a-7c82d0a295db/SordlandCountryMapSituations_4K.jpg)

**볼 부분:** 게임 세계의 맥락과 상태 정보를 함께 제시하는 표현. **THE FIRM 적용:** 숫자만 있는 요약 대신 사건·의뢰인·직원이라는 대상을 유지하며 관련 정보를 보여준다. 이 이미지 때문에 현재 게임에 지도를 추가할 필요는 없다. 보고서·신문의 문서 표현은 아래 Suzerain 개발자 글에서 별도로 참고한다.

[원본 크게 보기](https://images.squarespace-cdn.com/content/v1/5c425ce655b02c911da1176d/4d63a7a1-f9ec-4270-b00a-7c82d0a295db/SordlandCountryMapSituations_4K.jpg) · [공식 스크린샷 모음](https://www.torporgames.com/presskit)

### 이미지 7 — Papers, Please: 서류 검토를 게임의 행위로 표현

![Papers, Please 공식 작업대 스크린샷. 서류와 인물을 확인하며 판단하는 게임 화면.](https://papersplea.se/img/Shot02-Booth.png)

**볼 부분:** 문서가 단순 설명문이 아니라 실제로 검토하는 대상이 되는 방식. **THE FIRM 적용:** 수임 요청·계약 조건·준비 보고를 의뢰인과 연결하고, 무엇을 확인해 결정하는지 문서 안에서 분명히 드러낸다. 픽셀 글꼴과 좁은 작업 면적은 가독성의 모범으로 복제하지 않는다.

[원본 크게 보기](https://papersplea.se/img/Shot02-Booth.png) · [공식 사이트](https://papersplea.se/)

미리보기에 넣은 7개 이미지 URL은 이번 업데이트에서 이미지 응답을 확인했다. Float·Linear·This Is the Police 2의 일부 직접 이미지 주소는 조회가 불안정해 아래 원문 링크 중심으로 유지했다. 모든 이미지의 권리는 각 제작사·원저작자에게 있다.

## 먼저 전달할 기존 기준

- 기존 UI 프로토타입: https://chatgpt.com/library?file_id=libfile_05979c724ef48191b44d891e5c20d2c0&account_id=personal
- 기존 글꼴 후보: https://chatgpt.com/library?file_id=libfile_eca9825454a881919a1531a18ca1107d&account_id=personal
- 기존 프로토타입의 Navy & Brass / Paper & Ink / Verdict Graphite는 시각 테마다. 현재 실행본의 A 브리핑 / B 서류철 / C 편성표는 화면 구조이므로 같은 A/B/C로 혼동하지 않는다.
- 기존 테마와 글꼴 후보의 선택 기능을 출발점으로 사용한다. 새 기능의 엔진·현금·진행·저장 규칙은 화면 디자인과 별개로 유지한다.

## 추천 조합

**FM24의 목록/상세 + Float의 사람/시간 + Suzerain의 문서 성격 + Carbon의 데이터 가독성.** This Is the Police 2는 직원과 사건을 연결하는 게임적 표현의 보조 레퍼런스다. 전체 화면을 모두 섞지 않고 역할별로 참고한다.

| THE FIRM 화면 | 주 레퍼런스 | 적용할 패턴 |
|---|---|---|
| 대표 업무실·보고함 | FM24 Inbox + Linear Inbox | 읽을 소식과 대응할 결정을 구분, 해당 사건으로 바로 이동 |
| 사건 목록·구성원 비교 | FM24 목록 + Carbon table | 비교 열, 정렬, 선택 행 강조, 필요할 때 펼치는 상세 |
| 인력 편성 | Float Schedule + RimWorld Work | 사람×날짜와 사람×업무를 구분, 남은 시간·대기·배정 제약 표시 |
| 사건 상세·수임 검토 | Suzerain 문서 + Clio matter | 요청/계약/보고의 위계, 사건별 업무·미수·활동 묶음 |
| 하루 진행·결정 피드백 | FM24 Continue + Anno UX | 다음 행동이 보이는 진행 버튼, 관련 대상에서 짧게 조작 |

## 우선순위 높은 레퍼런스 5개

### 1. Football Manager 2024 — 판단하는 목록

- 볼 화면: Inbox, National Pool List, Squad Planner Position.
- 원문: https://community.sports-interactive.com/sigames-manual/football-manager-2024/the-user-interface-r4951/
- Inbox 설명: https://community.sports-interactive.com/sigames-manual/football-manager-2024/inbox-and-news-r4956/
- Squad Planner 개발자 설명: https://www.footballmanager.com/features/more-gameplay-deep-dives
- 목록 이미지: https://cdn.footballmanager.com/site/inline-images/England_%20National%20Pool%20List.jpg
- 편성/상세 이미지: https://cdn.footballmanager.com/site/inline-images/Watford_%20Squad%20Planner%20position.jpg
- 가져올 것: 정렬·필터·열 너비 조절, 선택 행의 상세 분석, 답해야 하는 메시지가 있을 때 진행 버튼의 의미가 바뀌는 구조.
- THE FIRM 적용: 업무명/담당/남은 시간/기한/예상 완료/조정의 비교표. 사건을 선택하면 같은 문맥에서 계약·준비·미수 상세를 연다.
- 피할 것: 축구 데이터의 열 수와 작은 글씨까지 복제. 현재 4직원·7업무 규모에는 적은 열과 큰 행이 적합하다.
- 버전 주의: 기사 사이트의 공통 헤더는 현재 제품명으로 바뀌지만, 선택한 본문은 FM24의 2023년 자료다. 최신작 UI라고 소개하지 않는다.

### 2. Float — 사람과 시간을 함께 배정

- 볼 화면: Schedule, Allocate with flexibility, Track capacity live.
- 공식 화면/설명: https://www.float.com/product/scheduling
- 도움말: https://support.float.com/en/articles/10629132-get-to-know-your-schedule
- 배정 의미: https://support.float.com/en/articles/4188692-allocate-time
- 배정 확대 이미지: https://cdn.prod.website-files.com/65efdf52a39c7b2ca4035c98/679284edd708e30e66017d0a_e817948544dcf0280e96a19b5bd21423_img%20placeholder%20%282%29.webp
- 가져올 것: 직원×날짜, 일정 블록, 가용시간과 배정량, 과부하를 같은 공간에서 읽는 방식.
- THE FIRM 적용: 편성표에서 담당 업무·남은 capacity·선행 대기를 구분하고 블록 선택이 조정으로 이어지게 한다.
- 피할 것: 과다 배정을 실제 초과 수행처럼 표시. THE FIRM은 배정은 허용하고 실제 수행은 가용시간으로 제한하므로 '대기/미완료 예상'을 정확히 표현해야 한다.
- 확인 범위: 공식 페이지의 본문과 이미지 설명 확인. 직접 이미지 fetch가 실패했으므로 미세한 스타일 평가는 하지 않았다.

### 3. Suzerain — 읽는 문서에도 역할 부여

- 볼 화면: 기밀 보고서, 신문, 결정 문서.
- 개발팀 UI 변경 설명: https://www.indiedb.com/games/suzerain/news/may-monthly-report
- 보고서/신문 이미지: https://media.moddb.com/images/articles/1/283/282616/auto/c446d10134eab60564a2.jpg
- 현재 공식 스크린샷 모음: https://www.torporgames.com/presskit
- 가져올 것: 보고서와 신문의 중요도·서체·출처 차이를 의도적으로 표현한 사례. 문서의 목적을 시각 위계와 연결한다.
- THE FIRM 적용: 의뢰인 요청, 계약 조건, 직원의 실제 수행 보고를 같은 카드 모양으로 통일하지 않는다. 인물 이름·출처·의사결정 항목을 분명히 연결한다.
- 피할 것: 분위기를 위해 장문·작은 글씨·문서 장식을 매일 조작하는 표에 적용하는 것.
- 버전 주의: UI 변경 설명과 보고서 이미지는 2020년 개발 자료. 공식 press kit의 현행 이미지와 구분한다.

### 4. IBM Carbon — 표의 밀도와 상세 공개

- 볼 화면: Data table anatomy, sizing, expansion.
- 공식: https://www.carbondesignsystem.com/building-blocks/core/components/data-table/guidelines
- 표 구성 이미지: https://s3.us-south.cloud-object-storage.appdomain.cloud/cxp-prod-payload-cms/datatable-anatomy-1.png
- 행 펼치기 이미지: https://s3.us-south.cloud-object-storage.appdomain.cloud/cxp-prod-payload-cms/datatable-expand-1.png
- 가져올 것: 일관된 행/머리글 높이, 표 상단 필터와 행동, 추가 정보의 펼침, 선택·hover·버튼의 구분.
- THE FIRM 적용: 평소에는 업무·담당·시간·기한을 읽고, 수행 이력·비용 설명은 행 상세나 보조 패널로 연다.
- 피할 것: 모든 화면을 표로 만들거나 표 안에 또 작은 표를 넣는 것.
- 출처 수치: Carbon의 행 높이 선택지는 24/32/40/48/64px, 기본은 40px다. 이는 글꼴 크기가 아니라 행 높이다. THE FIRM의 한국어 기준값은 따로 검증해야 한다.

### 5. This Is the Police 2 — 직원과 사건의 게임적 연결

- 볼 화면: 직원·사건·근무 운영과 사건에 사람을 투입하는 화면.
- 공식 갤러리: https://www.thqnordicmobile.com/en/games/this-is-the-police-2/
- 이미지 1: https://www.thqnordicmobile.com/_astro/ThisIsThePolice2_Screenshot_1920x1080_01.Bp7arC8O_ZCA0Yd.webp
- 이미지 2: https://www.thqnordicmobile.com/_astro/ThisIsThePolice2_Screenshot_1920x1080_02.DqTRmu0X_25lgix.webp
- 이미지 3: https://www.thqnordicmobile.com/_astro/ThisIsThePolice2_Screenshot_1920x1080_03.Bl4EmFLE_1b7I70.webp
- 가져올 것: 직원이 자원 숫자에 그치지 않도록 이름·초상·현재 상태를 일관되게 연결하는 방향.
- THE FIRM 적용: 사람의 하루 시간을 사건에 투입한다는 감각을 배정과 보고 양쪽에서 유지한다.
- 피할 것: 전술 전투·지도·수사 시스템까지 현재 경영 화면에 추가하는 것.
- 확인 범위: 공식 갤러리·설명과 이미지 주소 확인. 모바일판 자료이므로 PC 화면의 정보 밀도 기준으로 그대로 쓰지 않는다.

## 폭넓게 비교할 보조 레퍼런스 8개

| 자료 | 정확히 볼 것 | 가져올 것과 한계 | 원문 |
|---|---|---|---|
| RimWorld | Work / Manual priorities | 사람×업무 비교와 배정 제약. 숫자/색만으로 의미를 전달하는 방식은 피하기. 위키의 2017/2019 이미지이며 최신 화면이나 공식 매뉴얼은 아님 | https://rimworldwiki.com/wiki/Work |
| Anno 1800 | UI DevBlog의 HUD·결정창·wireframe | 기능·가독성 우선, 적은 조작으로 관련 작업 수행. 세리프/금색/시대 재질은 장식 영역으로 제한 | https://www.anno-union.com/devblog-user-interface-2/ |
| Linear | Triage / Inbox | 의뢰 목록→검토→수락/거절, 중요한 변화→관련 대상. SaaS의 작은 글씨와 자동 분류까지 가져오지 않기 | https://linear.app/docs/triage ; https://linear.app/docs/inbox |
| Clio Manage | Matter Dashboard / Tasks | 사건별 업무·미수·일정·활동 묶음. 미국 신탁계좌·법원·회계 규칙을 게임 규칙으로 옮기지 않기 | https://help.clio.com/hc/en-us/articles/16681289917595-Matter-s-Dashboard |
| Papers, Please | 문서 작업대 | 서류를 비교·검토하는 행위 자체의 역할감. 픽셀 글꼴과 답답한 작업 면적까지 복제하지 않기 | https://papersplea.se/ |
| Democracy 4 | 정책과 영향 범위 | 선택의 원인·결과를 연결해 보여주는 보조. THE FIRM 전체를 노드 그래프로 만들 필요는 없음 | https://www.positech.co.uk/democracy4/ |
| Frostpunk 2 | Command Radial / contextual menu 설명 | 중요한 결정 때 주의를 모으고 현재 대상의 행동만 보여주기. 콘솔 원형 메뉴를 PC에 그대로 복사하지 않기 | https://news.xbox.com/en-us/2025/09/18/adapting-frostpunk-2s-depth-to-a-gamepad/ |
| VS Code | Basic layout / Sidebar / Panel | 탐색·주 작업·보조 정보·기록의 역할 구분과 접기. IDE의 메뉴 수·터미널 외형은 불필요 | https://code.visualstudio.com/docs/getstarted/userinterface |

추가 이미지:

- RimWorld 우선순위: https://rimworldwiki.com/images/e/e9/Manual_priorities.png
- RimWorld 업무표: https://rimworldwiki.com/images/f/fd/Work_priorities.jpg
- Linear Inbox: https://webassets.linear.app/images/ornj730p/production/b442b340278740de70919c868dce1afca4335fe7-3600x2080.png?auto=format&dpr=2&q=95&w=1440
- Clio Tasks는 2024 공식 자료의 13쪽: https://www.clio.com/wp-content/uploads/2024/01/Clio-2024-Product-Brochure-for-Mid-Sized-Firms.pdf
- Papers, Please 작업대: https://papersplea.se/img/Shot02-Booth.png
- VS Code 작업 공간: https://code.visualstudio.com/assets/docs/editing/userinterface/hero.png

스크린샷 탐색용 아카이브: https://interfaceingame.com/ 의 Simulation / Strategy. 작품 전체보다 Inventory, Management, Character, Dialogue 같은 실제 화면 단위로 좁혀서 고른다. https://www.gameuidatabase.com/ 도 보조 탐색처지만 이번 자동 조회는 robots 제한으로 본문을 확인하지 못했다.

## 모델에 전달할 순서

1. 기존 THE FIRM 프로토타입과 글꼴 후보를 먼저 첨부한다.
2. FM24 목록 1장에는 '정렬 가능한 비교와 선택한 행의 상세'라는 용도를 붙인다.
3. Float 편성표 1장에는 '직원×날짜, 가용시간과 대기 표시'를 붙인다.
4. Suzerain 보고서 1장에는 '문서의 위계·출처·역할감'을 붙인다.
5. Carbon 표 1장에는 '행 간격·핵심 열·추가 정보 펼침'을 붙인다.
6. 이후 직원 표현이 부족할 때만 This Is the Police 2를 추가한다.

상반된 전체 화면을 한꺼번에 주고 '비슷하게 만들어'라고 하지 않는다. 이미지마다 가져올 요소와 피할 요소를 함께 명시한다. 실제 첨부 이미지를 읽지 못하는 모델에는 URL만 넣어 같은 효과를 기대하지 않는다.

## 디자인 모델용 지시문

기존 THE FIRM UI 프로토타입과 글꼴 후보를 출발점으로 경영 화면을 개선하라. 게임의 역할감과 경영 시뮬레이터의 비교·배정 능력을 함께 유지한다. 참조 화면을 통째로 합성하지 말고 FM24에서는 목록/상세/진행 구조, Float에서는 직원×날짜 편성, Suzerain에서는 문서의 출처와 위계, Carbon에서는 표의 읽기 밀도와 점진적 상세 공개만 추출하라.

먼저 각 자료에서 가져올 요소를 3개 이하로 적고, 기존 프로토타입의 테마·폰트 후보와 연결한 토큰을 제시하라. 이후 대표 업무실, 사건 상세/수임 검토, 인력 편성의 3개 화면만 같은 데이터로 설계하라. 현재 데이터는 사건2건+신규 의뢰1건, 직원4명, 최대7업무,5업무일이다. 핵심 표는 업무명·담당·남은 시간·기한·예상 완료·조정 행동을 읽을 수 있어야 한다.

한국어 본문14~16px, 중요한 조작16px 안팎, 보조 문구12~13px, 비교표 행48~56px를 첫 검토 가설로 삼아 실제1366×768 화면에서 확인하라. 이 값들은 출처의 규정이 아니라 이번 가독성 실험값이다. 수치가 많은 핵심 정보는10~11px로 축소하지 말고 우선순위를 낮춘 정보를 접어라. 날짜·금액·시간의 숫자 정렬을 유지하고, 선택·대기·미배정·지연·완료를 색 외의 이름과 표시로도 구분하라.

기존 시각 테마와 폰트 후보를 비교할 수 있게 하되 임의로 하나를 최종 확정하지 말라. 분위기용 서체는 워드마크·문서 제목에 제한하고 반복해서 읽는 업무표는 명확한 한국어 글꼴로 검토하라. 게임의 경제·기한·실제 수행·예측·저장 규칙은 바꾸지 않는다. 구현 전에 첫 화면에서 다음 행동이 보이는지, 두 직원을 비교하기 쉬운지, 인계의 이득과 대가가 읽히는지 설명하라.

## 다음 선택 기준

주력 시안은 기존 Verdict Graphite 기반의 운영 화면과 Paper & Ink 기반의 문서 화면을 역할별로 검토할 수 있다. 이는 선택 후보이며 확정 디자인이 아니다. 색상 선호보다 읽기·비교·조정의 속도와 오류를 먼저 확인한다.

이번 결과는 레퍼런스 조사다. THE FIRM 소스나 UI를 수정하지 않았다. 이미지 저작물의 권리는 각 제작사에 있으며 디자인 참고와 화면 분석을 위한 링크다.
