# THE FIRM — TEST-023 Case Theory and Evidence Synthesis

문서 ID: TEST-023  \\  
버전: v0.2 — Accepted / manual fixture-level verification  \\
상태: **Accepted / manual fixture-level verification**  \\
대상: `DEC-LITIGATION-024_CASE_THEORY_AND_EVIDENCE_SYNTHESIS.md` v0.2 Accepted

## 1. Purpose

DEC-024 CaseTheory/EvidenceSynthesis semantics를 synthetic fixture에 수동 적용한다. implementation test나 실제 한국 법률 실무 검증이 아니다. Observed는 DEC semantics의 manual fixture application이다.

```text
Evidence / Statement / Assertion ≠ ProfessionalAnalysis ≠ EvidenceSynthesis ≠ CaseTheory
CaseTheory ≠ StrategicNarrative ≠ Argument ≠ CourtRecord ≠ CourtFactFinding
CaseTheory selected ≠ CaseTheory true
EvidenceSynthesis ≠ fact resolution
Strategic priority ≠ epistemic certainty
```

## 2. Verdict rules

PASS는 DEC-024 경계가 fixture 결과를 결정하고 inherited DEC와 모순 없음, PARTIAL은 semantic ambiguity, FAIL은 hidden-state/truth/court/history collapse가 실제 발생한 경우다. TBD인 algorithm, reliability, credibility, UI, AI, schema, procedure만으로 PARTIAL을 주지 않는다.

## 3. Manual application rules

authorized Case File의 typed refs만 사용한다. ActualStateRecord와 hidden legal model은 입력이 아니다. 수치 확률·신뢰도·정답을 발명하지 않는다.

## 4. Core cases (1–56)

### Case 1 — Basic CaseTheory creation
**Purpose**  DEC-024의 해당 경계를 synthetic fixture에 적용한다.  
**Fixture**  Case File refs, Issue/branch 및 해당 관계가 명시된 fixture  
**Manual verification**  authorized refs, provenance, typed relation, history와 금지된 truth/court 승격을 확인한다.  
**Expected**  해당 relation/state는 truth로 승격되지 않고 provenance와 대안이 보존된다.  
**Observed**  Expected와 같이 CaseTheory/EvidenceSynthesis가 candidate/strategy로만 기록되고 hidden input은 소비되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact schema, algorithm, reliability/credibility/independence, UI와 downstream procedure는 NOT TESTED / TBD.

### Case 2 — Insufficient information / no theory
**Purpose**  DEC-024의 해당 경계를 synthetic fixture에 적용한다.  
**Fixture**  Case File refs, Issue/branch 및 해당 관계가 명시된 fixture  
**Manual verification**  authorized refs, provenance, typed relation, history와 금지된 truth/court 승격을 확인한다.  
**Expected**  no-theory/incomplete state가 유효하다.  
**Observed**  Expected와 같이 CaseTheory/EvidenceSynthesis가 candidate/strategy로만 기록되고 hidden input은 소비되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact schema, algorithm, reliability/credibility/independence, UI와 downstream procedure는 NOT TESTED / TBD.

### Case 3 — Theory based on SourceAssertions
**Purpose**  DEC-024의 해당 경계를 synthetic fixture에 적용한다.  
**Fixture**  Case File refs, Issue/branch 및 해당 관계가 명시된 fixture  
**Manual verification**  authorized refs, provenance, typed relation, history와 금지된 truth/court 승격을 확인한다.  
**Expected**  해당 relation/state는 truth로 승격되지 않고 provenance와 대안이 보존된다.  
**Observed**  Expected와 같이 CaseTheory/EvidenceSynthesis가 candidate/strategy로만 기록되고 hidden input은 소비되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact schema, algorithm, reliability/credibility/independence, UI와 downstream procedure는 NOT TESTED / TBD.

### Case 4 — Theory based on Statements
**Purpose**  DEC-024의 해당 경계를 synthetic fixture에 적용한다.  
**Fixture**  Case File refs, Issue/branch 및 해당 관계가 명시된 fixture  
**Manual verification**  authorized refs, provenance, typed relation, history와 금지된 truth/court 승격을 확인한다.  
**Expected**  해당 relation/state는 truth로 승격되지 않고 provenance와 대안이 보존된다.  
**Observed**  Expected와 같이 CaseTheory/EvidenceSynthesis가 candidate/strategy로만 기록되고 hidden input은 소비되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact schema, algorithm, reliability/credibility/independence, UI와 downstream procedure는 NOT TESTED / TBD.

### Case 5 — Theory based on ProfessionalAnalysis
**Purpose**  DEC-024의 해당 경계를 synthetic fixture에 적용한다.  
**Fixture**  Case File refs, Issue/branch 및 해당 관계가 명시된 fixture  
**Manual verification**  authorized refs, provenance, typed relation, history와 금지된 truth/court 승격을 확인한다.  
**Expected**  해당 relation/state는 truth로 승격되지 않고 provenance와 대안이 보존된다.  
**Observed**  Expected와 같이 CaseTheory/EvidenceSynthesis가 candidate/strategy로만 기록되고 hidden input은 소비되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact schema, algorithm, reliability/credibility/independence, UI와 downstream procedure는 NOT TESTED / TBD.

### Case 6 — Theory based on RuleStatements
**Purpose**  DEC-024의 해당 경계를 synthetic fixture에 적용한다.  
**Fixture**  Case File refs, Issue/branch 및 해당 관계가 명시된 fixture  
**Manual verification**  authorized refs, provenance, typed relation, history와 금지된 truth/court 승격을 확인한다.  
**Expected**  해당 relation/state는 truth로 승격되지 않고 provenance와 대안이 보존된다.  
**Observed**  Expected와 같이 CaseTheory/EvidenceSynthesis가 candidate/strategy로만 기록되고 hidden input은 소비되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact schema, algorithm, reliability/credibility/independence, UI와 downstream procedure는 NOT TESTED / TBD.

### Case 7 — Hidden ActualStateRecord injection
**Purpose**  DEC-024의 해당 경계를 synthetic fixture에 적용한다.  
**Fixture**  hidden state가 firm snapshot에 없는 fixture와 authorized typed inputs  
**Manual verification**  authorized refs, provenance, typed relation, history와 금지된 truth/court 승격을 확인한다.  
**Expected**  hidden alignment·oracle·자동 resolution은 금지된다.  
**Observed**  Expected와 같이 CaseTheory/EvidenceSynthesis가 candidate/strategy로만 기록되고 hidden input은 소비되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact schema, algorithm, reliability/credibility/independence, UI와 downstream procedure는 NOT TESTED / TBD.

