# THE FIRM — TEST-024 Drafting, Pleading and Filing

문서 ID: TEST-024  
버전: v0.3 — Accepted / manual fixture-level verification
상태: **Accepted / manual fixture-level verification**
대상: `DEC-LITIGATION-025_DRAFTING_PLEADING_AND_FILING.md` v0.3 Accepted

## 1. Purpose

DEC-025의 Drafting/Pleading/Filing semantics와 §12.1 VS-005 implementation slice를 synthetic fixture에 수동 적용한다. implementation test나 실제 한국 법률 절차 검증이 아니며 Observed는 manual fixture application이다.

```text
InternalAnalysis ≠ Argument ≠ Draft ≠ FinalizedDocument ≠ SubmissionAttempt
≠ FiledArtifact ≠ ServedArtifact ≠ ProcedurallyAcceptedArtifact ≠ CourtRecordEntry ≠ CourtFactFinding
Drafted ≠ finalized ≠ submitted ≠ filed ≠ served ≠ accepted ≠ CourtRecord ≠ judge considered
```

## 2. Verdict rules

PASS는 DEC-025 경계만으로 결과가 결정되고 inherited DEC와 모순 없음, PARTIAL은 semantic ambiguity, FAIL은 명시된 collapse가 실제 발생한 경우다. Korean forms/deadlines/service/admission, UI, AI, schema와 capability가 TBD인 것만으로 PARTIAL을 주지 않는다.

## 3. Manual application convention

각 case에서 authorized Case File/legal inputs, typed provenance, document version, review scope, procedural rule과 event history를 구분한다. hidden ActualStateRecord/legal model과 미래 judge outcome은 입력이 아니다.

## 4. Core cases (1–64)

