# Decision 003 — Role Definitions: Full Agent Team

**Date:** 2026-03-05
**Status:** SUPERSEDED — 2026-04-12
**Superseded by:** `control/AGENT_ROLES.md` v1.2 and `control/CTO_ENGINEERING_STANDARDS.md`
**Decided by:** Simon Schwab (owner)

> **Note:** This decision document records the reasoning and role proposals that led
> to the formal definitions now in AGENT_ROLES.md v1.2. The proposals here were adopted.
> Read this for historical rationale; read AGENT_ROLES.md for the current operative definitions.
**Context session:** CTO advisory (Cowork), 2026-03-05

---

## Context

The standard currently defines one role fully (CTO) and defers Dev, PM, and Reviewer
to "when the standard is mature." This decision captures the full proposed role set,
the rationale for each split, and the open questions before formal definitions are
written into AGENT_ROLES.md.

The role breakdown is informed directly by reframe-app's actual working patterns —
specifically the failure modes observed when role boundaries were unclear (virtiofs
fallback contaminating pipeline code, parallel dev streams colliding, validation
being an afterthought rather than a gate).

---

## Proposed Role Set

### 1. CTO

**Current definition:** AGENT_ROLES.md v1.0 — advisory, governance, analysis, brief
authoring. Read-only operations autonomous. No production code.

**Gaps in current definition:** The CTO role as defined is reactive — it responds to
individual briefs. A full delivery CTO also does:

- **Delivery sequencing** — decides which DC comes next, dependency order, wave health.
  Produces periodic wave-level assessments, not just per-DC analysis.
- **Root cause analysis** — forensic tracing of regressions across multiple prior
  changes. Distinct from implementation. Requires reading across codebase history.
- **Cross-DC consistency** — actively reviewing whether decisions in DC-N are consistent
  with DC-N-3. Currently relies on SESSION_HEADER immutable constraints alone.
- **Brief quality gate** — before any brief goes to dev, CTO signs off that it is
  complete, unambiguous, has adequate negative constraints, and autonomous authority
  is correctly scoped. Currently missing as an explicit step.

**Action:** Expand AGENT_ROLES.md CTO definition to include these four functions.

---

### 2. Pipeline Dev

**Purpose:** Implements phase-level changes to the 5-phase pipeline — filter logic,
evidence collection, hypothesis generation, schema migrations, scoring changes.

**Scope boundary:**
- Works within scripts/, intelligence_core/, taxonomy data
- Local migrations autonomous; remote sync (Turso) is a checkpoint
- Does NOT touch infrastructure (DB connection layer, environment config, token mgmt)
- Does NOT touch frontend
- Does NOT run validation measurement — that is Test/Validation Dev's role

**Why separate from Infrastructure Dev:** The DC-W3-07d virtiofs fallback was added
to db_paths.py and graph_helpers.py by a CTO session doing pipeline analysis. It
contaminated shared infrastructure because there was no clean role boundary preventing
it. A Pipeline Dev brief that explicitly excludes infrastructure files prevents this.

**Handoff produces:** Pipeline output files (hypotheses.json, filtered register),
migration files, updated phase scripts. Measurement is NOT part of this role's output —
it hands off to Test/Validation Dev for that.

---

### 3. Infrastructure Dev

**Purpose:** Handles DB connection layer, Turso sync, environment configuration,
token management, GitHub Actions, deployment infrastructure.

**Scope boundary:**
- Works within: db_paths.py, graph_helpers.py, connection utilities, .env config,
  GitHub Actions workflows, scripts/admin/ sync utilities
- Does NOT touch pipeline phase logic
- Does NOT touch frontend
- Turso remote sync IS within this role's autonomous authority (it is the role's
  primary concern)

**Why separate from Pipeline Dev:** Infrastructure changes affect all pipeline runs
for all companies. A bad change to db_paths.py silently breaks everything. Keeping
this as a distinct role with its own brief and authority definition means the risk
classification is always MEDIUM/HIGH (shared infrastructure = ≥2 systems affected)
and the CTO always reviews before dev proceeds.

**Handoff produces:** Infrastructure change summary, migration sync confirmation,
token renewal confirmation, GitHub Actions run results.

---

### 4. Test / Validation Dev

**Purpose:** Runs measurement scripts, compares pipeline output against locked ground
truth, produces precision/recall reports, identifies regressions.

**Scope boundary:**
- Read-only against pipeline outputs and ground truth files
- Runs existing measurement scripts — does NOT modify them
- Does NOT make code changes
- Does NOT apply migrations
- Produces measurement reports only

**Why a distinct role:** Validation is currently bundled into pipeline dev briefs as
a final phase. This means the same session that made a change also validates it —
which reduces the independence of the check. A separate Validation Dev session that
reads the pipeline output and measures against ground truth provides a genuine
independent gate. It also means validation can run in parallel with CTO review of
the handoff, rather than sequentially.