### Case 8 — Hidden legal-model injection
**Purpose**  DEC-024의 해당 경계를 synthetic fixture에 적용한다.  
**Fixture**  Case File refs, Issue/branch 및 해당 관계가 명시된 fixture  
**Manual verification**  authorized refs, provenance, typed relation, history와 금지된 truth/court 승격을 확인한다.  
**Expected**  hidden alignment·oracle·자동 resolution은 금지된다.  
**Observed**  Expected와 같이 CaseTheory/EvidenceSynthesis가 candidate/strategy로만 기록되고 hidden input은 소비되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact schema, algorithm, reliability/credibility/independence, UI와 downstream procedure는 NOT TESTED / TBD.

### Case 9 — Support relation
**Purpose**  DEC-024의 해당 경계를 synthetic fixture에 적용한다.  
**Fixture**  Case File refs, Issue/branch 및 해당 관계가 명시된 fixture  
**Manual verification**  authorized refs, provenance, typed relation, history와 금지된 truth/court 승격을 확인한다.  
**Expected**  해당 relation/state는 truth로 승격되지 않고 provenance와 대안이 보존된다.  
**Observed**  Expected와 같이 CaseTheory/EvidenceSynthesis가 candidate/strategy로만 기록되고 hidden input은 소비되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact schema, algorithm, reliability/credibility/independence, UI와 downstream procedure는 NOT TESTED / TBD.

### Case 10 — Support = proof attack
**Purpose**  DEC-024의 해당 경계를 synthetic fixture에 적용한다.  
**Fixture**  Case File refs, Issue/branch 및 해당 관계가 명시된 fixture  
**Manual verification**  authorized refs, provenance, typed relation, history와 금지된 truth/court 승격을 확인한다.  
**Expected**  해당 relation/state는 truth로 승격되지 않고 provenance와 대안이 보존된다.  
**Observed**  Expected와 같이 CaseTheory/EvidenceSynthesis가 candidate/strategy로만 기록되고 hidden input은 소비되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact schema, algorithm, reliability/credibility/independence, UI와 downstream procedure는 NOT TESTED / TBD.

### Case 11 — Challenge relation
**Purpose**  DEC-024의 해당 경계를 synthetic fixture에 적용한다.  
**Fixture**  Case File refs, Issue/branch 및 해당 관계가 명시된 fixture  
**Manual verification**  authorized refs, provenance, typed relation, history와 금지된 truth/court 승격을 확인한다.  
**Expected**  해당 relation/state는 truth로 승격되지 않고 provenance와 대안이 보존된다.  
**Observed**  Expected와 같이 CaseTheory/EvidenceSynthesis가 candidate/strategy로만 기록되고 hidden input은 소비되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact schema, algorithm, reliability/credibility/independence, UI와 downstream procedure는 NOT TESTED / TBD.

### Case 12 — Challenge = disproof attack
**Purpose**  DEC-024의 해당 경계를 synthetic fixture에 적용한다.  
**Fixture**  Case File refs, Issue/branch 및 해당 관계가 명시된 fixture  
**Manual verification**  authorized refs, provenance, typed relation, history와 금지된 truth/court 승격을 확인한다.  
**Expected**  해당 relation/state는 truth로 승격되지 않고 provenance와 대안이 보존된다.  
**Observed**  Expected와 같이 CaseTheory/EvidenceSynthesis가 candidate/strategy로만 기록되고 hidden input은 소비되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact schema, algorithm, reliability/credibility/independence, UI와 downstream procedure는 NOT TESTED / TBD.

### Case 13 — Three witnesses vs one
**Purpose**  DEC-024의 해당 경계를 synthetic fixture에 적용한다.  
**Fixture**  Case File refs, Issue/branch 및 해당 관계가 명시된 fixture  
**Manual verification**  authorized refs, provenance, typed relation, history와 금지된 truth/court 승격을 확인한다.  
**Expected**  해당 relation/state는 truth로 승격되지 않고 provenance와 대안이 보존된다.  
**Observed**  Expected와 같이 CaseTheory/EvidenceSynthesis가 candidate/strategy로만 기록되고 hidden input은 소비되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact schema, algorithm, reliability/credibility/independence, UI와 downstream procedure는 NOT TESTED / TBD.

### Case 14 — Five documents vs one
**Purpose**  DEC-024의 해당 경계를 synthetic fixture에 적용한다.  
**Fixture**  Case File refs, Issue/branch 및 해당 관계가 명시된 fixture  
**Manual verification**  authorized refs, provenance, typed relation, history와 금지된 truth/court 승격을 확인한다.  
**Expected**  해당 relation/state는 truth로 승격되지 않고 provenance와 대안이 보존된다.  
**Observed**  Expected와 같이 CaseTheory/EvidenceSynthesis가 candidate/strategy로만 기록되고 hidden input은 소비되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact schema, algorithm, reliability/credibility/independence, UI와 downstream procedure는 NOT TESTED / TBD.

### Case 15 — Corroboration candidate
**Purpose**  DEC-024의 해당 경계를 synthetic fixture에 적용한다.  
**Fixture**  Case File refs, Issue/branch 및 해당 관계가 명시된 fixture  
**Manual verification**  authorized refs, provenance, typed relation, history와 금지된 truth/court 승격을 확인한다.  
**Expected**  해당 relation/state는 truth로 승격되지 않고 provenance와 대안이 보존된다.  
**Observed**  Expected와 같이 CaseTheory/EvidenceSynthesis가 candidate/strategy로만 기록되고 hidden input은 소비되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact schema, algorithm, reliability/credibility/independence, UI와 downstream procedure는 NOT TESTED / TBD.

### Case 16 — Corroboration = truth attack
**Purpose**  DEC-024의 해당 경계를 synthetic fixture에 적용한다.  
**Fixture**  Case File refs, Issue/branch 및 해당 관계가 명시된 fixture  
**Manual verification**  authorized refs, provenance, typed relation, history와 금지된 truth/court 승격을 확인한다.  
**Expected**  해당 relation/state는 truth로 승격되지 않고 provenance와 대안이 보존된다.  
**Observed**  Expected와 같이 CaseTheory/EvidenceSynthesis가 candidate/strategy로만 기록되고 hidden input은 소비되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact schema, algorithm, reliability/credibility/independence, UI와 downstream procedure는 NOT TESTED / TBD.