### Case 1 — Basic Draft creation
**Purpose**  Basic Draft creation semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  해당 상태/관계만 생성되고 Draft, source, truth, procedure, CourtRecord 단계가 자동 collapse하지 않는다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Case 2 — Draft from CaseTheory
**Purpose**  Draft from CaseTheory semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  해당 상태/관계만 생성되고 Draft, source, truth, procedure, CourtRecord 단계가 자동 collapse하지 않는다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Case 3 — Draft from Argument
**Purpose**  Draft from Argument semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  해당 상태/관계만 생성되고 Draft, source, truth, procedure, CourtRecord 단계가 자동 collapse하지 않는다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Case 4 — Draft assertion from Statement
**Purpose**  Draft assertion from Statement semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  해당 상태/관계만 생성되고 Draft, source, truth, procedure, CourtRecord 단계가 자동 collapse하지 않는다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Case 5 — Draft assertion truth-laundering attack
**Purpose**  Draft assertion truth-laundering attack semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  해당 상태/관계만 생성되고 Draft, source, truth, procedure, CourtRecord 단계가 자동 collapse하지 않는다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Case 6 — Draft uses ProfessionalAnalysis
**Purpose**  Draft uses ProfessionalAnalysis semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  해당 상태/관계만 생성되고 Draft, source, truth, procedure, CourtRecord 단계가 자동 collapse하지 않는다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Case 7 — Hidden ActualStateRecord correction attack
**Purpose**  Hidden ActualStateRecord correction attack semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  해당 상태/관계만 생성되고 Draft, source, truth, procedure, CourtRecord 단계가 자동 collapse하지 않는다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Case 8 — Hidden legal-model correction attack
**Purpose**  Hidden legal-model correction attack semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  해당 상태/관계만 생성되고 Draft, source, truth, procedure, CourtRecord 단계가 자동 collapse하지 않는다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Case 9 — Source March 14 / Draft March 4
**Purpose**  Source March 14 / Draft March 4 semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  해당 상태/관계만 생성되고 Draft, source, truth, procedure, CourtRecord 단계가 자동 collapse하지 않는다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Case 10 — Draft omits weak source
**Purpose**  Draft omits weak source semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  해당 상태/관계만 생성되고 Draft, source, truth, procedure, CourtRecord 단계가 자동 collapse하지 않는다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Case 11 — Draft omits contradiction
**Purpose**  Draft omits contradiction semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  해당 상태/관계만 생성되고 Draft, source, truth, procedure, CourtRecord 단계가 자동 collapse하지 않는다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Case 12 — Strategic omission ≠ Case File deletion
**Purpose**  Strategic omission ≠ Case File deletion semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  해당 상태/관계만 생성되고 Draft, source, truth, procedure, CourtRecord 단계가 자동 collapse하지 않는다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Case 13 — Draft v1/v2
**Purpose**  Draft v1/v2 semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  해당 상태/관계만 생성되고 Draft, source, truth, procedure, CourtRecord 단계가 자동 collapse하지 않는다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Case 14 — Revision overwrite attack
**Purpose**  Revision overwrite attack semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  해당 상태/관계만 생성되고 Draft, source, truth, procedure, CourtRecord 단계가 자동 collapse하지 않는다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Case 15 — Factual review
**Purpose**  Factual review semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  해당 상태/관계만 생성되고 Draft, source, truth, procedure, CourtRecord 단계가 자동 collapse하지 않는다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Case 16 — Legal citation review
**Purpose**  Legal citation review semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  해당 상태/관계만 생성되고 Draft, source, truth, procedure, CourtRecord 단계가 자동 collapse하지 않는다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Case 17 — Procedural review
**Purpose**  Procedural review semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  해당 상태/관계만 생성되고 Draft, source, truth, procedure, CourtRecord 단계가 자동 collapse하지 않는다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Case 18 — Reviewer misses defect
**Purpose**  Reviewer misses defect semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  해당 상태/관계만 생성되고 Draft, source, truth, procedure, CourtRecord 단계가 자동 collapse하지 않는다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Case 19 — Exceptional reviewer misses defect
**Purpose**  Exceptional reviewer misses defect semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  해당 상태/관계만 생성되고 Draft, source, truth, procedure, CourtRecord 단계가 자동 collapse하지 않는다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Case 20 — Review complete = error-free attack
**Purpose**  Review complete = error-free attack semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  해당 상태/관계만 생성되고 Draft, source, truth, procedure, CourtRecord 단계가 자동 collapse하지 않는다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Case 21 — Finalization
**Purpose**  Finalization semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  해당 상태/관계만 생성되고 Draft, source, truth, procedure, CourtRecord 단계가 자동 collapse하지 않는다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Case 22 — Finalized = Submitted attack
**Purpose**  Finalized = Submitted attack semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  해당 상태/관계만 생성되고 Draft, source, truth, procedure, CourtRecord 단계가 자동 collapse하지 않는다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Case 23 — SubmissionAttempt
**Purpose**  SubmissionAttempt semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  해당 상태/관계만 생성되고 Draft, source, truth, procedure, CourtRecord 단계가 자동 collapse하지 않는다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Case 24 — Submitted = Accepted attack
**Purpose**  Submitted = Accepted attack semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  해당 상태/관계만 생성되고 Draft, source, truth, procedure, CourtRecord 단계가 자동 collapse하지 않는다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Case 25 — Strong argument / procedural defect
**Purpose**  Strong argument / procedural defect semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  해당 상태/관계만 생성되고 Draft, source, truth, procedure, CourtRecord 단계가 자동 collapse하지 않는다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Case 26 — Weak argument / procedurally valid
**Purpose**  Weak argument / procedurally valid semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  해당 상태/관계만 생성되고 Draft, source, truth, procedure, CourtRecord 단계가 자동 collapse하지 않는다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Case 27 — Missing required attachment
**Purpose**  Missing required attachment semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  해당 상태/관계만 생성되고 Draft, source, truth, procedure, CourtRecord 단계가 자동 collapse하지 않는다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Case 28 — Attachment referenced not included
**Purpose**  Attachment referenced not included semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  해당 상태/관계만 생성되고 Draft, source, truth, procedure, CourtRecord 단계가 자동 collapse하지 않는다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Case 29 — Attachment included
**Purpose**  Attachment included semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  해당 상태/관계만 생성되고 Draft, source, truth, procedure, CourtRecord 단계가 자동 collapse하지 않는다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Case 30 — Included = admitted attack
**Purpose**  Included = admitted attack semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  해당 상태/관계만 생성되고 Draft, source, truth, procedure, CourtRecord 단계가 자동 collapse하지 않는다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Case 31 — Admitted = truth attack
**Purpose**  Admitted = truth attack semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  해당 상태/관계만 생성되고 Draft, source, truth, procedure, CourtRecord 단계가 자동 collapse하지 않는다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Case 32 — Deadline miss
**Purpose**  Deadline miss semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  해당 상태/관계만 생성되고 Draft, source, truth, procedure, CourtRecord 단계가 자동 collapse하지 않는다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD. VS-005는 deadline context를 보존하지만 deadline result를 평가하지 않는다.

