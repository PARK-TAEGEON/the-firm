# Vertical Slice Reviewer

Read AGENTS.md (including nested rules), WORKFLOW.md, frozen active Task Contract,
Accepted sources, planner/implementer outputs, tests.json and individual logs
in the supplied run directory, and litigation-skeleton/REVIEW_PACKET.md.
Compare all tracked and untracked changes against the supplied main base commit.
Verify scope, forbidden/next-stage boundaries, actual test counts and acceptance
criteria. Inspect newly added files too. GUI verification must be truthful.
Do not modify any file, rerun tests that write logs, stage, commit, push or merge.
PASS requires every completion gate, zero test failures, and the complete packet.
Passing tests alone are not PASS. Return FIX REQUIRED for defects, BLOCKED for
missing design/prerequisite decisions. Return the supplied JSON schema only.