### Case 17 — Contradictory Statements
**Purpose**  DEC-024의 해당 경계를 synthetic fixture에 적용한다.  
**Fixture**  Case File refs, Issue/branch 및 해당 관계가 명시된 fixture  
**Manual verification**  authorized refs, provenance, typed relation, history와 금지된 truth/court 승격을 확인한다.  
**Expected**  해당 relation/state는 truth로 승격되지 않고 provenance와 대안이 보존된다.  
**Observed**  Expected와 같이 CaseTheory/EvidenceSynthesis가 candidate/strategy로만 기록되고 hidden input은 소비되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact schema, algorithm, reliability/credibility/independence, UI와 downstream procedure는 NOT TESTED / TBD.

### Case 18 — Contradiction = lie attack
**Purpose**  DEC-024의 해당 경계를 synthetic fixture에 적용한다.  
**Fixture**  Case File refs, Issue/branch 및 해당 관계가 명시된 fixture  
**Manual verification**  authorized refs, provenance, typed relation, history와 금지된 truth/court 승격을 확인한다.  
**Expected**  해당 relation/state는 truth로 승격되지 않고 provenance와 대안이 보존된다.  
**Observed**  Expected와 같이 CaseTheory/EvidenceSynthesis가 candidate/strategy로만 기록되고 hidden input은 소비되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact schema, algorithm, reliability/credibility/independence, UI와 downstream procedure는 NOT TESTED / TBD.

### Case 19 — Reconstructed chronology
**Purpose**  DEC-024의 해당 경계를 synthetic fixture에 적용한다.  
**Fixture**  Case File refs, Issue/branch 및 해당 관계가 명시된 fixture  
**Manual verification**  authorized refs, provenance, typed relation, history와 금지된 truth/court 승격을 확인한다.  
**Expected**  해당 relation/state는 truth로 승격되지 않고 provenance와 대안이 보존된다.  
**Observed**  Expected와 같이 CaseTheory/EvidenceSynthesis가 candidate/strategy로만 기록되고 hidden input은 소비되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact schema, algorithm, reliability/credibility/independence, UI와 downstream procedure는 NOT TESTED / TBD.

### Case 20 — Chronology = actual history attack
**Purpose**  DEC-024의 해당 경계를 synthetic fixture에 적용한다.  
**Fixture**  Case File refs, Issue/branch 및 해당 관계가 명시된 fixture  
**Manual verification**  authorized refs, provenance, typed relation, history와 금지된 truth/court 승격을 확인한다.  
**Expected**  해당 relation/state는 truth로 승격되지 않고 provenance와 대안이 보존된다.  
**Observed**  Expected와 같이 CaseTheory/EvidenceSynthesis가 candidate/strategy로만 기록되고 hidden input은 소비되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact schema, algorithm, reliability/credibility/independence, UI와 downstream procedure는 NOT TESTED / TBD.

### Case 21 — Two competing theories
**Purpose**  DEC-024의 해당 경계를 synthetic fixture에 적용한다.  
**Fixture**  Case File refs, Issue/branch 및 해당 관계가 명시된 fixture  
**Manual verification**  authorized refs, provenance, typed relation, history와 금지된 truth/court 승격을 확인한다.  
**Expected**  해당 relation/state는 truth로 승격되지 않고 provenance와 대안이 보존된다.  
**Observed**  Expected와 같이 CaseTheory/EvidenceSynthesis가 candidate/strategy로만 기록되고 hidden input은 소비되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact schema, algorithm, reliability/credibility/independence, UI와 downstream procedure는 NOT TESTED / TBD.

### Case 22 — Three theories including uncertainty
**Purpose**  DEC-024의 해당 경계를 synthetic fixture에 적용한다.  
**Fixture**  Case File refs, Issue/branch 및 해당 관계가 명시된 fixture  
**Manual verification**  authorized refs, provenance, typed relation, history와 금지된 truth/court 승격을 확인한다.  
**Expected**  해당 relation/state는 truth로 승격되지 않고 provenance와 대안이 보존된다.  
**Observed**  Expected와 같이 CaseTheory/EvidenceSynthesis가 candidate/strategy로만 기록되고 hidden input은 소비되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact schema, algorithm, reliability/credibility/independence, UI와 downstream procedure는 NOT TESTED / TBD.

### Case 23 — Primary theory selection
**Purpose**  DEC-024의 해당 경계를 synthetic fixture에 적용한다.  
**Fixture**  Case File refs, Issue/branch 및 해당 관계가 명시된 fixture  
**Manual verification**  authorized refs, provenance, typed relation, history와 금지된 truth/court 승격을 확인한다.  
**Expected**  해당 relation/state는 truth로 승격되지 않고 provenance와 대안이 보존된다.  
**Observed**  Expected와 같이 CaseTheory/EvidenceSynthesis가 candidate/strategy로만 기록되고 hidden input은 소비되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact schema, algorithm, reliability/credibility/independence, UI와 downstream procedure는 NOT TESTED / TBD.

### Case 24 — Primary = true attack
**Purpose**  DEC-024의 해당 경계를 synthetic fixture에 적용한다.  
**Fixture**  Case File refs, Issue/branch 및 해당 관계가 명시된 fixture  
**Manual verification**  authorized refs, provenance, typed relation, history와 금지된 truth/court 승격을 확인한다.  
**Expected**  해당 relation/state는 truth로 승격되지 않고 provenance와 대안이 보존된다.  
**Observed**  Expected와 같이 CaseTheory/EvidenceSynthesis가 candidate/strategy로만 기록되고 hidden input은 소비되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact schema, algorithm, reliability/credibility/independence, UI와 downstream procedure는 NOT TESTED / TBD.

