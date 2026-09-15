# THE FIRM — Judge Generation, Career & Lifecycle 최소 모델

문서 ID: DEC-LITIGATION-015  
버전: v0.1 — Proposed / design review required  
상태: **Proposed / design review required**  
프로젝트: THE FIRM  
문서 유형: Design Decision  
상위 기준: [00_GAME_CONSTITUTION.md](00_GAME_CONSTITUTION.md) v0.2, [01_SYSTEM_MAP.md](01_SYSTEM_MAP.md) v0.2  
시스템 기준: [SYS-001_LITIGATION.md](SYS-001_LITIGATION.md) v0.2  
직접 Accepted 기준: [DEC-LITIGATION-013_JUDGE_INTERPRETATION_AND_JUDICIAL_PROFILE.md](DEC-LITIGATION-013_JUDGE_INTERPRETATION_AND_JUDICIAL_PROFILE.md) v0.2 Accepted  
직접 proposed/verified 기준: [DEC-LITIGATION-014_CRITERION_CHOICE_POINT_AUTHORING_AND_VALIDATION.md](DEC-LITIGATION-014_CRITERION_CHOICE_POINT_AUTHORING_AND_VALIDATION.md) v0.1 Proposed, [TEST-012_JUDGE_INTERPRETATION_AND_JUDICIAL_PROFILE.md](TEST-012_JUDGE_INTERPRETATION_AND_JUDICIAL_PROFILE.md) v0.1, [TEST-013_CRITERION_CHOICE_POINT_AUTHORING_AND_VALIDATION.md](TEST-013_CRITERION_CHOICE_POINT_AUTHORING_AND_VALIDATION.md) v0.1  
상속 참고: DEC-LITIGATION-007~012 Accepted boundaries

## 1. Purpose / boundary

이 문서는 THE FIRM 세계에서 판사가 생성되어 법관 역할에 진입하고, 배치·이동·승진·전보·특수 경로·퇴임을 거쳐 퇴임 후에도 지속되는 world identity로 남는 최소 world-simulation model을 제안한다.

```text
생성
  → 법관으로 진입
    → 특정 법원/역할에 배치
      → 경력 이동
        → 필요시 JudgeProfileVersion 변화
          → 승진/전보/특수 경로
            → 퇴임
              → 퇴임 후에도 지속되는 world identity
```

핵심 목표는 다음과 같다.

1. 신규 판사가 world lifecycle을 통해 자연스럽게 유입된다.
2. 기존 판사는 stable identity와 실제 career history를 가진 지속적 NPC다.
3. 판사별 branching career trajectory를 허용한다.
4. 모든 active judge는 resolvable profile/version과 history를 가진다.
5. Major/ordinary 차이는 존재 여부나 법적 권한이 아니라 simulation depth와 authored detail이다.
6. Retirement는 assignment eligibility 종료이지 identity/history 삭제가 아니다.
7. Post-retirement legal/world role로 이동할 future interface를 남긴다.
8. Entry/retirement와 systemic replenishment로 장기 세대교체를 유지한다.
9. Career/lifecycle 변화는 finding 또는 outcome modifier가 아니다.
10. Past decision과 당시 career/profile/version reference를 영구 보존한다.

### 1.1 Required separation

```text
World simulation
  owns judge identity / lifecycle / career / profile-version history
        ↓ publishes resolved assignment-time state
Litigation
  consumes assignment + contemporaneous JudgeProfileVersion
        ↓ only after hard evaluation and valid criterion ambiguity
JudgeInterpretationInput
        ↓
CourtFactFinding
```

Career rank, prominence, relationship, reputation, generation provenance 또는 retirement history는 fixed-record `JudgeInterpretationInput`이나 `CourtFactFinding`을 직접 변경하지 않는다.

### 1.2 Non-goals

이 문서는 다음을 하지 않는다.

- 실제 대한민국 법관 임용·전보·승진·퇴직·특별 임명 제도를 선언하지 않는다.
- Court hierarchy, assignment, recusal, panel 또는 vacancy 수치를 완성하지 않는다.
- Canonical archetype catalog, profile evolution content 또는 career probability를 확정하지 않는다.
- `LegalProfessionalProfile`, relationship graph, interaction, networking 또는 recruitment mechanics를 설계 완료하지 않는다.
- Judge AI, opponent AI, UI, Godot/GDScript, JSON, save/API schema 또는 performance model을 구현하지 않는다.
- TEST-014를 작성하거나 실행하지 않는다.

### 1.3 Decision markers

| 표식 | 의미 |
|---|---|
| **Accepted / Core Accepted** | 기존 DEC에서 이미 채택되어 이번 문서가 변경하지 않는 경계 |
| **Accepted candidate** | DEC-015 review에서 채택을 추천하는 구체 lifecycle decision |
| **Core Accepted candidate** | 구현과 수치에 관계없이 유지해야 할 핵심 semantic boundary 후보 |
| **TBD** | 실제 제도·콘텐츠·수치·validation·implementation 근거가 필요한 항목 |
| **Forbidden** | Accepted litigation boundary 또는 lifecycle 목적과 양립하지 않는 방식 |

## 2. Inherited boundaries and fixed directions

### 2.1 Accepted litigation boundaries

DEC-013에서 다음을 그대로 상속한다.

- World는 stable `judge_id`, profile history와 public judicial history를 소유한다.
- Litigation은 evaluation 당시 immutable `JudgeProfileVersion`을 참조한다.
- `JudgeArchetypeVersion + explicit individual overrides → resolved JudgeProfileVersion` chain을 유지한다.
- Profile은 party/case/outcome table이 아니다.
- Single case outcome, win/loss, specific litigant interaction 또는 one-off player encounter는 trait를 직접 mutate하지 않는다.
- Profile evolution은 explicit world-level event/rule과 새 immutable profile version을 요구한다.
- Past evaluation은 당시 profile version을 계속 참조한다.
- Win/loss, plaintiff-success, reversal statistics는 future JII modifier가 아니다.
- Profile/history/prestige는 fixed record의 fact-finding bonus가 아니다.
- Judge identity는 cases 사이에서 stable하다.

DEC-014는 현재 Proposed이며 TEST-013에서 fixture-level coherence가 확인되었다. DEC-015는 그 proposed boundary를 승격하거나 reopen하지 않고 다음 dependency를 침범하지 않는다.

- Criterion/ChoicePoint semantics는 judge lifecycle보다 우선한다.
- Career event는 `CriterionChoicePoint`를 생성하지 않는다.
- Career rank/status는 JII를 직접 생성하지 않는다.
- Career prestige는 finding/outcome modifier가 아니다.
- Hard-first, genuine ambiguity only, profile-independent activation과 bounded option effect를 유지한다.

DEC-007~012에서 allowed record only, ActualStateRecord non-interference, four canonical fact states, no inverse fact, no hidden score/RNG, historical trace와 final-adjudication separation을 상속한다.

### 2.2 Fixed project directions for DEC-015

다음은 이 문서에서 폐기할 후보가 아니라 주어진 설계 방향이다.

- Generation은 authored major judge + procedural ordinary judge의 hybrid model을 우선한다.
- Entry/retirement는 world lifecycle events로 처리하되 systemic replenishment boundary를 둔다.
- 모든 판사가 같은 basic career/lifecycle model을 사용하고 simulation resolution만 다르게 할 수 있다.
- Career는 linear promotion tree가 아니라 rotation, transfer, court-level movement, specialist/administrative role, rare appointment와 retirement가 있는 branching path다.
- Major judge는 strong tendency / constrained trajectory를 가질 수 있으나 scripted destiny는 아니다.

## 3. L1 — Judge lifecycle semantic ownership