### Case 33 — Pending submission
**Purpose**  Pending submission semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  unresolved attempt는 broad architecture에서 유효하다. VS-005에서는 result record 부재로 표현되고 `pending` ProceduralResult kind를 만들지 않는다.
**Observed**  SubmissionAttempt만 존재하고 result/CourtRecord는 없으며 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.
**Verdict**  PASS  
**Boundary note**  future broad procedure may define pending vocabulary; it is outside the VS-005 exact allowlist.

### Case 34 — Rejected submission
**Purpose**  Rejected submission semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  해당 상태/관계만 생성되고 Draft, source, truth, procedure, CourtRecord 단계가 자동 collapse하지 않는다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Case 35 — Defective submission
**Purpose**  Defective submission semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  해당 상태/관계만 생성되고 Draft, source, truth, procedure, CourtRecord 단계가 자동 collapse하지 않는다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Case 36 — Wrong target
**Purpose**  Wrong target semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  해당 상태/관계만 생성되고 Draft, source, truth, procedure, CourtRecord 단계가 자동 collapse하지 않는다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Case 37 — Filed but not served
**Purpose**  Filed but not served semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  해당 상태/관계만 생성되고 Draft, source, truth, procedure, CourtRecord 단계가 자동 collapse하지 않는다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Case 38 — Served but disputed
**Purpose**  Served but disputed semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  해당 상태/관계만 생성되고 Draft, source, truth, procedure, CourtRecord 단계가 자동 collapse하지 않는다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Case 39 — Procedurally accepted artifact
**Purpose**  Procedurally accepted artifact semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  해당 상태/관계만 생성되고 Draft, source, truth, procedure, CourtRecord 단계가 자동 collapse하지 않는다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Case 40 — Accepted artifact to CourtRecord
**Purpose**  Accepted artifact to CourtRecord semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  해당 상태/관계만 생성되고 Draft, source, truth, procedure, CourtRecord 단계가 자동 collapse하지 않는다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Case 41 — Draft to CourtRecord attack
**Purpose**  Draft to CourtRecord attack semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  해당 상태/관계만 생성되고 Draft, source, truth, procedure, CourtRecord 단계가 자동 collapse하지 않는다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Case 42 — Submission to CourtRecord attack
**Purpose**  Submission to CourtRecord attack semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  해당 상태/관계만 생성되고 Draft, source, truth, procedure, CourtRecord 단계가 자동 collapse하지 않는다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Case 43 — CourtRecord assertion to FactFinding attack
**Purpose**  CourtRecord assertion to FactFinding attack semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  해당 상태/관계만 생성되고 Draft, source, truth, procedure, CourtRecord 단계가 자동 collapse하지 않는다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Case 44 — Filing amendment
**Purpose**  Filing amendment semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  해당 상태/관계만 생성되고 Draft, source, truth, procedure, CourtRecord 단계가 자동 collapse하지 않는다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Case 45 — Withdrawal
**Purpose**  Withdrawal semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  해당 상태/관계만 생성되고 Draft, source, truth, procedure, CourtRecord 단계가 자동 collapse하지 않는다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Case 46 — Superseded filing
**Purpose**  Superseded filing semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  해당 상태/관계만 생성되고 Draft, source, truth, procedure, CourtRecord 단계가 자동 collapse하지 않는다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Case 47 — Parallel drafts
**Purpose**  Parallel drafts semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  해당 상태/관계만 생성되고 Draft, source, truth, procedure, CourtRecord 단계가 자동 collapse하지 않는다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Case 48 — Auto-merge attack
**Purpose**  Auto-merge attack semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  해당 상태/관계만 생성되고 Draft, source, truth, procedure, CourtRecord 단계가 자동 collapse하지 않는다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Case 49 — Explicit draft merge
**Purpose**  Explicit draft merge semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  해당 상태/관계만 생성되고 Draft, source, truth, procedure, CourtRecord 단계가 자동 collapse하지 않는다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Case 50 — Partner approval
**Purpose**  Partner approval semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  해당 상태/관계만 생성되고 Draft, source, truth, procedure, CourtRecord 단계가 자동 collapse하지 않는다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Case 51 — Client approval
**Purpose**  Client approval semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  해당 상태/관계만 생성되고 Draft, source, truth, procedure, CourtRecord 단계가 자동 collapse하지 않는다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Case 52 — Direct player drafting
**Purpose**  Direct player drafting semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  해당 상태/관계만 생성되고 Draft, source, truth, procedure, CourtRecord 단계가 자동 collapse하지 않는다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Case 53 — Delegated drafting
**Purpose**  Delegated drafting semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  해당 상태/관계만 생성되고 Draft, source, truth, procedure, CourtRecord 단계가 자동 collapse하지 않는다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Case 54 — Hidden DraftingScore engine
**Purpose**  Hidden DraftingScore engine semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  해당 상태/관계만 생성되고 Draft, source, truth, procedure, CourtRecord 단계가 자동 collapse하지 않는다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Case 55 — Reload reroll of SubmissionResult
**Purpose**  Reload reroll of SubmissionResult semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  해당 상태/관계만 생성되고 Draft, source, truth, procedure, CourtRecord 단계가 자동 collapse하지 않는다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Case 56 — Procedural/substantive laundering attack
**Purpose**  Procedural/substantive laundering attack semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  해당 상태/관계만 생성되고 Draft, source, truth, procedure, CourtRecord 단계가 자동 collapse하지 않는다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Case 57 — Strong merits bypass procedure attack
**Purpose**  Strong merits bypass procedure attack semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  해당 상태/관계만 생성되고 Draft, source, truth, procedure, CourtRecord 단계가 자동 collapse하지 않는다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Case 58 — Weak merits rejection laundering attack
**Purpose**  Weak merits rejection laundering attack semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  해당 상태/관계만 생성되고 Draft, source, truth, procedure, CourtRecord 단계가 자동 collapse하지 않는다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Case 59 — Finalized-document auto-filing attack
**Purpose**  Finalized-document auto-filing attack semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  해당 상태/관계만 생성되고 Draft, source, truth, procedure, CourtRecord 단계가 자동 collapse하지 않는다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Case 60 — Filing-history erasure attack
**Purpose**  Filing-history erasure attack semantic boundary를 검증한다.  
**Fixture**  authorized Case File, CaseTheory/Argument, Draft/version와 해당 review 또는 procedural state  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  해당 상태/관계만 생성되고 Draft, source, truth, procedure, CourtRecord 단계가 자동 collapse하지 않는다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Attack detail 61 — CourtRecord materialization gate bypass attack
**Purpose**  CourtRecord materialization gate bypass attack semantic boundary를 검증한다.  
**Fixture**  D7/SA-7 및 명시적 procedural gate, 또는 D1→SA-1 rejection→D2→SA-2 acceptance timeline  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  각 공격은 explicit procedural/materialization/history rule 없이는 금지되며 prior artifact/event가 보존된다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Attack detail 62 — Filing status / judge-considered collapse attack
**Purpose**  Filing status / judge-considered collapse attack semantic boundary를 검증한다.  
**Fixture**  D7/SA-7 및 명시적 procedural gate, 또는 D1→SA-1 rejection→D2→SA-2 acceptance timeline  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  각 공격은 explicit procedural/materialization/history rule 없이는 금지되며 prior artifact/event가 보존된다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Attack detail 63 — Review-authority laundering attack
**Purpose**  Review-authority laundering attack semantic boundary를 검증한다.  
**Fixture**  D7/SA-7 및 명시적 procedural gate, 또는 D1→SA-1 rejection→D2→SA-2 acceptance timeline  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  각 공격은 explicit procedural/materialization/history rule 없이는 금지되며 prior artifact/event가 보존된다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