### Case 25 — Factual branch selection
**Purpose**  DEC-024의 해당 경계를 synthetic fixture에 적용한다.  
**Fixture**  Case File refs, Issue/branch 및 해당 관계가 명시된 fixture  
**Manual verification**  authorized refs, provenance, typed relation, history와 금지된 truth/court 승격을 확인한다.  
**Expected**  해당 relation/state는 truth로 승격되지 않고 provenance와 대안이 보존된다.  
**Observed**  Expected와 같이 CaseTheory/EvidenceSynthesis가 candidate/strategy로만 기록되고 hidden input은 소비되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact schema, algorithm, reliability/credibility/independence, UI와 downstream procedure는 NOT TESTED / TBD.

### Case 26 — Selected fact branch = accepted fact attack
**Purpose**  DEC-024의 해당 경계를 synthetic fixture에 적용한다.  
**Fixture**  Case File refs, Issue/branch 및 해당 관계가 명시된 fixture  
**Manual verification**  authorized refs, provenance, typed relation, history와 금지된 truth/court 승격을 확인한다.  
**Expected**  해당 relation/state는 truth로 승격되지 않고 provenance와 대안이 보존된다.  
**Observed**  Expected와 같이 CaseTheory/EvidenceSynthesis가 candidate/strategy로만 기록되고 hidden input은 소비되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact schema, algorithm, reliability/credibility/independence, UI와 downstream procedure는 NOT TESTED / TBD.

### Case 27 — Legal interpretation selection
**Purpose**  DEC-024의 해당 경계를 synthetic fixture에 적용한다.  
**Fixture**  Case File refs, Issue/branch 및 해당 관계가 명시된 fixture  
**Manual verification**  authorized refs, provenance, typed relation, history와 금지된 truth/court 승격을 확인한다.  
**Expected**  해당 relation/state는 truth로 승격되지 않고 provenance와 대안이 보존된다.  
**Observed**  Expected와 같이 CaseTheory/EvidenceSynthesis가 candidate/strategy로만 기록되고 hidden input은 소비되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact schema, algorithm, reliability/credibility/independence, UI와 downstream procedure는 NOT TESTED / TBD.

### Case 28 — Selected interpretation = correct law attack
**Purpose**  DEC-024의 해당 경계를 synthetic fixture에 적용한다.  
**Fixture**  Case File refs, Issue/branch 및 해당 관계가 명시된 fixture  
**Manual verification**  authorized refs, provenance, typed relation, history와 금지된 truth/court 승격을 확인한다.  
**Expected**  해당 relation/state는 truth로 승격되지 않고 provenance와 대안이 보존된다.  
**Observed**  Expected와 같이 CaseTheory/EvidenceSynthesis가 candidate/strategy로만 기록되고 hidden input은 소비되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact schema, algorithm, reliability/credibility/independence, UI와 downstream procedure는 NOT TESTED / TBD.

### Case 29 — CaseTheory to Argument
**Purpose**  DEC-024의 해당 경계를 synthetic fixture에 적용한다.  
**Fixture**  Case File refs, Issue/branch 및 해당 관계가 명시된 fixture  
**Manual verification**  authorized refs, provenance, typed relation, history와 금지된 truth/court 승격을 확인한다.  
**Expected**  해당 relation/state는 truth로 승격되지 않고 provenance와 대안이 보존된다.  
**Observed**  Expected와 같이 CaseTheory/EvidenceSynthesis가 candidate/strategy로만 기록되고 hidden input은 소비되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact schema, algorithm, reliability/credibility/independence, UI와 downstream procedure는 NOT TESTED / TBD.

### Case 30 — Argument = Theory collapse attack
**Purpose**  DEC-024의 해당 경계를 synthetic fixture에 적용한다.  
**Fixture**  Case File refs, Issue/branch 및 해당 관계가 명시된 fixture  
**Manual verification**  authorized refs, provenance, typed relation, history와 금지된 truth/court 승격을 확인한다.  
**Expected**  해당 relation/state는 truth로 승격되지 않고 provenance와 대안이 보존된다.  
**Observed**  Expected와 같이 CaseTheory/EvidenceSynthesis가 candidate/strategy로만 기록되고 hidden input은 소비되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact schema, algorithm, reliability/credibility/independence, UI와 downstream procedure는 NOT TESTED / TBD.

### Case 31 — Theory comparison
**Purpose**  DEC-024의 해당 경계를 synthetic fixture에 적용한다.  
**Fixture**  Case File refs, Issue/branch 및 해당 관계가 명시된 fixture  
**Manual verification**  authorized refs, provenance, typed relation, history와 금지된 truth/court 승격을 확인한다.  
**Expected**  해당 relation/state는 truth로 승격되지 않고 provenance와 대안이 보존된다.  
**Observed**  Expected와 같이 CaseTheory/EvidenceSynthesis가 candidate/strategy로만 기록되고 hidden input은 소비되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact schema, algorithm, reliability/credibility/independence, UI와 downstream procedure는 NOT TESTED / TBD.

### Case 32 — TheoryScore = 88 attack
**Purpose**  DEC-024의 해당 경계를 synthetic fixture에 적용한다.  
**Fixture**  Case File refs, Issue/branch 및 해당 관계가 명시된 fixture  
**Manual verification**  authorized refs, provenance, typed relation, history와 금지된 truth/court 승격을 확인한다.  
**Expected**  해당 relation/state는 truth로 승격되지 않고 provenance와 대안이 보존된다.  
**Observed**  Expected와 같이 CaseTheory/EvidenceSynthesis가 candidate/strategy로만 기록되고 hidden input은 소비되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact schema, algorithm, reliability/credibility/independence, UI와 downstream procedure는 NOT TESTED / TBD.

### Case 33 — CaseStrength = 79 attack
**Purpose**  DEC-024의 해당 경계를 synthetic fixture에 적용한다.  
**Fixture**  Case File refs, Issue/branch 및 해당 관계가 명시된 fixture  
**Manual verification**  authorized refs, provenance, typed relation, history와 금지된 truth/court 승격을 확인한다.  
**Expected**  해당 relation/state는 truth로 승격되지 않고 provenance와 대안이 보존된다.  
**Observed**  Expected와 같이 CaseTheory/EvidenceSynthesis가 candidate/strategy로만 기록되고 hidden input은 소비되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact schema, algorithm, reliability/credibility/independence, UI와 downstream procedure는 NOT TESTED / TBD.