**문제:** Identity, career, eligibility와 profile history를 어느 system이 authoritative하게 소유하는가?

| 대안 | 구조 | 실패 모드 | 판단 |
|---|---|---|---|
| A | Litigation이 판결 후 judge career를 직접 갱신 | Outcome-driven lifecycle mutation | **Forbidden** |
| B | Career/World/Litigation이 같은 mutable state를 공동 소유 | Conflicting histories, replay 불가 | 미추천 |
| C | World가 external judge identity/lifecycle/history를 소유하고 Litigation은 resolved assignment snapshot만 소비 | 책임·history 분리 | **Core Accepted candidate** |

**추천안 — L1-C:** World simulation은 `JudgeIdentity`, `JudgeCareerState`, `JudgeCareerHistory`, `JudgeAssignmentEligibility`와 `JudgeProfileVersion` history의 authoritative owner다. Career 영역은 공개 경력·평판·랜드마크 history를 index/projection할 수 있지만 외부 judge lifecycle을 독립 mutate하지 않는다. Litigation은 assignment와 evaluation-time resolved versions를 read-only로 소비하고 결과/trace를 World/Career history 후보로 돌려준다.

**상태:** **Core Accepted candidate.** Exact cross-system events/API는 **TBD**다.

**이유:** Litigation outcome이 lifecycle authority를 가지면 판결 결과와 career/profile이 feedback modifier로 순환한다.

## 4. L2 — Persistent JudgeIdentity

**문제:** Role, court와 lifecycle state가 변할 때 judge identity를 교체해야 하는가?

| 대안 | 구조 | 실패 모드 | 판단 |
|---|---|---|---|
| A | Transfer/promotion/retirement마다 새 NPC 생성 | History·relationship 단절 | **Forbidden** |
| B | Active judges만 identity를 유지하고 retired entity 삭제 | Past trace dangling reference | **Forbidden** |
| C | 생성 시 stable `judge_id`; 모든 transition에서 동일 identity/history 유지 | 지속 세계와 replay 보존 | **Core Accepted candidate** |

**추천안 — L2-C:** 모든 판사는 생성 시 stable `judge_id`를 받고 transfer, promotion, role/court-level movement, temporary inactivity, retirement, post-retirement career와 prominence change에서도 유지한다. Retirement 뒤 `judge_id`는 historical judicial-role identity로 같은 person identity에 계속 연결된다.

**상태:** **Core Accepted candidate.** Global person-ID와 role-ID의 canonical relationship은 L16/DEC-016 **TBD**다.

**이유:** 동일 인물의 경력·판결·관계·profile history를 이어야 world continuity와 과거 evaluation reference가 보존된다.

## 5. L3 — Major vs ordinary judge

**문제:** 주요 판사와 일반 판사의 차이를 어떻게 표현하면서 legal power tier를 만들지 않는가?

| 대안 | 구조 | 실패 모드 | 판단 |
|---|---|---|---|
| A | Major만 full semantics, ordinary는 random outcome | 두 종류의 fact-finding law | **Forbidden** |
| B | 모두 같은 authored depth | Authoring/scale 비용 과다 | 미추천 |
| C | 동일 semantics와 persistence, 다른 authored detail/simulation resolution | Scale과 emergent continuity 양립 | **Core Accepted candidate** |

**추천안 — L3-C:** Major judge는 authored seed/background, curated archetype/overrides, richer public content와 constrained trajectory를 가질 수 있다. Ordinary judge는 procedural identity/archetype/validated overrides, compressed career simulation과 minimal public content를 가질 수 있다. 둘 다 stable identity, current role, career/profile history, eligibility, public judicial history, retirement와 future world presence를 가진다.

Major/ordinary는 fact-finding authority, hard-rule bypass, hidden bonus 또는 history retention tier가 아니다.

**상태:** **Core Accepted candidate.** 어떤 NPC를 major로 분류하고 resolution을 얼마나 높일지는 **TBD**다.

**이유:** Simulation detail과 adjudicative semantics를 분리해야 ordinary judge를 disposable randomizer로 만들지 않는다.

## 6. L4 — Procedural judge generation

**문제:** Ordinary judge를 어떤 최소 정보로 생성하고 generation randomness를 litigation RNG와 어떻게 분리하는가?

| 대안 | 구조 | 실패 모드 | 판단 |
|---|---|---|---|
| A | Current case에 맞춰 favorable/unfavorable judge 생성 | Player-counter/outcome spawn | **Forbidden** |
| B | 이름만 생성하고 매 사건 trait 재추첨 | Identity 없는 random personality | **Forbidden** |
| C | Seeded/reproducible generation output을 persistent world state로 materialize | Variety와 stable evaluation 양립 | **Accepted candidate** |

**추천안 — L4-C:** Procedural generation은 최소 다음 semantic outputs를 만든다.

- Stable identity와 generation provenance.
- Entry context/time reference.
- Initial role와 court-level/assignment eligibility references.
- Eligible `JudgeArchetypeVersion` selection.
- Zero or bounded validated qualitative individual overrides.
- Career-background references와 public-profile baseline.
- Resolved initial `JudgeProfileVersion`.
- Initial simulation/prominence state.

Seeded randomness은 name/background, eligible archetype/override variation과 future career branch 후보를 materialize하는 데 사용할 수 있다. Materialize된 후 Litigation은 stored judge/profile/career state만 읽는다. Evaluation 중 trait 재추첨, current litigant 조건, fact-finding RNG 또는 favorable reroll은 **Forbidden**이다.

**상태:** Generation output boundary **Accepted candidate**; RNG seed strategy/generator **TBD**. Fact-finding RNG **Forbidden**.

**이유:** World variety는 필요하지만 판결 때마다 randomness를 다시 소비하면 identity와 DEC-013 determinism이 무너진다.

## 7. L5 — Archetype assignment at generation

**문제:** New judge가 어떤 `JudgeArchetypeVersion`을 받는가?

| 대안 | 구조 | 실패 모드 | 판단 |
|---|---|---|---|
| A | Current/future case outcome에 맞춰 archetype 선택 | Hidden outcome preparation | **Forbidden** |
| B | 전 pool에서 무제약 random 선택 | Context invalidity/noise | 미추천 |
| C | World/career eligibility와 content rules가 정한 pool에서 authored 또는 reproducible selection | 설명·variety·replay | **Accepted candidate** |

**추천안 — L5-C:** Major judge는 eligible authored/curated archetype version을 지정할 수 있다. Ordinary judge는 world/career context에 맞는 eligible pool에서 deterministic 또는 seeded reproducible selection을 사용한다. Selection은 generation record에 materialize하고 version을 고정한다.

Archetype은 direct outcome style이나 party preference가 아니다. `plaintiff_friendly`, `defense_friendly`, future-case counter 같은 archetype은 **Forbidden**이다.

**상태:** **Accepted candidate.** Catalog, eligibility rules와 selection distribution은 **TBD**다.

**이유:** Eligible pool과 version provenance가 있어야 authored/procedural judges 모두 같은 validated profile semantics를 사용한다.

## 8. L6 — Individual overrides

**문제:** Clone army를 막되 excessive random trait noise를 피하려면 initial overrides를 어떻게 제한하는가?

| 대안 | 구조 | 실패 모드 | 판단 |
|---|---|---|---|
| A | Override 불허 | Same-archetype clones | 미추천 |
| B | 모든 domain을 무제약 random override | Noise, conflict, hidden bias | **Forbidden** |
| C | Zero 허용 + small bounded validated domain-limited set | 개성과 일관성 균형 | **Accepted candidate** |