### Attack detail 64 — Cure/resubmission retroactive repair attack
**Purpose**  Cure/resubmission retroactive repair attack semantic boundary를 검증한다.  
**Fixture**  D7/SA-7 및 명시적 procedural gate, 또는 D1→SA-1 rejection→D2→SA-2 acceptance timeline  
**Manual verification**  상태 전이, provenance, attachment/package, review scope, supplied rule과 hidden truth/court bypass를 확인한다.  
**Expected**  각 공격은 explicit procedural/materialization/history rule 없이는 금지되며 prior artifact/event가 보존된다.  
**Observed**  typed inputs와 history는 유지되고 hidden correction, automatic promotion, score/oracle은 나타나지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact Korean procedure, taxonomy, algorithm, UI, AI, schema와 capability mapping은 NOT TESTED / TBD.

## 5. State-chain pressure test

Broad architecture에서는 Draft → FinalizedDocument → SubmissionAttempt → Filed/Accepted-like procedural states → explicit CourtRecord materialization rule → CourtRecordEntry를 분리한다. VS-005 slice에서는 이를 `FinalizedDocument → SubmissionAttempt → ProceduralResult(accepted_for_record | rejected_defective) → RecordMaterializationEvent → CourtRecordEntry`로 좁힌다. 어느 단계도 암묵적으로 skip하지 않으며 CourtRecordEntry ≠ CourtFactFinding이다. PASS.