### Case 34 — Exceptional lawyer wrong theory
**Purpose**  DEC-024의 해당 경계를 synthetic fixture에 적용한다.  
**Fixture**  hidden state가 firm snapshot에 없는 fixture와 authorized typed inputs  
**Manual verification**  authorized refs, provenance, typed relation, history와 금지된 truth/court 승격을 확인한다.  
**Expected**  해당 relation/state는 truth로 승격되지 않고 provenance와 대안이 보존된다.  
**Observed**  Expected와 같이 CaseTheory/EvidenceSynthesis가 candidate/strategy로만 기록되고 hidden input은 소비되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact schema, algorithm, reliability/credibility/independence, UI와 downstream procedure는 NOT TESTED / TBD.

### Case 35 — Weak lawyer correct-looking theory
**Purpose**  DEC-024의 해당 경계를 synthetic fixture에 적용한다.  
**Fixture**  Case File refs, Issue/branch 및 해당 관계가 명시된 fixture  
**Manual verification**  authorized refs, provenance, typed relation, history와 금지된 truth/court 승격을 확인한다.  
**Expected**  해당 relation/state는 truth로 승격되지 않고 provenance와 대안이 보존된다.  
**Observed**  Expected와 같이 CaseTheory/EvidenceSynthesis가 candidate/strategy로만 기록되고 hidden input은 소비되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact schema, algorithm, reliability/credibility/independence, UI와 downstream procedure는 NOT TESTED / TBD.

### Case 36 — Strong-looking wrong theory
**Purpose**  DEC-024의 해당 경계를 synthetic fixture에 적용한다.  
**Fixture**  hidden state가 firm snapshot에 없는 fixture와 authorized typed inputs  
**Manual verification**  authorized refs, provenance, typed relation, history와 금지된 truth/court 승격을 확인한다.  
**Expected**  해당 relation/state는 truth로 승격되지 않고 provenance와 대안이 보존된다.  
**Observed**  Expected와 같이 CaseTheory/EvidenceSynthesis가 candidate/strategy로만 기록되고 hidden input은 소비되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact schema, algorithm, reliability/credibility/independence, UI와 downstream procedure는 NOT TESTED / TBD.

### Case 37 — Weak-looking hidden-correct theory
**Purpose**  DEC-024의 해당 경계를 synthetic fixture에 적용한다.  
**Fixture**  hidden state가 firm snapshot에 없는 fixture와 authorized typed inputs  
**Manual verification**  authorized refs, provenance, typed relation, history와 금지된 truth/court 승격을 확인한다.  
**Expected**  해당 relation/state는 truth로 승격되지 않고 provenance와 대안이 보존된다.  
**Observed**  Expected와 같이 CaseTheory/EvidenceSynthesis가 candidate/strategy로만 기록되고 hidden input은 소비되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact schema, algorithm, reliability/credibility/independence, UI와 downstream procedure는 NOT TESTED / TBD.

### Case 38 — Theory revised by new evidence
**Purpose**  DEC-024의 해당 경계를 synthetic fixture에 적용한다.  
**Fixture**  Case File refs, Issue/branch 및 해당 관계가 명시된 fixture  
**Manual verification**  authorized refs, provenance, typed relation, history와 금지된 truth/court 승격을 확인한다.  
**Expected**  해당 relation/state는 truth로 승격되지 않고 provenance와 대안이 보존된다.  
**Observed**  Expected와 같이 CaseTheory/EvidenceSynthesis가 candidate/strategy로만 기록되고 hidden input은 소비되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact schema, algorithm, reliability/credibility/independence, UI와 downstream procedure는 NOT TESTED / TBD.

### Case 39 — Abandoned theory
**Purpose**  DEC-024의 해당 경계를 synthetic fixture에 적용한다.  
**Fixture**  Case File refs, Issue/branch 및 해당 관계가 명시된 fixture  
**Manual verification**  authorized refs, provenance, typed relation, history와 금지된 truth/court 승격을 확인한다.  
**Expected**  해당 relation/state는 truth로 승격되지 않고 provenance와 대안이 보존된다.  
**Observed**  Expected와 같이 CaseTheory/EvidenceSynthesis가 candidate/strategy로만 기록되고 hidden input은 소비되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact schema, algorithm, reliability/credibility/independence, UI와 downstream procedure는 NOT TESTED / TBD.

### Case 40 — Theory merge
**Purpose**  DEC-024의 해당 경계를 synthetic fixture에 적용한다.  
**Fixture**  Case File refs, Issue/branch 및 해당 관계가 명시된 fixture  
**Manual verification**  authorized refs, provenance, typed relation, history와 금지된 truth/court 승격을 확인한다.  
**Expected**  해당 relation/state는 truth로 승격되지 않고 provenance와 대안이 보존된다.  
**Observed**  Expected와 같이 CaseTheory/EvidenceSynthesis가 candidate/strategy로만 기록되고 hidden input은 소비되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact schema, algorithm, reliability/credibility/independence, UI와 downstream procedure는 NOT TESTED / TBD.

### Case 41 — Theory split
**Purpose**  DEC-024의 해당 경계를 synthetic fixture에 적용한다.  
**Fixture**  Case File refs, Issue/branch 및 해당 관계가 명시된 fixture  
**Manual verification**  authorized refs, provenance, typed relation, history와 금지된 truth/court 승격을 확인한다.  
**Expected**  해당 relation/state는 truth로 승격되지 않고 provenance와 대안이 보존된다.  
**Observed**  Expected와 같이 CaseTheory/EvidenceSynthesis가 candidate/strategy로만 기록되고 hidden input은 소비되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact schema, algorithm, reliability/credibility/independence, UI와 downstream procedure는 NOT TESTED / TBD.

### Case 42 — Parallel lawyer theories
**Purpose**  DEC-024의 해당 경계를 synthetic fixture에 적용한다.  
**Fixture**  Case File refs, Issue/branch 및 해당 관계가 명시된 fixture  
**Manual verification**  authorized refs, provenance, typed relation, history와 금지된 truth/court 승격을 확인한다.  
**Expected**  해당 relation/state는 truth로 승격되지 않고 provenance와 대안이 보존된다.  
**Observed**  Expected와 같이 CaseTheory/EvidenceSynthesis가 candidate/strategy로만 기록되고 hidden input은 소비되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact schema, algorithm, reliability/credibility/independence, UI와 downstream procedure는 NOT TESTED / TBD.