**추천안 — L6-C:** Zero override는 valid하다. Major judge는 curated explicit overrides를, procedural judge는 currently validated trait domains 안의 bounded overrides를 가질 수 있다. 모든 override는 origin/reason과 resolved `JudgeProfileVersion`에 materialize된다. Conflict, invalid domain, outcome/party dependency가 있으면 generation/publish를 reject한다. Safe resolved profile을 만들 수 없으면 active assignment eligibility를 부여하지 않는다.

**상태:** **Accepted candidate.** Exact count, probability, conflict precedence와 domain catalog expansion은 **TBD**다.

**이유:** 작은 explicit 차이는 individuality를 만들지만 무제약 randomness는 판사를 설명 불가능한 modifier bundle로 만든다.

## 9. L7 — Entry into judiciary / assignment pool

**문제:** Identity generation, judicial entry와 actual assignment eligibility를 한 상태로 합쳐야 하는가?

| 대안 | 구조 | 실패 모드 | 판단 |
|---|---|---|---|
| A | Generated 즉시 모든 사건에 배정 가능 | Invalid role/court assignment | 미추천 |
| B | Identity와 eligibility를 같은 mutable flag로 처리 | Career/history 의미 혼합 | 미추천 |
| C | Generation/entry/eligibility를 semantic milestones로 분리 | 명확한 lifecycle gate | **Accepted candidate** |

**추천안 — L7-C:** 최소 의미 chain은 다음과 같다.

```text
generated identity
  → entered judiciary
    → assignment eligibility evaluated
      → eligible for specified role/court context
```

Content가 candidate stage를 필요로 하지 않으면 generation과 entry가 같은 world event에서 일어날 수 있지만, identity existence와 assignment eligibility 의미는 분리한다. Temporary unavailable/inactive judge는 identity와 judicial membership/history를 유지하면서 assignment만 제한할 수 있다.

**상태:** **Accepted candidate.** Assignment algorithm, queue, vacancy matching, recusal와 availability rules는 **TBD**다.

**이유:** 존재와 배정 가능성을 분리해야 leave, role restriction, transition과 retirement를 identity deletion 없이 표현할 수 있다.

## 10. L8 — CareerState minimum model

**문제:** Active, unavailable, retired와 historical identity를 어떻게 구별하는가?

| 대안 | 구조 | 실패 모드 | 판단 |
|---|---|---|---|
| A | `active: bool` 하나 | Retirement/leave/death/history 구별 불가 | 불충분 |
| B | Exact exhaustive enum을 지금 확정 | 실제 제도/implementation 과잉 확정 | **TBD** |
| C | 최소 semantic categories와 별도 eligibility | 필요한 경계만 보존 | **Accepted candidate** |

**추천안 — L8-C:** 최소 semantic distinction은 다음과 같다.

- Pre-entry/generated identity, if represented.
- Active judiciary role.
- Temporarily inactive/unavailable for assignment.
- Retired/exited from ordinary judicial assignment.
- Deceased 또는 otherwise historical-only world identity, if world content uses it.

`active judiciary`, `assignment eligible`, `retired`와 `deleted identity`는 서로 같지 않다. Retired/historical-only state도 identity, career/profile/judicial history와 past references를 보존한다.

**상태:** Semantic distinctions **Accepted candidate**; exact enum/names/transitions **TBD**.

**이유:** Lifecycle state와 eligibility를 분리해야 world absence를 history deletion으로 처리하지 않는다.

## 11. L9 — Career movement

**문제:** Transfer, promotion, specialist role와 retirement가 언제 profile change를 의미하는가?

| 대안 | 구조 | 실패 모드 | 판단 |
|---|---|---|---|
| A | 모든 promotion/transfer가 trait를 자동 변경 | Career rank = personality mutation | **Forbidden** |
| B | Career와 profile evolution을 완전히 단절 | 장기 development 표현 불가 | 미추천 |
| C | Career event history와 profile semantic change를 별도 결정 | 이력과 interpretation 책임 분리 | **Core Accepted candidate** |

**추천안 — L9-C:** Rotation, regional transfer, court-level movement, promotion-like role change, administrative/specialist role, specialization accumulation, rare appointment, leave와 retirement는 versioned `JudgeCareerEvent`로 기록한다.

```text
transfer only
  → career history changes
  → same JudgeProfileVersion possible

career event + explicit validated evolution rule
  → new immutable JudgeProfileVersion
```

Role/court assignment change는 필요할 경우 eligibility를 갱신하지만 trait change를 자동 의미하지 않는다.

**상태:** **Core Accepted candidate.** Actual movement categories/rules와 event taxonomy는 **TBD**다.

**이유:** Career facts와 interpretive semantics를 자동 결합하면 승진/보직이 hidden legal-power stat이 된다.

## 12. L10 — Profile evolution trigger eligibility

**문제:** 어떤 world events가 profile evolution 검토를 열 수 있고 무엇은 절대 trigger가 아닌가?

| 대안 | 구조 | 실패 모드 | 판단 |
|---|---|---|---|
| A | 사건 승패/통계/기분에 따라 자동 mutation | Feedback bias와 mood RNG | **Forbidden** |
| B | 모든 장기 경력 event가 자동 mutation | 경험 stereotype | **Forbidden** |
| C | Eligible long-term event + explicit validated evolution rule | bounded authored development | **Core Accepted candidate** |

**추천안 — L10-C:** 다음은 evolution review의 input candidate가 될 수 있다.

- Substantial career-stage transition.
- Long-term specialist experience.
- Major institutional/legal reform exposure.
- Role transition.
- Explicit training/education event.
- Authored major-character development.
- Other validated long-term world event.

실제 trait change에는 event reference, applicable evolution rule, old/new immutable profile versions와 reason이 필요하다. Event가 eligible하다는 사실만으로 mutation하지 않는다.

다음은 direct trigger로 금지한다: single case outcome, player win/loss, specific litigant interaction, streak, plaintiff-success/reversal percentage, daily mood, fatigue roll, popularity, law-firm prestige.

**상태:** Trigger boundary **Core Accepted candidate**; actual event-to-trait rules **TBD**.

**이유:** Long-term development 가능성을 남기면서 result-driven personality drift를 차단한다.

## 13. L11 — Career experience vs interpretive profile

**문제:** Career history를 trait stereotype으로 자동 변환해도 되는가?

| 대안 | 구조 | 실패 모드 | 판단 |
|---|---|---|---|
| A | `10 years corporate law → fixed inference trait` | Experience-to-bias shortcut | **Forbidden** |
| B | Career history가 profile과 무관 | Development input 손실 | 미추천 |
| C | History는 justification/input candidate, change는 explicit validated rule만 | traceable evolution | **Core Accepted candidate** |

**추천안 — L11-C:** Career duration, specialization, role와 institution exposure는 profile change를 검토할 근거가 될 수 있으나 tendency key나 interpretation policy를 직접 생성하지 않는다. Explicit validated evolution rule이 exact supported domain change, applicability와 reason을 제공할 때만 새 profile version에 반영한다.

**상태:** Automatic experience-to-bias mapping **Forbidden**; explicit-rule boundary **Core Accepted candidate**.

**이유:** 경력 label만으로 legal interpretation을 정하면 실제 record/criterion과 무관한 stereotype bonus가 된다.

## 14. L12 — Major judge trajectory

**문제:** Major judge의 long-term authored arc를 destiny script 없이 어떻게 표현하는가?

| 대안 | 구조 | 실패 모드 | 판단 |
|---|---|---|---|
| A | Guaranteed destination/appointment | World conditions 무시, scripted destiny | **Forbidden** |
| B | Ordinary procedural rules에 authored direction 없음 | Major narrative identity 약화 | 미추천 |
| C | Strong tendency/constrained eligible trajectory + world gates | authored intent와 simulation 양립 | **Accepted candidate** |