**Handoff produces:** Measurement report (precision, recall, RETAIN count, WATCH count,
comparison to baseline), pass/fail against success criteria, regression flag if any.

---

### 5. Frontend Dev

**Purpose:** Implements the frontend application (WS-03 — pending). Separate from
all pipeline work.

**Scope boundary:**
- Works within the frontend codebase only
- Does NOT touch pipeline scripts, intelligence_core, or database layer
- API contract with backend is the only touch point — treated as a read-only interface

**Why separate:** WS-03 is a completely different codebase surface. Without a role
boundary, a dev session starting on frontend work might drift into pipeline territory
(or vice versa) when debugging integration issues.

**Status:** Pending — WS-03 not yet started. Full role definition deferred until
frontend work begins.

---

### 6. PM (Product Manager)

**Purpose:** Scope management, delivery tracking, brief authoring at the feature level
(not the implementation level), stakeholder communication.

**In the multi-agent context:**
- Authors GitHub Issues as structured briefs (using brief.schema.yaml)
- Maintains WAVE tracker and DELIVERY_ROADMAP
- Decides what goes into each wave and in what order
- Does NOT make architectural decisions — escalates to CTO
- Does NOT write implementation briefs — hands scope to CTO who authors the brief

**Distinction from CTO:** PM decides *what* gets built and *when*. CTO decides *how*
it gets built and *whether it's safe*. In a small team (like reframe-app), these
collapse into the human owner (Simon) + CTO session. As the project scales, PM becomes
a distinct agent role.

**Status:** Partially — currently handled by human + CTO. Formal definition deferred.

---

### 7. Reviewer

**Purpose:** Code review, validation gate enforcement, PR quality assessment.

**In the multi-agent context:**
- Reviews PRs against the System Impact Matrix (SIM) requirements
- Confirms brief's success criteria are met before PR is merged
- Checks that handoff artifact is complete and schema-valid
- Does NOT make implementation decisions — only validates against stated criteria

**Distinction from Test/Validation Dev:** Test/Validation Dev measures pipeline output
against ground truth (domain-specific). Reviewer validates that the PR itself meets
governance requirements (process-level).

**Status:** Currently handled by GitHub Actions (SIM enforcement workflow) + human.
Formal agent role definition deferred until PR volume justifies it.

---

## How Roles Interact — Full Delivery Lifecycle

```
Human (scope decision)
    ↓
PM / CTO (brief authoring + quality gate)
    ↓
Pipeline Dev (implementation)
    ↓  [handoff]
Test/Validation Dev (measurement, independent gate)
    ↓  [handoff — pass or regression flag]
CTO (cross-DC consistency check, brief quality gate for next DC)
    ↓  [if pass]
Infrastructure Dev (remote sync, deployment)
    ↓  [handoff]
Reviewer (PR review, SIM validation)
    ↓  [merge]
Human (confirm wave progress, set next scope)
```

Parallel stream (reframe-app current pattern):
- Pipeline Dev (WS-01 pipeline work) runs in parallel with
- Infrastructure Dev (Turso sync, token management, GitHub Actions)
- These are coordinated by CTO, not by the devs directly

---

## Schema Implications

The role definitions require updates to:

**handoff.schema.yaml** — `from_role` and `to_role` enums expand to:
`CTO | PIPELINE_DEV | INFRA_DEV | VALIDATION_DEV | FRONTEND_DEV | PM | REVIEWER | HUMAN`

**brief.schema.yaml** — add `assigned_role` field specifying which role executes the
brief. The `autonomous_authority` section is then role-aware (inherits from the role
definition, overridden per brief if narrower).

**AGENT_ROLES.md** — add a section per role following the existing CTO structure:
Authority / Scope Boundary / Escalation Triggers / Handoff Artifact / System Prompt Template.

---

## What This Does NOT Decide

- The exact system prompt template for each role — deferred to formal definition
- Whether Frontend Dev needs its own schema fields — deferred to WS-03 start
- Whether PM is a human role or an agent role in this team — currently human
- GitHub Actions automation for the validation gate — see Decision 004 (pending)

---

## Next Actions

1. Expand CTO definition in AGENT_ROLES.md with the four additional functions
2. Define Pipeline Dev and Infrastructure Dev formally — these are the two roles
   needed immediately for reframe-app Wave 3
3. Define Test/Validation Dev — needed before DC-W3-07d closes (validation is
   currently bundled into pipeline dev briefs)
4. Update handoff.schema.yaml and brief.schema.yaml with expanded role enums
5. Defer Frontend Dev, PM, Reviewer until needed