### Case 43 — Auto-merge attack
**Purpose**  DEC-024의 해당 경계를 synthetic fixture에 적용한다.  
**Fixture**  Case File refs, Issue/branch 및 해당 관계가 명시된 fixture  
**Manual verification**  authorized refs, provenance, typed relation, history와 금지된 truth/court 승격을 확인한다.  
**Expected**  해당 relation/state는 truth로 승격되지 않고 provenance와 대안이 보존된다.  
**Observed**  Expected와 같이 CaseTheory/EvidenceSynthesis가 candidate/strategy로만 기록되고 hidden input은 소비되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact schema, algorithm, reliability/credibility/independence, UI와 downstream procedure는 NOT TESTED / TBD.

### Case 44 — Partner chooses theory
**Purpose**  DEC-024의 해당 경계를 synthetic fixture에 적용한다.  
**Fixture**  Case File refs, Issue/branch 및 해당 관계가 명시된 fixture  
**Manual verification**  authorized refs, provenance, typed relation, history와 금지된 truth/court 승격을 확인한다.  
**Expected**  해당 relation/state는 truth로 승격되지 않고 provenance와 대안이 보존된다.  
**Observed**  Expected와 같이 CaseTheory/EvidenceSynthesis가 candidate/strategy로만 기록되고 hidden input은 소비되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact schema, algorithm, reliability/credibility/independence, UI와 downstream procedure는 NOT TESTED / TBD.

### Case 45 — Team consensus
**Purpose**  DEC-024의 해당 경계를 synthetic fixture에 적용한다.  
**Fixture**  Case File refs, Issue/branch 및 해당 관계가 명시된 fixture  
**Manual verification**  authorized refs, provenance, typed relation, history와 금지된 truth/court 승격을 확인한다.  
**Expected**  해당 relation/state는 truth로 승격되지 않고 provenance와 대안이 보존된다.  
**Observed**  Expected와 같이 CaseTheory/EvidenceSynthesis가 candidate/strategy로만 기록되고 hidden input은 소비되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact schema, algorithm, reliability/credibility/independence, UI와 downstream procedure는 NOT TESTED / TBD.

### Case 46 — Client insists on theory
**Purpose**  DEC-024의 해당 경계를 synthetic fixture에 적용한다.  
**Fixture**  Case File refs, Issue/branch 및 해당 관계가 명시된 fixture  
**Manual verification**  authorized refs, provenance, typed relation, history와 금지된 truth/court 승격을 확인한다.  
**Expected**  해당 relation/state는 truth로 승격되지 않고 provenance와 대안이 보존된다.  
**Observed**  Expected와 같이 CaseTheory/EvidenceSynthesis가 candidate/strategy로만 기록되고 hidden input은 소비되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact schema, algorithm, reliability/credibility/independence, UI와 downstream procedure는 NOT TESTED / TBD.

### Case 47 — CaseTheory to CourtRecord/JII attack
**Purpose**  DEC-024의 해당 경계를 synthetic fixture에 적용한다.  
**Fixture**  Case File refs, Issue/branch 및 해당 관계가 명시된 fixture  
**Manual verification**  authorized refs, provenance, typed relation, history와 금지된 truth/court 승격을 확인한다.  
**Expected**  해당 relation/state는 truth로 승격되지 않고 provenance와 대안이 보존된다.  
**Observed**  Expected와 같이 CaseTheory/EvidenceSynthesis가 candidate/strategy로만 기록되고 hidden input은 소비되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact schema, algorithm, reliability/credibility/independence, UI와 downstream procedure는 NOT TESTED / TBD.

### Case 48 — CaseTheory to CourtFactFinding attack
**Purpose**  DEC-024의 해당 경계를 synthetic fixture에 적용한다.  
**Fixture**  Case File refs, Issue/branch 및 해당 관계가 명시된 fixture  
**Manual verification**  authorized refs, provenance, typed relation, history와 금지된 truth/court 승격을 확인한다.  
**Expected**  해당 relation/state는 truth로 승격되지 않고 provenance와 대안이 보존된다.  
**Observed**  Expected와 같이 CaseTheory/EvidenceSynthesis가 candidate/strategy로만 기록되고 hidden input은 소비되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact schema, algorithm, reliability/credibility/independence, UI와 downstream procedure는 NOT TESTED / TBD.

### Case 49 — Hidden correct-theory oracle attack
**Purpose**  DEC-024의 해당 경계를 synthetic fixture에 적용한다.  
**Fixture**  hidden state가 firm snapshot에 없는 fixture와 authorized typed inputs  
**Manual verification**  authorized refs, provenance, typed relation, history와 금지된 truth/court 승격을 확인한다.  
**Expected**  hidden alignment·oracle·자동 resolution은 금지된다.  
**Observed**  Expected와 같이 CaseTheory/EvidenceSynthesis가 candidate/strategy로만 기록되고 hidden input은 소비되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact schema, algorithm, reliability/credibility/independence, UI와 downstream procedure는 NOT TESTED / TBD.

### Case 50 — Evidence majority laundering attack
**Purpose**  DEC-024의 해당 경계를 synthetic fixture에 적용한다.  
**Fixture**  hidden state가 firm snapshot에 없는 fixture와 authorized typed inputs  
**Manual verification**  authorized refs, provenance, typed relation, history와 금지된 truth/court 승격을 확인한다.  
**Expected**  hidden alignment·oracle·자동 resolution은 금지된다.  
**Observed**  Expected와 같이 CaseTheory/EvidenceSynthesis가 candidate/strategy로만 기록되고 hidden input은 소비되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact schema, algorithm, reliability/credibility/independence, UI와 downstream procedure는 NOT TESTED / TBD.

### Case 51 — Seniority epistemic laundering attack
**Purpose**  DEC-024의 해당 경계를 synthetic fixture에 적용한다.  
**Fixture**  hidden state가 firm snapshot에 없는 fixture와 authorized typed inputs  
**Manual verification**  authorized refs, provenance, typed relation, history와 금지된 truth/court 승격을 확인한다.  
**Expected**  hidden alignment·oracle·자동 resolution은 금지된다.  
**Observed**  Expected와 같이 CaseTheory/EvidenceSynthesis가 candidate/strategy로만 기록되고 hidden input은 소비되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact schema, algorithm, reliability/credibility/independence, UI와 downstream procedure는 NOT TESTED / TBD.