**추천안 — L12-C:** `AuthoredCareerTrajectory`는 preferred/probable/constrained future direction을 표현할 수 있지만 outcome table이나 guaranteed destination이 아니다. 실제 transition은 eligibility, institutional vacancy, career history, world state/event와 authored event gate를 통과해야 한다. Permitted paths가 여러 개면 stored deterministic rule 또는 seeded world transition으로 하나가 materialize될 수 있다.

**상태:** **Accepted candidate.** Trajectory vocabulary, weighting 없는 preference representation과 event gates는 **TBD**다.

**이유:** Major character의 장기 방향을 보존하되 Living Legal World의 vacancy/eligibility/contingency를 무시하지 않는다.

## 15. L13 — Rare / special career paths

**문제:** 일반 rotation과 다른 appointment를 linear RPG ladder 없이 어떻게 표현하는가?

| 대안 | 구조 | 실패 모드 | 판단 |
|---|---|---|---|
| A | District→appellate→supreme→constitutional 고정 tree | 실제 제도 오해, power leveling | **Forbidden** |
| B | Major judge 전용 guaranteed rare path | Destiny/power tier | **Forbidden** |
| C | Explicit eligibility + vacancy/appointment/world event의 branching transition | 다양성과 기관 제약 | **Accepted candidate** |

**추천안 — L13-C:** 최고 법원급, 헌법재판 영역, 특수 법원/전문 역할, 행정·공공기관과 기타 임명 경로는 별도 branching career events가 될 수 있다. Major와 ordinary 모두 eligibility를 얻을 수 있으며 explicit appointment/world event가 실제 transition을 만든다. Rare path는 profile strength나 legal power level을 의미하지 않는다.

**상태:** Branching interface **Accepted candidate**; actual Korean institutional mapping/eligibility **TBD**.

**이유:** Special role을 level-up 보상으로 만들면 career rank와 adjudicative authority가 합쳐진다.

## 16. L14 — Retirement

**문제:** Judicial retirement가 어떤 semantic effect를 갖는가?

| 대안 | 구조 | 실패 모드 | 판단 |
|---|---|---|---|
| A | Judge entity 삭제 | Past references/history 소실 | **Forbidden** |
| B | Active flag만 끄고 history/role 경계 없음 | Post-career continuity 불명확 | 불충분 |
| C | Assignment retirement event + persistent identity/history | lifecycle continuity | **Core Accepted candidate** |

**추천안 — L14-C:** Retirement는 다음 transition이다.

```text
active judicial assignment
  → retired_from_judicial_assignment
    → post-retirement world existence
```

Retired judge는 ordinary judicial assignment pool에서 제외되지만 `judge_id`, profile/archetype version history, public judicial history, prior case trace와 professional relationships를 유지한다. Retirement는 past findings나 reasons를 변경하지 않는다.

**상태:** **Core Accepted candidate.** Retirement age/term/exception과 event mechanics는 **TBD**다.

**이유:** Retirement는 현재 eligibility 변화이지 과거 판결 주체와 world person의 소멸이 아니다.

## 17. L15 — Post-retirement career

**문제:** Retired judge가 다른 사회·법조 역할로 이동할 때 identity와 role semantics를 어떻게 보존하는가?

| 대안 | 구조 | 실패 모드 | 판단 |
|---|---|---|---|
| A | 새 lawyer/advisor NPC로 교체 | Identity/history laundering | **Forbidden** |
| B | Judicial profile을 새 role profile로 복사 | Role semantics collapse | **Forbidden** |
| C | Same person identity + historical JudgeIdentity + new role-specific reference | continuity와 역할 분리 | **Accepted candidate** |

**추천안 — L15-C:** Full retirement, law-firm advisor/lawyer, academia, arbitration/mediation, public committee/institution, political/public office, corporate board/legal advisory와 기타 authored/procedural post-career로 transition할 semantic interface를 둔다.

```text
RetiredJudgeState
  → same LegalProfessionalIdentity / PersonIdentity
    → optional new WorldRole or role-specific profile
```

새 역할은 past judicial history/profile을 mutate하거나 current lawyer/prosecutor capability로 복사하지 않는다.

**상태:** Identity-preserving interface **Accepted candidate**; individual profession mechanics **TBD**.

**이유:** Post-career continuity를 유지하면서 판사 interpretive traits와 다른 직역 역량을 혼합하지 않는다.

## 18. L16 — LegalProfessionalIdentity future interface

**문제:** 여러 법조 역할을 거치는 동일 person을 향후 DEC-016과 연결하려면 어떤 최소 상위 identity가 필요한가?

| 대안 | 구조 | 실패 모드 | 판단 |
|---|---|---|---|
| A | 역할마다 별도 unrelated NPC | Cross-career history 단절 | **Forbidden** |
| B | 하나의 universal profile에 모든 traits 결합 | Role-specific semantics collapse | **Forbidden** |
| C | Shared person/professional identity + separate role profiles | continuity와 책임 분리 | **Accepted candidate** |

**추천안 — L16-C:** Future `LegalProfessionalIdentity` interface는 stable person identity, career history, affiliations, public reputation/history, professional relationships와 interaction references를 공유할 수 있다. `JudgeProfile`, future `LawyerProfile`, `ProsecutorProfile`과 other role profiles는 별도 semantics/version histories로 연결한다.

DEC-015는 judge retirement transition이 same person identity로 새 role ref를 추가할 수 있다는 것만 정한다. Full shared profile, browsing, relationship와 interaction mechanics는 DEC-016 **TBD**다.

**상태:** Interface boundary **Accepted candidate**; full model **TBD**.

**이유:** Person continuity는 필요하지만 judge interpretation tendency를 lawyer/prosecutor 능력으로 복사해서는 안 된다.

## 19. L17 — Professional relationship network hook

**문제:** Future relationship graph를 연결하면서 favoritism modifier를 어떻게 금지하는가?

| 대안 | 구조 | 실패 모드 | 판단 |
|---|---|---|---|
| A | Friendship/familiarity가 favorable JII를 직접 부여 | Corruption-like hidden bonus | **Forbidden** |
| B | Relationship data를 전혀 보존하지 않음 | Living-world continuity 손실 | 미추천 |
| C | Stable relationship refs를 future hook으로 보존하되 litigation direct effect 없음 | 세계성·hard boundary 양립 | **Core Accepted candidate** |

**추천안 — L17-C:** `knows`, `worked_with`, `former_colleague`, `mentor`, `mentee`, `studied_with`, `professional_rival`, `organization_connection`은 possible future relationship labels다. DEC-015는 canonical list나 mechanics를 확정하지 않는다.

Relationship/familiarity는 fixed-record JII 또는 finding을 직접 변경할 수 없다. 향후 ethics, recusal, information discovery 또는 interaction effect를 도입하더라도 별도 Accepted rule과 actual changed input/event가 필요하다.

**상태:** No-direct-effect boundary **Core Accepted candidate**; graph semantics **DEC-016 TBD**.

**이유:** Relationship을 direct interpretation bonus로 쓰면 allowed record와 criterion보다 친분이 앞선다.

## 20. L18 — Public profile / observability hook

**문제:** Player가 persistent judge를 이해할 수 있게 하되 internal trait cheat sheet를 제공하지 않으려면?

| 대안 | 구조 | 실패 모드 | 판단 |
|---|---|---|---|
| A | Internal profile/trait/policy 전부 공개 | Exact攻略 table, hidden world collapse | 미추천 |
| B | 아무 경력·history도 공개하지 않음 | 설명·전략 관찰 불가 | 미추천 |
| C | Public career/history + observable decisions + discovered relations의 player-observed projection | 정보 불확실성과 설명 양립 | **Accepted candidate** |

