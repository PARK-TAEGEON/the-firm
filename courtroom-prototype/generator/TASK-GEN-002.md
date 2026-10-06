# GEN-002

Lane: experiment
Branch: task/gen-001
Owns: courtroom-prototype/generator/ 전체 (2026-10-03 사용자 결정)
Read only: content/CATALOG.md, docs/DESIGN-NOTES-2026-09.md §1.4·§1.9·§1.10, DEC-031, DEC-032, root DESIGN.md, 기존 trial engine/service

사용자의 GEN-002 요청이 GEN-001의 원형 수·역할별 파일 제한을 대체한다. `.agent/tasks/`에는 GEN-002 파일이 없으므로 허용 폴더에 요청을 기록한다.

1. 카탈로그 형사 8종과 24개 반전을 구현. 원형별 300시드 balance (a) 0%, (b) ≥90%, (c) 40~65%, (d) ≥50%. (c)는 공개 정보만 사용. 원형별 10개 읽을 수 있는 샘플.
2. 같은 서비스 기반 자동 진행과 조사 후 유리/다툼/불리 전망. 원형별 일치율과 미조사 반전에 의한 역배 검증.
3. generator 전체 테스트와 npm test. 단계마다 REPORT, 마지막 RULES·REVIEW_PACKET·test-results.log 갱신.

금지: DEMO-DESIGN.md, SIGNATURE.md §1, generator 밖 수정, 커밋·병합·다음 단계. 사람 플레이테스트는 별도 대기.

## 2026-10-06 사용자 재작업 지시 (기존 구현 방식보다 우선)

- 숫자 게이트 유지. 카탈로그 8종의 인물·주신문·저항·압박·과욕·이의·판결은 원형별 직접 집필.
- catalog-facts의 장소·시각·금액·관계를 화면 문구에 연결. 공유 템플릿 대사 금지.
- 화면 문구에서 설계 문서 표시·마크다운·링크·내부 코드를 검출하는 양성/음성 회귀 추가.
- 같은 증언 문장이 원형 안에서 2회 이상 나오면 실패. 변호인은 작성 지시 대신 주장을 발화.
- 전망은 공개 정보만 사용하며 엔진 예행/재생 금지. 기존 2종 포함 10종의 전망·실제 일치표.
- ko.json에 원형별 반의사불벌·친고죄·합의 효과 구조화. index.js의 합의금 분기 제거.
- 각 원형 3시드의 공판 전문을 REPORT에 포함. 로그·임시는 generator/out/만 사용하고 generator/.gitignore로 제외.
- 커밋은 사람이 한다. 기존 Read only 및 Owns 유지. root DESIGN.md는 Read only이므로 재작업 규칙은 이 계약 기록과 RULES.md에 남긴다.