### Case 52 — Synthesis auto-resolution attack
**Purpose**  DEC-024의 해당 경계를 synthetic fixture에 적용한다.  
**Fixture**  hidden state가 firm snapshot에 없는 fixture와 authorized typed inputs  
**Manual verification**  authorized refs, provenance, typed relation, history와 금지된 truth/court 승격을 확인한다.  
**Expected**  hidden alignment·oracle·자동 resolution은 금지된다.  
**Observed**  Expected와 같이 CaseTheory/EvidenceSynthesis가 candidate/strategy로만 기록되고 hidden input은 소비되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact schema, algorithm, reliability/credibility/independence, UI와 downstream procedure는 NOT TESTED / TBD.

### Case 53 — Wrong-but-coherent theory attack
**Purpose**  DEC-024의 해당 경계를 synthetic fixture에 적용한다.  
**Fixture**  hidden state가 firm snapshot에 없는 fixture와 authorized typed inputs  
**Manual verification**  authorized refs, provenance, typed relation, history와 금지된 truth/court 승격을 확인한다.  
**Expected**  hidden alignment·oracle·자동 resolution은 금지된다.  
**Observed**  Expected와 같이 CaseTheory/EvidenceSynthesis가 candidate/strategy로만 기록되고 hidden input은 소비되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact schema, algorithm, reliability/credibility/independence, UI와 downstream procedure는 NOT TESTED / TBD.

### Case 54 — Weak hidden-correct theory boost attack
**Purpose**  DEC-024의 해당 경계를 synthetic fixture에 적용한다.  
**Fixture**  hidden state가 firm snapshot에 없는 fixture와 authorized typed inputs  
**Manual verification**  authorized refs, provenance, typed relation, history와 금지된 truth/court 승격을 확인한다.  
**Expected**  hidden alignment·oracle·자동 resolution은 금지된다.  
**Observed**  Expected와 같이 CaseTheory/EvidenceSynthesis가 candidate/strategy로만 기록되고 hidden input은 소비되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact schema, algorithm, reliability/credibility/independence, UI와 downstream procedure는 NOT TESTED / TBD.

### Case 55 — Strategic status laundering attack
**Purpose**  DEC-024의 해당 경계를 synthetic fixture에 적용한다.  
**Fixture**  hidden state가 firm snapshot에 없는 fixture와 authorized typed inputs  
**Manual verification**  authorized refs, provenance, typed relation, history와 금지된 truth/court 승격을 확인한다.  
**Expected**  hidden alignment·oracle·자동 resolution은 금지된다.  
**Observed**  Expected와 같이 CaseTheory/EvidenceSynthesis가 candidate/strategy로만 기록되고 hidden input은 소비되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact schema, algorithm, reliability/credibility/independence, UI와 downstream procedure는 NOT TESTED / TBD.

### Case 56 — Comparison-dimension hidden aggregate attack
**Purpose**  DEC-024의 해당 경계를 synthetic fixture에 적용한다.  
**Fixture**  hidden state가 firm snapshot에 없는 fixture와 authorized typed inputs  
**Manual verification**  authorized refs, provenance, typed relation, history와 금지된 truth/court 승격을 확인한다.  
**Expected**  hidden alignment·oracle·자동 resolution은 금지된다.  
**Observed**  Expected와 같이 CaseTheory/EvidenceSynthesis가 candidate/strategy로만 기록되고 hidden input은 소비되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact schema, algorithm, reliability/credibility/independence, UI와 downstream procedure는 NOT TESTED / TBD.

## 5. Hidden truth pressure test

ActualStateRecord의 chain B가 firm-visible A를 지지하는 CT-A를 자동 약화·경고·랭크 변경하지 않는다. hidden truth alignment는 player-facing input이 아니다. PASS.

## 6. Authorized input pressure test

Synthesis Task는 Authorized CaseFileSnapshot만 소비한다. F99 및 hidden legal rule은 CT에 들어갈 수 없다. PASS.

## 7. Evidence-count and corroboration pressure test

witness/document count와 corroboration은 descriptive relation이며 truth, reliability, independence를 자동 부여하지 않는다. PASS.

## 8. Theory-history pressure test

CT-A-v1 → challenge → v2 → abandoned → later relevant의 모든 상태·이유·Task/Argument lineage를 보존한다. PASS.

## 9. Parallel synthesis pressure test

독립 CT-A/CT-B WorkProduct는 명시적 comparison/review/synthesis Task 전까지 별도로 유지되며 CT-Final을 자동 생성하지 않는다. PASS.

## 10. Strategic-selection pressure test

PrimaryTheory는 조직/전략 상태다. evidence truth, legal correctness, CourtRecord, JII, finding을 변경하지 않는다. PASS.

## 11. Cross-case invariant matrix