**추천안 — L18-C:** Public career history와 observable judicial decisions가 존재하며 internal profile과 player-observed profile을 분리할 수 있다. Player-facing view는 실제 공개/발견 가능한 history에서 파생되고 inaccessible trait key나 private data를 자동 노출하지 않는다.

**상태:** Separation/interface **Accepted candidate**; disclosure, inference quality, uncertainty와 UI는 **DEC-016 TBD**.

**이유:** 관찰 가능한 경력은 전략 정보가 될 수 있지만 internal mapping 전체 공개는 판사를 deterministic answer key로 만든다.

## 21. L19 — Ordinary → prominent transition

**문제:** Procedural ordinary judge가 emergent major character가 될 때 새 NPC로 교체해야 하는가?

| 대안 | 구조 | 실패 모드 | 판단 |
|---|---|---|---|
| A | Authored major replacement NPC 생성 | Existing history/relationship 소실 | **Forbidden** |
| B | Ordinary는 영구 compressed/disposable | Emergent character 손실 | 미추천 |
| C | Same identity/history에서 prominence와 simulation resolution만 상승 | Emergent continuity | **Core Accepted candidate** |

**추천안 — L19-C:** Repeated notable interactions/history 또는 world relevance가 높아지면 `JudgeProminenceState`와 authored/simulation resolution을 높일 수 있다. `judge_id`, career history, old profile versions, judicial history와 relationship refs는 그대로 유지한다. New detail은 existing history와 모순되지 않아야 한다.

Prominence는 legal authority, favorable/unfavorable weight, profile strength 또는 assignment immunity가 아니다.

**상태:** **Core Accepted candidate.** Prominence thresholds, demotion과 authoring workflow는 **TBD**다.

**이유:** Simulation resolution만 승격해야 procedural world에서 발생한 인물이 진짜 지속 NPC가 된다.

## 22. L20 — Retirement / entry population balance

**문제:** 장기 simulation에서 judge population 고갈·과잉을 막으면서 result-balancing spawn을 피하려면?

| 대안 | 구조 | 실패 모드 | 판단 |
|---|---|---|---|
| A | Current case difficulty에 맞춰 judge spawn/retire | Player-counter balancing | **Forbidden** |
| B | Entry/retirement를 무제약 독립 처리 | Court capacity 고갈/무한 증가 | 미추천 |
| C | Expected institutional capacity와 observed vacancy/lifecycle exit 기반 replenishment | 세대교체와 기관 지속 | **Accepted candidate** |

**추천안 — L20-C:** World-level population maintenance는 expected judicial capacity, existing eligible population, vacancies, planned entry와 lifecycle exits를 관찰해 eligible new-entry generation을 요청할 수 있다. Replenishment는 current/future party, case difficulty, desired result, win-rate target 또는 profile composition 목표를 참조하지 않는다.

Emergency minimum capacity boundary가 필요할 수 있으나 생성된 judge도 L4~L7의 identity/profile/eligibility validation을 모두 통과해야 한다.

**상태:** Non-interference/capacity boundary **Accepted candidate**; staffing numbers, demographics와 cadence **TBD**.

**이유:** 법원 세계의 지속성은 필요하지만 population controller가 hidden difficulty director가 되어서는 안 된다.

## 23. L21 — Determinism / procedural variety

**문제:** Generation/career randomness를 어디까지 허용하면서 litigation determinism을 지키는가?

| 대안 | 구조 | 실패 모드 | 판단 |
|---|---|---|---|
| A | 모든 lifecycle을 완전 scripted | Variety/emergence 제한 | 가능하지만 기본 hybrid 방향으로 부족 |
| B | Evaluation 때 career/profile random roll | Same state에서 다른 finding | **Forbidden** |
| C | World transition에서 seeded variety를 materialize하고 Litigation은 fixed state 소비 | Variety와 replay 양립 | **Core Accepted candidate** |

**추천안 — L21-C:** Potentially permissible randomness는 identity/name/background generation, eligible archetype selection, career branching과 timing variation이다. 각 결과는 world event/record/version으로 저장된 뒤에만 Litigation input이 된다.

다음은 금지한다.

- Fact-finding/case-result RNG.
- Current litigant에 따른 trait reroll.
- Assignment 후 favorable/unfavorable judge reroll.
- Evaluation 안의 random personality effect 또는 tie-break.

같은 saved world state, assignment, profile/criterion/record inputs와 command sequence에서는 같은 evaluation semantics가 나와야 한다.

**상태:** Materialize-before-litigation boundary **Core Accepted candidate**; seed ownership/replay tooling **TBD**.

**이유:** Random generation output을 persisted cause로 바꾸면 world variety가 판결 순간의 hidden chance가 되지 않는다.

## 24. L22 — Historical preservation

**문제:** Promotion, profile evolution, retirement와 post-career 이후 과거 decision을 어떤 references로 보존하는가?

| 대안 | 구조 | 실패 모드 | 판단 |
|---|---|---|---|
| A | Current career/profile로 과거 finding 재계산 | Historical rewrite | **Forbidden** |
| B | Final status만 저장 | Explanation/replay 불가 | 불충분 |
| C | Contemporaneous identity/career/assignment/profile/criterion/trace refs 보존 | Audit와 continuity | **Core Accepted candidate** |

**추천안 — L22-C:** Past evaluation은 최소 다음 contemporaneous references를 유지한다.

- `judge_id`와 career state at evaluation time.
- Court/role assignment.
- `JudgeProfileVersion`, `JudgeArchetypeVersion`와 relevant overrides.
- Applicable criterion/version과 JII/choice-point refs.
- Public decision history reference와 actual derivation trace.

Promotion, transfer, retirement, post-career 또는 later profile version은 이 references와 past finding/reason을 rewrite하지 않는다.

**상태:** **Core Accepted candidate.** Canonical persistence/save/migration schema는 **TBD**다.

**이유:** 현재 인물 상태와 당시 판단 입력을 분리해야 과거 판결을 재현하고 설명할 수 있다.

## 25. Major vs ordinary simulation model

| dimension | major judge | ordinary judge |
|---|---|---|
| identity | authored identity/seed | procedural identity |
| profile | curated eligible archetype/overrides | generated validated archetype/overrides |
| career | strong authored tendency + world constraints | procedural world rules |
| simulation resolution | high | compressed, upgradable |
| public content | rich authored/curated | generated/minimal, expandable |
| relationships | richer authored links possible | procedural network refs |
| historical persistence | full | full |
| lifecycle states/eligibility | shared model | shared model |
| litigation semantics | identical | identical |

> **Major/ordinary distinction controls content and simulation resolution, not adjudicative authority.**

양쪽 모두 DEC-013의 hard-first, criterion-declared ambiguity, explicit JII, deterministic evaluation과 no-direct-profile-effect를 따른다. Ordinary compressed simulation도 random finding이나 disposable identity를 허용하지 않는다.

## 26. Lifecycle reference model

```text
LegalProfessionalIdentity / PersonIdentity
    ↓
JudgeGenerationRecord
    ↓
JudicialEntry
    ↓
JudgeIdentity active
    ↓
JudgeArchetypeVersion
  + individual overrides
    ↓
JudgeProfileVersion
    ↓
JudgeCareerEvent history
    ├─ transfer
    ├─ rotation
    ├─ role change
    ├─ special appointment
    ├─ profile-neutral career event
    ├─ profile-evolution event → new immutable profile version
    └─ retirement
          ↓
RetiredJudgeState
    ↓
optional PostJudicialCareer / WorldRole
```