## 6. Draft-truth and hidden-correction pressure test

CaseTheory/Argument가 March 4를 주장하고 source/hidden world가 March 14여도 Draft는 주장으로 남을 수 있다. source/Case File은 rewrite되지 않고 hidden ActualStateRecord/legal model은 자동 correction·warning·rank input이 아니다. PASS.

## 7. Omission and review pressure test

약한 source나 contradiction을 Draft가 omit할 수 있으나 Case File 삭제가 아니다. factual/citation/procedural review는 explicit scope이며 completion은 error-free 보장이 아니다. PASS.

## 8. Version, parallel and cure pressure test

D1/D2/D3, parallel D-A/D-B, amendment/withdrawal/supersession, rejection→Correction Task→new attempt를 모두 lineage로 보존한다. PASS.

## 9. Procedural/substantive pressure test

Strong merits + supplied procedural defect는 defect가 될 수 있고 weak merits + satisfied procedure는 hidden rejection이 아니다. exact rules는 fixture-declared 범위만 사용한다. PASS.

## 10. Attachment/service/CourtRecord pressure test

Reference ≠ inclusion ≠ admission ≠ truth, filed ≠ served ≠ agreement, accepted artifact도 explicit materialization rule 없이는 CourtRecord가 아니다. PASS.

## 11. Direct/delegated/capability pressure test

Player와 delegated lawyer는 동일 ontology를 사용한다. exceptional lawyer, partner/client approval, DraftingScore 및 hidden weighted engine은 truth·acceptance oracle이 아니다. PASS.

## 11.1 Additional attack fixtures (Cases 61–64)

### Case 61 — CourtRecord materialization gate bypass attack

D7이 finalized되고 SA-7이 accepted여도 explicit CourtRecord inclusion/materialization rule이 없으면 CR-7을 만들 수 없다. `ProcedurallyAcceptedArtifact ≠ automatically CourtRecordEntry`를 PASS로 확인한다.

### Case 62 — Filing status / judge-considered collapse attack

FiledArtifact 또는 ProcedurallyAcceptedArtifact를 UI가 “judge considered”로 표시할 수 없다. `filed ≠ judge considered`, `CourtRecordEntry ≠ judge relied`이며 judge-review mechanics는 TBD다. PASS.

### Case 63 — Review-authority laundering attack

Senior partner의 D4 review/approval는 factual truth, legal correctness, procedural acceptance guarantee가 아니다. Review는 여전히 scoped·fallible하다. PASS.

### Case 64 — Cure/resubmission retroactive repair attack

SA-1 rejection 후 D2/SA-2가 accepted되어도 SA-1 성공으로 바꾸거나 삭제할 수 없다. later cure는 retroactive success가 아니며 rejection/history가 보존된다. PASS.

## 12. Cross-case invariant matrix

