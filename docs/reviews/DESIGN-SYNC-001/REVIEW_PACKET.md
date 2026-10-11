# DESIGN-SYNC-001 · 역량·참여 방식 인계

2026-10-11 · 문서 전용 · 기준 049926065f9d3a24a7767b14fd2e407d057ba32e
상태: 사용자 결정 기록. 독립 리뷰·게임성 검증 완료가 아니다.

## 변경

현황판 v0.6은 주인공도 역량 보유, 캐릭터의 기본 업무와 플레이어 판단의 보완, 단순 사건의 핵심 기능 검증, 상세 성장 보류를 담는다. 기존 사건 §1은 그대로다. v0.5는 첨부 초안에만 있었으므로 원격 v0.4에 최신 결정만 반영하고 미승인 상세 정책은 합의로 승격하지 않는다.

변경은 TRIAL-DESIGN, Task Contract, REPORT, 이 문서, test-results.log의 5개다. CURRENT의 BASE-OPEN-01 재개 링크는 유지하고 해당 질문의 세부 다음 작업을 현황판에서 좁혔다. DEC-017/031의 기존 역량·기록 원칙과 표시 제한을 바꾸지 않는다. 코드·사건·기존 테스트·Accepted DEC·아트·다른 PR·main은 무변경이다. 새 runtime invariant/API/fixture/성장 공식은 없다.

## 검증과 한계

컨테이너의 raw GitHub 직접 다운로드는 DNS 실패로 중단했다. 이를 조회/검증 성공으로 세지 않는다. 연결 도구로 파일·PR을 읽고, 자동 마운트된 v0.5 초안에 패치를 역적용해 로컬 v0.4를 복원했다. 해당 Git blob SHA가 실제 원격 값 6a5c8674eac3f50d6b80ade69ee6de621c0b078b와 일치함을 확인했다. 로컬 Git 초기 상태는 이 현황판만 기준으로 한 clean 문서 사본이며 전체 게임 checkout이 아니다. 사용자 PC의 변경에는 접근하지 않았다.

실행: python /mnt/data/verify_firm_capabilities.py, git diff --cached --check. 검사 범위·실제 합계는 [test-results.log](test-results.log)에 기록한다. 5개 파일의 UTF-8·링크·표·범위, 기존 사건 내용과 결정 ID의 보존, 미승인 성장/표시 경계를 검사한다. 이후 원격 compare와 blob을 대조하고 기존 head가 같을 때만 non-force 반영한다.

미실행: 게임 엔진/브라우저/Godot 회귀, 사람 플레이테스트, 법률 검수. 문서 검사가 전체 회귀·재미 PASS를 뜻하지 않으며 이전 검사 수를 재사용하지 않는다.

## 인계

기존 Draft PR #11에 한 후속 커밋을 추가하되 병합하지 않는다. CHANGELOG는 실제 병합 때 기록한다. 다음은 고정 역량 캐릭터의 기본 계획을 어떻게 보여주고 수정하게 할지 검토하는 일이며, 코딩/상세 스탯 설계의 자동 착수 승인은 아니다.

[이전 인계](https://github.com/PARK-TAEGEON/the-firm/blob/049926065f9d3a24a7767b14fd2e407d057ba32e/docs/reviews/DESIGN-SYNC-001/REVIEW_PACKET.md)와 [이전 로그](https://github.com/PARK-TAEGEON/the-firm/blob/049926065f9d3a24a7767b14fd2e407d057ba32e/docs/reviews/DESIGN-SYNC-001/test-results.log)를 이력으로 보존한다.