이 모델은 semantic reference이며 canonical class, enum, JSON, API 또는 save schema가 아니다. `LegalProfessionalIdentity`의 full ownership과 multi-role mechanics는 DEC-016으로 넘긴다.

## 27. Semantic reference structures

| structure | 최소 semantic information | ownership | forbidden responsibility |
|---|---|---|---|
| `JudgeIdentity` | Stable `judge_id`, person identity ref, generation/entry refs, current career/profile refs | World | Case별 replacement, finding/status 저장 |
| `JudgeGenerationRecord` | Authored/procedural provenance, materialized seed/result refs, initial context/archetype/override/profile refs | World generation | Current case/party/outcome 기반 생성 |
| `JudgeCareerState` | Current lifecycle/role context와 effective state reason | World | Past history 덮어쓰기, profile trait 직접 변경 |
| `JudgeCareerEvent` | Immutable event ID/type/time/context, before/after career refs, reason | World | Finding outcome modifier, automatic profile mutation |
| `JudgeCareerHistory` | Ordered immutable career-event refs, role/court history | World; Career may project | Win-rate에서 events/traits 소급 생성 |
| `JudgeAssignmentEligibility` | Effective context, eligible/ineligible boundary, reason/version | World/court assignment boundary | Fact outcome preference 또는 JII 선택 |
| `JudgeArchetypeVersion` | Immutable validated baseline traits and provenance | DEC-013 profile domain / World ref | Direct outcome style, party bias |
| `JudgeProfileVersion` | Immutable resolved archetype + overrides, applicability/reason refs | World profile history | Runtime mood, case result table, retroactive mutation |
| `JudgeProfileEvolutionEvent` | Eligible world event, validated rule, old/new profile refs, explicit reason | World | Single result/statistics-based mutation |
| `JudgeProminenceState` | Current content/simulation resolution and reason/history refs | World/presentation simulation | Legal authority/profile strength modifier |
| `JudgeRetirementRecord` | Retirement event/time/reason, ended eligibility, retained identity/history refs | World | Entity/history deletion, past decision rewrite |
| `PostJudicialCareerRef` | Same-person link to new WorldRole/organization/role profile and effective history | World; future role system | Judge traits를 새 role capability로 복사 |
| `LegalProfessionalIdentity` future interface | Stable person identity, cross-role career/affiliation/public-history refs | Future DEC-016/shared identity boundary | Universal merged role profile |
| `ProfessionalRelationshipRef` future interface | Person refs, relationship provenance/history/disclosure boundary | Future DEC-016 | Fixed-record JII/finding direct modifier |

Exact fields, IDs, enum, state machine, event bus, persistence와 API는 **TBD**다.

## 28. Hard invariants

| # | invariant | proposed status | note |
|---:|---|---|---|
| 1 | Every judge has stable identity | **Core Accepted candidate** | Lifecycle/prominence transition에서 교체 금지 |
| 2 | Major/ordinary is simulation resolution, not legal authority | **Core Accepted candidate** | Same litigation semantics |
| 3 | Every active/eligible judge has resolvable profile version | **Core Accepted candidate** | Invalid unresolved profile은 assignment 불가 |
| 4 | Procedural generation cannot encode party/outcome preference | **Core Accepted candidate** | Player-counter spawn 금지 |
| 5 | Generated randomness is materialized before litigation | **Core Accepted candidate** | Stored world state만 evaluation input |
| 6 | No fact-finding RNG | **Core Accepted** inherited | Career RNG와 엄격 분리 |
| 7 | Career event does not automatically equal profile mutation | **Core Accepted candidate** | Same profile version 가능 |
| 8 | Profile evolution requires explicit validated event/rule | **Core Accepted candidate** | New immutable version |
| 9 | Single case outcomes cannot directly mutate profile | **Core Accepted** inherited | One-off encounter 포함 |
| 10 | Win/loss statistics cannot directly mutate profile | **Core Accepted** inherited | Success/reversal rate 포함 |
| 11 | Transfer/promotion does not rewrite past decisions | **Core Accepted candidate** | Contemporaneous refs 유지 |
| 12 | Retirement removes eligibility, not identity/history | **Core Accepted candidate** | Retired entity persists |
| 13 | Post-retirement role preserves person identity | **Accepted candidate** | Role profile remains separate |
| 14 | Historical profile versions remain immutable | **Core Accepted** inherited | Retroactive rewrite 금지 |
| 15 | Ordinary judge may become prominent without replacement | **Core Accepted candidate** | Resolution change only |
| 16 | Relationship/reputation cannot directly change fixed-record JII/finding | **Core Accepted candidate** | DEC-016 guardrail |
| 17 | Replenishment cannot be result-balancing spawn logic | **Core Accepted candidate** | Capacity only |
| 18 | Special paths require explicit eligibility/event semantics | **Accepted candidate** | Actual process TBD |
| 19 | Major trajectory is tendency, not guaranteed destiny | **Accepted candidate** | World conditions remain operative |
| 20 | Litigation consumes current resolved state, not career RNG | **Core Accepted candidate** | No evaluation reroll |
| 21 | Past evaluation retains contemporaneous career/profile refs | **Core Accepted candidate** | Replay/explanation |
| 22 | Future shared identity does not collapse role-specific semantics | **Core Accepted candidate** | Judge traits not copied |

## 29. Pressure-test examples

모든 예시는 synthetic world fixtures이며 실제 대한민국 인사제도를 진술하지 않는다.

### Example 1 — Ordinary procedural new judge

**Input:** Eligible vacancy event creates procedural identity `J-O1`, selects eligible `AR-O1/v1`, zero or bounded valid override, materializes `JP-O1/v1`.  
**May evaluate:** Generation provenance, identity/profile resolution, entry/eligibility gates.  
**Must not happen:** Party/outcome preference, current-case counter, hidden legal-power roll.  
**Expected:** Stable ordinary judge with career/history/profile/eligibility and stored generation result.

### Example 2 — Authored major judge

**Input:** Authored identity `J-M2`, curated background/archetype/override and constrained career tendency.  
**May evaluate:** Eligibility, validation, profile materialization와 prominence.  
**Must not happen:** Hard-rule bypass, guaranteed appointment 또는 stronger fact-finding authority.  
**Expected:** Major detail with the same litigation semantics as ordinary judges.

### Example 3 — Major trajectory blocked

**Input:** `J-M3` prefers a rare appointment but lacks current eligibility or vacancy.  
**May evaluate:** World/institutional gates and remaining valid branches.  
**Must not happen:** Destiny lock forcing appointment or deleting judge.  
**Expected:** Preferred path does not occur; another valid career path, continued role 또는 later retry remains possible.

### Example 4 — Ordinary judge rises

**Input:** `J-O4` accumulates long career and notable public history; prominence event raises simulation resolution.  
**May evaluate:** Prominence/content transition.  
**Must not happen:** Replacement NPC, new judge_id, retroactive authored history 또는 legal bonus.  
**Expected:** Same identity, career, old profile versions, decisions and relationships; richer future simulation.

### Example 5 — Routine transfer

**Input:** `J-5` transfers court/region; no validated profile-evolution rule applies.  
**May evaluate:** Career event, assignment/eligibility update.  
**Must not happen:** Automatic interpretive trait mutation or past-decision rewrite.  
**Expected:** Career history changes; same `JudgeProfileVersion` may remain.

### Example 6 — Valid profile evolution

**Input:** Long-term specialist/role event plus explicit validated evolution rule applies to `JP-6/v1`.  
**May evaluate:** Event eligibility, rule, reason and old/new version refs.  
**Must not happen:** In-place mutation or result-stat shortcut.  
**Expected:** New immutable `JP-6/v2`; past evaluations retain v1.

