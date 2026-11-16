# 자산과 출처

## 2026-10-27 UI 개선

시각적 출발점은 제공된 `THE_FIRM_UI_Prototype_v1.html`의 Verdict Graphite / Navy & Brass / Paper & Ink와 `THE_FIRM_Font_Candidates.html`입니다. 운영 화면의 청록·흑연색, 황동색 워드마크, 문서의 종이 표현을 역할에 따라 계승했습니다. 원래 HTML은 배포 패키지의 references/original에 보존합니다.

추가 폰트 바이너리나 외부 게임 이미지는 게임에 포함하지 않았습니다. 온라인 후보는 Google Fonts의 가족명/굵기 요청을 명시적 버튼으로만 로드합니다. 설치형 후보는 사용자의 실제 설치 상태에 따르며 이름을 표시하는 것만으로 폰트 파일의 배포 권리를 얻는 것은 아닙니다. Noto 내장 글꼴의 OFL은 유지했습니다. 원격 레퍼런스의 저작권은 원 제작사에 있습니다. 차용 범위와 실제 확인 한계는 `docs/UI_IMPROVEMENT_REVIEW.md`를 참고하세요.

## 한국어 글꼴

- Noto Sans KR, Google Fonts 공식 저장소의 가변 글꼴.
- 원본: https://github.com/google/fonts/tree/main/ofl/notosanskr
- 라이선스 전문: `assets/fonts/OFL.txt`, `godot/assets/OFL.txt`.
- 웹용 `FirmSans-Subset.ttf`는 원본에서 한글 음절·자모와 사용 기호를 보존해 로컬에서 서브셋한 파일입니다. 사용자의 문구를 외부 글꼴 서비스에 보내지 않았습니다.
- Godot는 원본 가변 글꼴에 본문 400·제목 600의 굵기를 지정합니다.

## 인물

`assets/art/staff-atlas.png`는 이번 실험을 위해 생성한 가상의 한국인 직원 4명입니다. 특정 실존 인물의 신원이나 사진을 사용하지 않았습니다.

배열은 좌상 이정우 / 우상 김현우 / 좌하 박서윤 / 우하 한도윤입니다. 웹과 Godot가 같은 atlas를 사용합니다.

## 프로젝트 근거

- THE FIRM 기존 UI 시제품 v1 및 글꼴 후보 첨부.
- THE-FIRM-UI-SPEC-v0.2.
- `PARK-TAEGEON/the-firm`의 `AGENTS.md`, `00_GAME_CONSTITUTION.md`, Accepted DEC-026와 실제 업무 실행 코드.
- 조사 시 확인한 main: `30dc3b25fa7cef6a600a689cd0b1a1cac49cd1d8`.

이 실험의 숫자·사건 텍스트·단순화한 스케줄링은 `RULES.md`에 따로 기록했습니다. 저장소의 미채택 경제 제안을 확정 규칙으로 가져오지 않았습니다.