| Invariant | Tested in | Result | Note |
|---|---|---|---|
| 1 | Drafting is explicit Task family | PASS | targeted case/attack fixture |
| 2 | Draft ≠ FinalizedDocument | PASS | targeted case/attack fixture |
| 3 | Finalized ≠ Submitted | PASS | targeted case/attack fixture |
| 4 | Submitted ≠ Filed | PASS | targeted case/attack fixture |
| 5 | Filed ≠ Accepted where distinguished | PASS | targeted case/attack fixture |
| 6 | Accepted ≠ CourtFactFinding | PASS | targeted case/attack fixture |
| 7 | Draft assertion ≠ truth | PASS | targeted case/attack fixture |
| 8 | Draft uses authorized Case File only | PASS | targeted case/attack fixture |
| 9 | ActualStateRecord unavailable | PASS | targeted case/attack fixture |
| 10 | Hidden legal model unavailable | PASS | targeted case/attack fixture |
| 11 | Draft preserves claim/source provenance | PASS | targeted case/attack fixture |
| 12 | Draft may be wrong | PASS | targeted case/attack fixture |
| 13 | Draft may omit known material | PASS | targeted case/attack fixture |
| 14 | Draft does not mutate Case File truth | PASS | targeted case/attack fixture |
| 15 | Draft does not rewrite source | PASS | targeted case/attack fixture |
| 16 | Review is explicit | PASS | targeted case/attack fixture |
| 17 | Review may miss defect | PASS | targeted case/attack fixture |
| 18 | Review completed ≠ error-free | PASS | targeted case/attack fixture |
| 19 | Revision preserves prior draft | PASS | targeted case/attack fixture |
| 20 | Finalization is organizational state | PASS | targeted case/attack fixture |
| 21 | SubmissionAttempt explicit | PASS | targeted case/attack fixture |
| 22 | Submission preserves document version | PASS | targeted case/attack fixture |
| 23 | Strong argument ≠ accepted filing | PASS | targeted case/attack fixture |
| 24 | Weak argument ≠ rejected filing | PASS | targeted case/attack fixture |
| 25 | Procedural validity ≠ substantive strength | PASS | targeted case/attack fixture |
| 26 | Deadline status requires explicit rule/context | PASS | targeted case/attack fixture |
| 27 | Attachment reference ≠ inclusion | PASS | targeted case/attack fixture |
| 28 | Attachment inclusion ≠ admission | PASS | targeted case/attack fixture |
| 29 | Admission/reception ≠ truth | PASS | targeted case/attack fixture |
| 30 | Filing ≠ service | PASS | targeted case/attack fixture |
| 31 | Service ≠ agreement | PASS | targeted case/attack fixture |
| 32 | CourtRecord requires explicit materialization | PASS | targeted case/attack fixture |
| 33 | Draft cannot directly enter CourtRecord | PASS | targeted case/attack fixture |
| 34 | Submission cannot auto-enter CourtRecord | PASS | targeted case/attack fixture |
| 35 | CourtRecord assertion ≠ fact finding | PASS | targeted case/attack fixture |
| 36 | Amendment preserves history | PASS | targeted case/attack fixture |
| 37 | Withdrawal preserves history | PASS | targeted case/attack fixture |
| 38 | Supersession preserves lineage | PASS | targeted case/attack fixture |
| 39 | Parallel drafts remain separate | PASS | targeted case/attack fixture |
| 40 | Merge requires explicit work | PASS | targeted case/attack fixture |
| 41 | Partner approval ≠ truth | PASS | targeted case/attack fixture |
| 42 | Partner approval ≠ filing acceptance | PASS | targeted case/attack fixture |
| 43 | Client approval ≠ truth/correctness | PASS | targeted case/attack fixture |
| 44 | Direct/delegated same ontology | PASS | targeted case/attack fixture |
| 45 | No universal DraftingScore | PASS | targeted case/attack fixture |
| 46 | No hidden weighted formula | PASS | targeted case/attack fixture |
| 47 | Exceptional lawyer ≠ error-free oracle | PASS | targeted case/attack fixture |
| 48 | Clear procedural results deterministic | PASS | targeted case/attack fixture |
| 49 | Borderline result materialized once | PASS | targeted case/attack fixture |
| 50 | Reload does not reroll | PASS | targeted case/attack fixture |
| 51 | Cure/resubmission creates new attempt | PASS | targeted case/attack fixture |
| 52 | Old rejected attempt remains historical | PASS | targeted case/attack fixture |
| 53 | Hidden future result not player-visible | PASS | targeted case/attack fixture |
| 54 | Filing does not directly modify JII | PASS | targeted case/attack fixture |
| 55 | Filing does not directly modify CourtFactFinding | PASS | targeted case/attack fixture |

## 13. Contradiction audit