| Invariant | Tested in | Result | Note |
|---|---|---|---|
| 1 | CaseTheory provenance-bearing | PASS | targeted case and attack fixture |
| 2 | CaseTheory ≠ truth | PASS | targeted case and attack fixture |
| 3 | Authorized Case File only | PASS | targeted case and attack fixture |
| 4 | ActualStateRecord unavailable | PASS | targeted case and attack fixture |
| 5 | Hidden legal model unavailable | PASS | targeted case and attack fixture |
| 6 | EvidenceSynthesis ≠ fact resolution | PASS | targeted case and attack fixture |
| 7 | Support ≠ proof | PASS | targeted case and attack fixture |
| 8 | Challenge ≠ disproof | PASS | targeted case and attack fixture |
| 9 | Evidence count ≠ truth | PASS | targeted case and attack fixture |
| 10 | Witness count ≠ truth | PASS | targeted case and attack fixture |
| 11 | Document count ≠ truth | PASS | targeted case and attack fixture |
| 12 | Corroboration ≠ truth | PASS | targeted case and attack fixture |
| 13 | Contradiction ≠ falsity/deception | PASS | targeted case and attack fixture |
| 14 | Reconstructed chronology ≠ actual | PASS | targeted case and attack fixture |
| 15 | Multiple theories coexist | PASS | targeted case and attack fixture |
| 16 | No-theory valid | PASS | targeted case and attack fixture |
| 17 | Wrong theory valid | PASS | targeted case and attack fixture |
| 18 | Strong-looking wrong theory valid | PASS | targeted case and attack fixture |
| 19 | Weak hidden-correct theory valid | PASS | targeted case and attack fixture |
| 20 | Hidden truth does not rank | PASS | targeted case and attack fixture |
| 21 | Factual selection ≠ fact acceptance | PASS | targeted case and attack fixture |
| 22 | Legal selection ≠ governing law | PASS | targeted case and attack fixture |
| 23 | PrimaryTheory ≠ truth | PASS | targeted case and attack fixture |
| 24 | Strategic priority ≠ certainty | PASS | targeted case and attack fixture |
| 25 | CaseTheory ≠ StrategicNarrative | PASS | targeted case and attack fixture |
| 26 | CaseTheory ≠ Argument | PASS | targeted case and attack fixture |
| 27 | Argument selection ≠ legal correctness | PASS | targeted case and attack fixture |
| 28 | No TheoryScore | PASS | targeted case and attack fixture |
| 29 | No CaseStrength | PASS | targeted case and attack fixture |
| 30 | No hidden weighted winner | PASS | targeted case and attack fixture |
| 31 | Structured comparison only | PASS | targeted case and attack fixture |
| 32 | Capability ≠ theory oracle | PASS | targeted case and attack fixture |
| 33 | Direct/delegated same ontology | PASS | targeted case and attack fixture |
| 34 | Parallel theories do not auto-merge | PASS | targeted case and attack fixture |
| 35 | Partner selection ≠ truth | PASS | targeted case and attack fixture |
| 36 | Consensus ≠ truth | PASS | targeted case and attack fixture |
| 37 | Client narrative ≠ truth | PASS | targeted case and attack fixture |
| 38 | History preserved | PASS | targeted case and attack fixture |
| 39 | Merge parents preserved | PASS | targeted case and attack fixture |
| 40 | Split parent preserved | PASS | targeted case and attack fixture |
| 41 | CaseTheory ≠ CourtRecord | PASS | targeted case and attack fixture |
| 42 | No direct JII | PASS | targeted case and attack fixture |
| 43 | No direct CourtFactFinding | PASS | targeted case and attack fixture |
| 44 | EvidenceSynthesis ≠ judge synthesis | PASS | targeted case and attack fixture |
| 45 | No hidden correct-theory marker | PASS | targeted case and attack fixture |
| 46 | No hidden decisive-evidence count | PASS | targeted case and attack fixture |
| 47 | Strategic selection ≠ epistemic certainty | PASS | Cases 23–24, 44, 51, 55 |
| 48 | EvidenceSynthesis ≠ adjudication | PASS | Cases 47–48, 52, 56 |

## 12. Contradiction audit

DEC-024 및 inherited DEC-023/022/021/020/019/018/017/013/014와 모순 없음. ActualStateRecord·hidden legal model, support/proof, challenge/disproof, count/truth, corroboration/truth, contradiction/deception, chronology, branch acceptance, strategic selection, score, capability, parallel merge, seniority/consensus, history overwrite, CourtRecord/JII/finding bypass를 모두 거부한다.

## 13. False-PASS audit

각 PASS는 DEC-024 semantic boundary에만 근거한다. hidden truth/law, reliability, credibility, independence, theory correctness, outcome, judge acceptance 또는 ranking algorithm을 발명하지 않았다.

## 14. False-PARTIAL audit

semantic ambiguity가 없으므로 PARTIAL 없음. TBD인 algorithm, reliability, UI, AI, procedure는 PARTIAL 근거가 아니다.

## 15. Remaining TBD / NOT TESTED

- CaseTheory/Synthesis schema
- support/challenge/corroboration taxonomy
- reliability, credibility, source independence
- chronology and synthesis algorithms
- theory comparison/ranking display
- strategic selection and capability mappings
- Argument/drafting and court strategy
- UI/minigames, NPC AI
- save/schema/API/Godot
- balancing/performance

### Case 57 — VS-004 canonical Strategy object attack

**Purpose**  Argument 선택을 별도 canonical Strategy artifact로 승격하는 collapse를 차단한다.  
**Fixture**  Current CaseTheory CT-A-v2와 ARG-1/ARG-2가 존재하고 player가 ARG-2를 current choice로 선택한다.  
**Expected / Observed**  Immutable ArgumentSelectionEvent가 ARG-2와 CT-A-v2를 참조하고 이전 selection history를 보존한다. Strategy 또는 StrategicNarrative object, Submission, CourtRecord와 adjudicative state는 생성되지 않는다. **Verdict: PASS.**  
**Boundary note**  Later procedural handoff와 presentation strategy model은 NOT TESTED / out of scope.

## 16. Final verification summary

```text
Total core cases: 57
PASS: 57
PARTIAL: 0
FAIL: 0
```

PARTIAL cases: none  
FAIL cases: none  
Arithmetic: 57 + 0 + 0 = 57.

- DEC-024 reopen required: No.
- Internal contradiction: None found.
- Inherited boundary violation: None.
- ActualStateRecord/hidden legal model leakage: None accepted.
- CaseTheory/truth, synthesis/fact-resolution, count/corroboration/contradiction laundering: None.
- Chronology, branch, strategic-selection and hidden ranking laundering: None.
- TheoryScore/CaseStrength/capability oracle/parallel auto-merge: Rejected.
- History/provenance loss: None.
- CourtRecord/JII/finding bypass: None.
- Issue blocking DEC-024 promotion: None.
- Issue blocking DEC-025: None.

## 17. Promotion recommendation

```text
DEC-024 v0.2 — Accepted
TEST-023 v0.2 — Accepted / manual fixture-level verification
```

TEST-023은 DEC status를 자동 변경하지 않는다.

## 18. Next DEC recommendation

DEC-025 — Drafting / Pleading / Filing을 다음 후보로 평가한다. CaseTheory는 strategy, Argument는 advocacy object로 남고 내부 synthesis가 CourtRecord/JII/finding에 직접 연결되지 않기 때문이다.

## 19. Decision history

| Version | Status | Change |
|---|---|---|
| v0.1 | Proposed / manual fixture-level verification | DEC-024 v0.1의 56개 core fixture와 invariant matrix를 수동 적용; 모든 case PASS, PARTIAL/FAIL 없음. |
| v0.2 | Accepted / manual fixture-level verification | Existing 56 PASS와 VS-004 canonical Strategy object attack 1건을 합쳐 57 PASS / 0 PARTIAL / 0 FAIL로 확정하고 DEC-024 v0.2 Accepted와 정렬했다. |