### Example 7 — Outcome-driven mutation attack

**Input:** Player wins three cases before `J-7`; author attempts `judge becomes stricter`.  
**May evaluate:** Trigger eligibility only.  
**Must not happen:** Win streak creates trait/version or current-player counter.  
**Expected:** Invalid; no profile mutation.

### Example 8 — Retirement

**Input:** Active `J-8` receives retirement world event.  
**May evaluate:** Career state and assignment eligibility transition.  
**Must not happen:** Identity/profile/history/trace deletion.  
**Expected:** Removed from ordinary assignment pool; persistent retired identity and full history.

### Example 9 — Retired judge becomes law-firm advisor

**Input:** Retired `J-9` obtains `PostJudicialCareerRef=advisor`.  
**May evaluate:** Same-person role transition and affiliation history.  
**Must not happen:** New replacement person, past judgment rewrite, judge traits copied as lawyer skills.  
**Expected:** Stable person/judge history plus separate future advisor-role semantics.

### Example 10 — Judge population replenishment

**Input:** Multiple retirements create capacity vacancies; World requests eligible entrants.  
**May evaluate:** Capacity, vacancy, generation/entry/eligibility.  
**Must not happen:** Current litigation difficulty, parties or desired win-rate influence composition.  
**Expected:** Valid new identities replenish capacity independently of case results.

### Example 11 — Player-counter spawn attack

**Input:** A difficult player case triggers request for an unfavorable archetype judge.  
**May evaluate:** Generation request provenance.  
**Must not happen:** Spawn, transfer 또는 assignment designed to counter current litigant.  
**Expected:** Forbidden request; no judge generated from it.

### Example 12 — World RNG vs fact RNG

**Input:** Seeded world transition selects one eligible career branch, then a later case uses stored judge/profile state. A competing fixture requests a courtroom random finding roll.  
**May evaluate:** Timing and ownership of randomness.  
**Must not happen:** Evaluation rerolls profile, trait, interpretation 또는 fact status.  
**Expected:** World branch RNG potentially permissible when materialized; courtroom fact RNG forbidden.

### Example 13 — Special career path

**Input:** Ordinary or major `J-13` satisfies explicit rare-path eligibility and an appointment/vacancy event occurs.  
**May evaluate:** Eligibility, institutional state, event and career transition.  
**Must not happen:** Linear level-up, guaranteed major-only destination 또는 legal-power increase.  
**Expected:** Branching transition candidate; actual Korean appointment correctness remains TBD.

### Example 14 — Historical replay after retirement

**Input:** Past case evaluated by `J-14`, `JP-14/v2`; judge later retires and current profile/history evolves elsewhere.  
**May evaluate:** Stored contemporaneous refs and semantic replay.  
**Must not happen:** Current retired state/profile substituted into past evaluation.  
**Expected:** Old assignment/career/profile/archetype/criterion/JII trace remains intact.

### Example 15 — Relationship favoritism attack

**Input:** Friendly lawyer relationship metadata attempts to choose favorable JII option.  
**May evaluate:** Forbidden direct-effect boundary.  
**Must not happen:** Relationship activates choice point, changes mapping 또는 adds score.  
**Expected:** Forbidden; fixed-record JII/finding unchanged.

### Example 16 — Ordinary judge promoted to major prominence

**Input:** Procedural `J-16` becomes narratively important; content resolution changes from compressed to high.  
**May evaluate:** Prominence state and new public/authored content consistency.  
**Must not happen:** judge_id/profile history replacement, power upgrade 또는 different litigation rules.  
**Expected:** Same persistent NPC with richer simulation and unchanged legal semantics.

## 30. Explicit TBD list

1. Actual Korean judicial appointment, entry, rotation, transfer, promotion and retirement rules.
2. Exact court hierarchy and role mapping.
3. Supreme/constitutional/special appointment processes.
4. Judge staffing numbers, expected capacity and vacancy cadence.
5. Retirement ages, terms, exceptions and death/historical-only handling.
6. Demographic generation and name/background generator.
7. Judge archetype catalog and eligibility pools.
8. Individual override limits, distributions and conflict validation.
9. Career event probability, timing, dependency and authored content.
10. Procedural RNG seed ownership/strategy and replay tooling.
11. Assignment algorithm, workload, temporary availability and matching.
12. Recusal, reassignment and panel composition.
13. Exact prominence thresholds, decrease and authoring workflow.
14. Post-retirement occupation systems and organization transitions.
15. Full `LegalProfessionalProfile` / shared identity architecture.
16. Professional relationship graph semantics and provenance.
17. Interaction, repeated encounter and relationship discovery systems.
18. Public/private/inferred information disclosure and uncertainty.
19. Networking UI, career/profile browsing and information quality.
20. Recruitment, lobbying, ethics, conflict-of-interest and advisory mechanics.
21. Corruption, bias, discipline and unlawful influence systems.
22. Canonical class/schema/API/save/migration.
23. Godot implementation and performance.
24. Actual profile-evolution rules and trait content.

실제 제도와 상세 시스템을 추측해 위 TBD를 닫지 않는다.

## 31. Risks / anti-patterns

| risk / anti-pattern | failure condition | mitigation direction |
|---|---|---|
| Generated judges become clones | Same archetype/background/history 반복 | L4~L6 bounded generated identity/override; exact diversity TBD |
| Excessive random personality noise | Many random overrides with no reason | Small validated set, materialized provenance, conflict rejection |
| Major NPC destiny scripting | Authored destination ignores eligibility/world | L12 constrained tendency + world gates |
| Ordinary NPC disposable identity | Transfer/retirement/prominence creates replacement | L2/L19 stable identity and full history |
| Career rank becomes legal-power stat | Higher court/promotion adds fact bonus | L9 separation; same litigation semantics |
| Promotion automatically changes interpretation | Every role change creates traits | Explicit validated evolution rule only |
| Outcome-driven profile evolution | Case wins/losses or player interaction mutate profile | L10 inherited prohibition |
| World statistics mutate judge traits | Success/reversal rates feed tendencies | Statistics observational only; direct input forbidden |
| Retirement deletes historical references | Entity removal breaks past cases | L14/L22 persistent retired identity and refs |
| Retired judge loses identity on profession change | Advisor/lawyer generated as new person | L15/L16 same-person role transition |
| Replenishment becomes difficulty balancing | Spawn/retire based on case challenge | L20 capacity/vacancy-only inputs |
| Player-counter judge spawning | Archetype chosen against current litigant | Generation provenance validation and rejection |
| Relationship becomes favoritism modifier | Friendly lawyer changes JII/finding | L17 no-direct-effect guardrail |
| Profile UI becomes exact攻略 table | Internal traits/mappings fully exposed | L18 public/observed/internal separation |
| Career simulation becomes personnel-management game | Excessive detail for every ordinary judge | Shared semantics with compressed resolution |
| Procedural simulation loses emergent characters | Ordinary history discarded before promotion | L19 resolution upgrade on same identity |
| Major/ordinary leaks into authority | Major bypasses hard rules; ordinary uses RNG | L3 identical litigation semantics invariant |
| Career randomness leaks into trial | Evaluation consumes new roll instead of state | L21 materialize-before-litigation |
| Profile evolution erases provenance | Current version replaces past refs | Immutable version history and L22 trace |

## 32. DEC-016 handoff

추천 후속 문서:

`DEC-LITIGATION-016_LEGAL_PROFESSIONAL_PROFILE_RELATIONSHIP_AND_INTERACTION.md`

DEC-016 후보 범위:

- Shared `LegalProfessionalIdentity`.
- Lawyer, prosecutor, retired judge와 other legal-role profiles.
- Career/profile browsing.
- Public vs inferred vs hidden information.
- Professional relationship graph.
- Mentorship, colleague, rivalry와 affiliation.
- Networking interactions와 repeated encounters.
- Post-retirement recruitment/advisory relationship.
- Player-observed profile.
- Relationship discovery와 information quality/uncertainty.

DEC-015가 넘기는 hard guardrail:

> **Relationship, familiarity, prestige or reputation cannot directly modify a fixed-record `JudgeInterpretationInput` or `CourtFactFinding`.**

DEC-015는 identity-preserving role transition과 relationship/public-observability hooks만 연다. Full interaction, recruitment, ethics, discovery, disclosure와 UI mechanics는 DEC-016 **TBD**다.

## 33. Proposed first-pass TEST-014 plan

`TEST-014_JUDGE_GENERATION_CAREER_AND_LIFECYCLE.md`는 이 문서에서 만들지 않는다. First pass는 **15 core cases**의 manual / fixture-level verification으로 제안한다.

| # | core case | 검증할 boundary |
|---:|---|---|
| 1 | Ordinary procedural judge generation | Stable identity, eligible archetype/override, materialized JP-v1 |
| 2 | Major authored judge generation | Authored detail without destiny/power tier |
| 3 | Major trajectory blocked / alternate career | Eligibility/world gate and valid alternate branch |
| 4 | Ordinary-to-prominent continuity | Same identity/history, resolution-only change |
| 5 | Transfer without profile mutation | Career event separated from profile version |
| 6 | Valid explicit profile evolution | Eligible event + validated rule → new immutable version |
| 7 | Outcome/stat-driven mutation rejection | Single results/streak/statistics cannot mutate profile |
| 8 | Retirement + historical preservation | Eligibility ends; identity/history/trace persists |
| 9 | Post-retirement role continuity | Same person, separate new role semantics |
| 10 | Population replenishment non-interference | Capacity/vacancy entry independent of litigation outcome |
| 11 | Player-counter spawn rejection | No case/party/difficulty-driven archetype generation |
| 12 | World RNG vs litigation RNG boundary | Materialized seeded variety allowed; fact RNG forbidden |
| 13 | Rare appointment path | Explicit eligibility/event, no linear RPG ladder |
| 14 | Historical replay after retirement | Contemporaneous assignment/profile/criterion refs preserved |
| 15 | Relationship favoritism attack | Fixed-record JII/finding unchanged by relationship metadata |

TEST-014는 actual Korean judicial systems, staffing/demographics, assignment, full relationship/interaction, generator quality, RNG implementation, canonical schema/save, UI, performance 또는 fact/adjudication engine을 검증 완료로 주장해서는 안 된다.

## 34. Decision summary

### 34.1 Inherited Accepted

| ID | Decision | Status |
|---|---|---|
| I1 | Stable judge identity/profile history; Litigation consumes contemporaneous immutable profile | **Core Accepted** |
| I2 | Profile is not outcome table; hard-first/criterion ambiguity/JII boundary remains | **Core Accepted** |
| I3 | Single outcome, interaction and win/loss statistics cannot directly mutate profile | **Core Accepted** |
| I4 | No prestige/reputation bonus, fact-finding RNG, history rewrite or role-based hard-rule bypass | **Core Accepted** |
| I5 | DEC-014 proposed choice-point semantics remain upstream and are not altered here | **Preserved proposed/verified boundary** |

### 34.2 Core Accepted candidates

| ID | Decision | Status |
|---|---|---|
| L1 | World owns judge lifecycle/history; Litigation consumes resolved assignment state | **Core Accepted candidate** |
| L2 | Stable judge identity persists through all lifecycle transitions | **Core Accepted candidate** |
| L3 | Major/ordinary differs only in detail/resolution, never legal authority | **Core Accepted candidate** |
| L9 | Career event and profile semantic change are separate | **Core Accepted candidate** |
| L10 | Profile evolution requires eligible event + explicit validated rule | **Core Accepted candidate** |
| L11 | Career experience never maps automatically to interpretive trait | **Core Accepted candidate** |
| L14 | Retirement removes assignment eligibility, not identity/history | **Core Accepted candidate** |
| L17 | Relationship data has no direct fixed-record JII/finding effect | **Core Accepted candidate** |
| L19 | Ordinary judge may become prominent without identity replacement | **Core Accepted candidate** |
| L21 | Procedural randomness materializes before Litigation; no fact RNG | **Core Accepted candidate** |
| L22 | Past evaluation keeps contemporaneous career/profile/criterion trace | **Core Accepted candidate** |

### 34.3 Accepted candidates

| ID | Decision | Status |
|---|---|---|
| L4 | Procedural generation creates persistent validated semantic outputs | **Accepted candidate** |
| L5 | Archetype comes from eligible context-bound pool and is versioned | **Accepted candidate** |
| L6 | Zero or bounded validated individual overrides | **Accepted candidate** |
| L7 | Generated identity, judicial entry and assignment eligibility are distinct | **Accepted candidate** |
| L8 | Active/inactive/retired/historical identity distinctions with separate eligibility | **Accepted candidate** |
| L12 | Major trajectory is strong constrained tendency, not destiny | **Accepted candidate** |
| L13 | Rare paths require explicit eligibility/appointment/world event | **Accepted candidate** |
| L15 | Post-retirement role transitions preserve person identity and separate profiles | **Accepted candidate** |
| L16 | Future shared LegalProfessionalIdentity with role-specific profiles | **Accepted candidate** |
| L18 | Public/observed/internal profile information may be separated | **Accepted candidate** |
| L20 | Vacancy/capacity-based systemic replenishment independent of case results | **Accepted candidate** |

### 34.4 TBD summary

Actual judicial rules/hierarchy/appointments, staffing/demographics, names/backgrounds, archetype catalog, override limits, career probabilities/timing, seed strategy, assignment/recusal/panels, prominence thresholds, post-career mechanics, DEC-016 identity/relationships/interactions/disclosure, ethics/corruption, canonical schema/API/save/migration, Godot와 performance는 **TBD**다.

### 34.5 Forbidden summary

- Major judge destiny lock 또는 legal-power advantage.
- Ordinary judge random fact result, disposable identity 또는 deletable history.
- Plaintiff/defendant-friendly, case-specific, player-counter 또는 desired-outcome generation.
- Evaluation-time profile/trait reroll, mood/personality/fact-finding RNG.
- Promotion/transfer/rank의 automatic profile mutation이나 factual bonus.
- Single outcome, streak, litigant interaction, success/reversal statistics의 trait mutation.
- Retirement deletion, past-decision rewrite 또는 role-change identity replacement.
- Judge traits를 lawyer/prosecutor/advisor ability로 직접 복사.
- Relationship/familiarity/prestige/reputation의 fixed-record JII/finding modifier.
- Replenishment를 difficulty/win-rate balancing director로 사용.

## 35. Decision history

| 버전 | 상태 | 내용 |
|---|---|---|
| v0.1 | Proposed / design review required | Hybrid major/ordinary generation, persistent identity, World-owned lifecycle, materialized procedural variety, branching career, career/profile separation, explicit profile evolution, constrained major trajectory, rare paths, retirement/post-career continuity, population replenishment, prominence transition, DEC-016 identity/relationship hooks와 immutable historical trace를 L1~L22로 제안. Actual Korean judicial rules, staffing/assignment, catalogs/probabilities, relationship/interaction, schema/API/Godot/save/performance는 TBD. TEST-014 15-case plan만 제안하고 생성·실행하지 않음. |