DEC-025 내부 및 direct Accepted DEC-024/023/021/020/019/018 경계와의 모순을 점검했다. DEC-022/TEST-021은 v0.1 Proposed boundary 참고일 뿐 direct dependency가 아니며 witness semantics는 소비하지 않는다. Draft/truth, state-stage, procedural/substantive, attachment/admission, filing/service, history, reroll, capability, approval, CourtRecord/JII/finding bypass와 fabricated Korean procedure는 모두 거부된다.

## 14. False-PASS audit

PASS는 DEC-025 semantic boundary와 fixture-declared rule에만 근거한다. Korean form/deadline/jurisdiction, admissibility, service, judge reaction, merits correctness를 발명하지 않았다.

## 15. False-PARTIAL audit

Core case에는 semantic ambiguity가 없다. TBD인 taxonomy, deadlines, filing API, editor, AI, schema, capability와 court procedure는 PARTIAL 근거가 아니다.

## 16. Remaining TBD / NOT TESTED

- document taxonomy and Korean forms
- deadlines, jurisdiction, filing/service/admission rules
- broad procedural defect and exhibit requirements beyond the authored VS-005 package rule
- signature/authorization/client approval
- Drafting/Review capability mapping
- text generation, UI/editor, NPC AI
- broad CourtRecord admission and judge-consideration mechanics beyond the accepted VS-005 materialization gate
- save/schema/API/Godot
- balancing/performance

## 16.1 VS-005 closure cases (65–84)

이 절은 DEC-025 §12.1의 exact implementation boundary만 검증한다. Fixture rule은 synthetic authored DATA이며 한국 법률·법원 절차를 주장하지 않는다.

| Case | Fixture / attack | Expected and observed result | Verdict |
|---:|---|---|---|
| 65 | Dependency-status audit | DEC-022/TEST-021 actual headers are v0.1 Proposed; DEC-025 records them only as non-consuming boundary references. No witness semantic is required by VS-005. | PASS |
| 66 | Selected Argument only | Current Argument and ArgumentSelectionEvent exist, but no completed Drafting Task/WorkProduct is supplied. No FinalizedDocument, attempt, result or record object appears. | PASS |
| 67 | FinalizedDocument provenance | Completed DraftWorkProduct version plus selected ArgumentSelectionEvent and authorized typed refs create one immutable FinalizedDocument preserving exact IDs/versions; it has no filing effect. | PASS |
| 68 | Finalization does not submit | Reading or finalizing the document creates no SubmissionAttempt or ProceduralResult. | PASS |
| 69 | Attempt/result separation | Valid attempt creation freezes document/version, actor/team, matter/stage, target/route, package, rule and deadline-context refs; result remains absent until a separate command. | PASS |
| 70 | Complete authored package | Exact required members are present. Separate evaluation materializes exactly one `accepted_for_record`; no CourtRecord entry is created. | PASS |
| 71 | Missing required member | A known required member is omitted from an otherwise valid package. Attempt is retained and separate evaluation creates `rejected_defective` with `missing_required_package_member` and exact missing IDs. | PASS |
| 72 | Validation failure atomicity | Unknown/reused ID, mismatched ID-version, unauthorized actor/team, wrong matter/stage/target/route, foreign package member or invalid order creates no attempt/result/event/entry and changes no journal state. | PASS |
| 73 | Historical-version attack | Materialize `(DOC-LINE-1, v1)` from one completed DraftWorkProduct, then a real later `(DOC-LINE-1, v2)` from a distinct completed DraftWorkProduct ID/version pair with matching lineage scope. Both immutable versions remain stored and readable; a new SubmissionAttempt may still reference exact pair `(DOC-LINE-1, v1)`. `(DOC-LINE-1, v3)` is rejected atomically because that pair is absent. Creating `DOC-LINE-2` would be a separate document and does not satisfy this revision case. | PASS |
| 74 | Result allowlist attack | `pending`, `filed`, `served`, `admitted`, `withdrawn`, `superseded` and arbitrary result strings cannot materialize in VS-005. Absence of a result record represents not-yet-resolved. | PASS |
| 75 | Merits/procedure laundering | Strong/weak Argument, capability, review and approvals cannot alter complete-package → `accepted_for_record` or missing-member → `rejected_defective`. | PASS |
| 76 | Accepted result without inclusion command | `accepted_for_record` alone creates no RecordMaterializationEvent or CourtRecordEntry. Reads, redraw and reload also create none. | PASS |
| 77 | Explicit matching materialization | Exact document/attempt/result plus matching RecordInclusionRule and fresh event/entry IDs atomically append one RecordMaterializationEvent and one CourtRecordEntry with all required provenance. | PASS |
| 78 | Rejected result materialization attack | `rejected_defective` is ineligible and cannot create an event or entry. State and journal remain unchanged. | PASS |
| 79 | Inclusion-rule mismatch attack | Wrong result kind, matter/stage, document type, target or route causes atomic rejection with neither event nor entry. | PASS |
| 80 | Duplicate cardinality attack | Duplicate finalized composite pair, reassignment of a lineage ID to an unrelated document, second result for an attempt, reused event/record ID, or second materialization of the same result/rule pair is rejected without mutation. Repeating one allocated `document_id` across its own version records is a lineage reference, not ID reuse. | PASS |
| 81 | Projection isolation | Mutating returned package members, provenance arrays or CourtRecordProjection nesting cannot change authoritative records or history. | PASS |
| 82 | Determinism/no-reroll | Same authored content and commands reproduce result and event order without gameplay RNG; repeated reads/reload append nothing. | PASS |
| 83 | Later correction history | A later valid FinalizedDocument/attempt/result does not rewrite or delete an earlier defective attempt, package snapshot or result. Generic cure/amendment semantics are not required. | PASS |
| 84 | VS-006 leakage attack | Materialization creates no Contribution, Criterion, admissibility result, JII, ChoicePoint, judge interpretation, CourtFactFinding, adjudication, Judgment or appeal state; UI may say recorded, not considered/believed/adopted. | PASS |

Closure arithmetic: 20 PASS + 0 PARTIAL + 0 FAIL = 20. No semantic ambiguity, contradiction or VS-006 dependency was found in the accepted VS-005 slice.

## 17. Final verification summary

```text
Total core cases: 84
PASS: 84
PARTIAL: 0
FAIL: 0
```

PARTIAL cases: none  
FAIL cases: none  
Arithmetic: 84 + 0 + 0 = 84.

- DEC-025 reopen required: No.
- Internal contradiction: None found.
- Inherited boundary violation: None.
- Draft/truth, hidden correction, stage collapse: None.
- Accepted/CourtRecord and CourtRecord/judge-considered collapse: None.
- Procedural/substantive laundering: None.
- Review/perfection, attachment/admission, filing/service collapse: None.
- History/version loss, cure overwrite, parallel auto-merge, capability/approval oracle: None.
- Reload reroll and hidden future-outcome leak: None.
- Fabricated Korean procedure: None.
- Issue blocking DEC-025 promotion: None; v0.2 is Accepted.
- Issue blocking DEC-026: None.

## 18. Promotion record

```text
DEC-025 v0.3 Accepted
TEST-024 v0.3 Accepted / manual fixture-level verification
```

Design review accepted both documents after the original 64 cases and the 20 VS-005 closure cases passed at manual fixture level. This is not an implementation-test result.

## 19. Next DEC recommendation

`DEC-026 — Task Assignment / Workload / Team Coordination`을 다음 후보로 평가한다. Investigation, Evidence Review, Interview, Legal Research, Synthesis와 Drafting이 모두 explicit Task family가 되었으므로 다음 구조적 공백은 who/when/capacity/review/priority/concurrency다.

## 20. Decision history

| Version | Status | Change |
|---|---|---|
| v0.1 | Proposed / manual fixture-level verification | DEC-025의 64 core fixture, 55 invariant와 state/procedure/history audit를 수동 적용; 모든 case PASS, PARTIAL/FAIL 없음. |
| v0.2 | Accepted / manual fixture-level verification | Corrected the DEC-022/TEST-021 dependency audit and added 20 VS-005 closure cases for canonical records, the exact result allowlist, validation-versus-defect behavior, explicit atomic CourtRecord materialization, provenance, determinism and the VS-006 terminal boundary; 84 PASS, 0 PARTIAL, 0 FAIL total. |
| v0.3 | Accepted / manual fixture-level verification | Clarified Case 73 to require two real immutable versions in one stable document lineage, continued usability of the earlier pair, and atomic rejection only for an absent lineage/version pair; total remains 84 PASS, 0 PARTIAL, 0 FAIL. |
