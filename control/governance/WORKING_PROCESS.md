# WORKING_PROCESS.md — System Overview, Artifact Pipeline, and CTO↔Dev Loop

**Version:** 2.0
**Created:** 2026-04-12
**Last Updated:** 2026-05-20 — artifact pipeline, autonomous loop, skill integration added
**Status:** ACTIVE — template for new projects; adapt [PROJECT] markers
**Purpose:** Orientation document for a new CTO. Describes what this system is, how the
artifact pipeline produces scope, how the CTO↔Dev governance loop works, and how to
run the loop autonomously.

---

## What This System Is

[PROJECT: one paragraph describing what this project builds and what its output is.
Be specific: not "a platform" but "a system that does X and produces Y for Z consumer."]

[PROJECT: describe the architecture in terms of its layers or major components.
Example structure:]

```
Layer 1 — [name] ([database or store])
  [What lives here. Who owns it. What can write to it.]

Layer 2 — [name] ([database or store])
  [What lives here. Who owns it. What can write to it.]

Layer 3 — [name] ([separate repo or service])
  [What lives here. How it consumes Layers 1 and 2.]
```

**Current state:** [PROJECT: one sentence on where the project is — what is working,
what is in progress, what is next.]

**Production URL:** [PROJECT: primary URL for verification and QA, or "not yet deployed"]

---

## Artifact Pipeline

Before the CTO↔Dev loop can run, the project needs scope. Scope is produced through
a pipeline of artifacts, each feeding the next. Skills from the engineering toolkit
are mapped to each stage (see `SKILL_ROLE_MAP.md` for full integration details).

```
/setup-matt-pocock-skills          one-time project bootstrap
       ↓
/grill-with-docs → CONTEXT.md     shared domain language (feeds everything)
       ↓
/prototype (optional)              flush out design uncertainty before committing
       ↓
/to-prd → PRD (PRD_TEMPLATE.md)   product-level "what and why"
       ↓
Scope doc (SCOPE_TEMPLATE.md)      engineering phases, gates, end-state criteria
       ↓
/to-issues → TASKS.yaml           vertical slices with acceptance criteria
       ↓
/triage → prioritise + assign     P0-P3, ready-for-agent vs ready-for-human
       ↓
CTO-Dev loop begins               (see below)
```

**CONTEXT.md** is the shared language document. It defines domain terms, relationships,
and flagged ambiguities. It is produced by `/grill-with-docs` and updated as a side
effect of architecture scans and CTO reviews. Format: `CONTEXT-FORMAT.md` from the
grill-with-docs skill.

**PRD** is optional for owner-led projects (owner can go straight to scope doc). It is
required when product requirements need formalisation before engineering can scope.
Template: `PRD_TEMPLATE.md`.

**Scope doc** is the engineering plan. It defines origin narrative, architectural
decisions, end-state criteria (the gates), phase structure, and task breakdown.
Template: `SCOPE_TEMPLATE.md`.

**TASKS.yaml** is the atomic task register derived from the scope doc's phases.
Each task has `source_refs` linking back to its scope doc section.

---

## The CTO↔Dev Loop

Work proceeds in a repeating cycle. The human owner sits above the loop, approving
scope phase transitions and decisions that exceed CTO autonomous authority.

```
Human owner
    ↓ scope approval / explicit instruction
CTO session
    — reads task register, current state, QA inspection, scope doc
    — applies engineering standards (CTO_ENGINEERING_STANDARDS.md)
    — authors a brief (HANDOFF_CTO_DEV_{DC-ID}_{DATE}.yaml)
    ↓ brief committed to docs/handoffs/
Dev session
    — reads brief (self-contained — no external doc reading required)
    — implements within brief's authority boundaries
    — produces tests (mandatory for feature/fix DCs — SESSION_HEADER.md Rule 0)
    — runs local validation (tests, queries, gates)
    ↓ return handoff committed (HANDOFF_DEV_CTO_{DC-ID}_{DATE}.yaml)
CTO return review
    — follows CTO_REVIEW_PROCESS.md (10-step protocol)
    — verifies test artifacts, success criteria, scope compliance
    — updates TASKS.yaml + current_state.yaml
    — optionally runs /improve-codebase-architecture if shallow_drift detected
    ↓ /control docs updated, PR approved
Human owner
    — confirms DC closed, approves any escalation decisions
```

Each iteration of the loop is called a **Delivery Candidate (DC)**. DCs are numbered
by task ID: DC-T125 = task T-125 from TASKS.yaml.

---

## Autonomous Loop (AFK Operation)

The CTO↔Dev loop can run autonomously using an orchestrator (sandcastle or equivalent).
In autonomous mode, the human owner is not in the loop for each DC — they approve
scope up front and are notified only when the loop halts.

```
Human owner
    ↓ scope approved, TASKS.yaml populated, loop started
┌─── Autonomous Loop ──────────────────────────────────────────────┐
│  CTO agent (CTO_AUTONOMOUS_SESSION.md):                          │
│    1. Check for unreviewed dev return → review if found           │
│    2. Pick next eligible task (P0 > P1, unblocked, assignee=dev)  │
│    3. Author brief (self-contained, tests required)               │
│    4. Commit brief to docs/handoffs/                              │
│                                                                   │
│  Dev agent (DEV_AUTONOMOUS_SESSION.md):                           │
│    1. Load governance rules + brief                               │
│    2. Execute: /tdd (feature) or /diagnose (bug fix)              │
│    3. Produce tests + return handoff                              │
│    4. Commit code + tests + return to branch                      │
│                                                                   │
│  CTO agent (review iteration):                                    │
│    1. Review return (10-step protocol)                             │
│    2. Verify tests, SCs, scope compliance                         │
│    3. Check halt conditions (HALT_CONTRACT.yaml)                  │
│    4. If APPROVE → update /control, pick next task                │
│    5. If AMEND → rewrite brief, loop back to dev                  │
│    6. If HALT triggered → stop and notify human                   │
└───────────────────────────────────────────────────────────────────┘
    ↓ halt condition triggered
Human owner
    — reviews accumulated changes, resolves halt, resumes or stops
```

**Key documents for autonomous operation:**
- `CTO_AUTONOMOUS_SESSION.md` — CTO agent prompt with task selection + review logic
- `DEV_AUTONOMOUS_SESSION.md` — Dev agent prompt with skill integration
- `HALT_CONTRACT.yaml` — explicit stop conditions (test failures, scope violations, etc.)
- `SKILL_ROLE_MAP.md` — which skills each role uses and when

**Halt conditions** are deliberately conservative. The loop stops on:
- Dev returns BLOCKED or with failing SCs
- No tests produced for feature/fix DCs
- Existing test suite regression
- Files changed outside brief scope
- Same DC amended twice without resolution
- No eligible P0/P1 tasks remaining
- Scope complete (all end-state criteria met)
- Maximum iteration limit reached (default: 5 cycles)

---

## The Key Documents

### Entry Points — start here every CTO session

| Document | What it is | Where |
|---|---|---|
| `TASKS.yaml` | Authoritative forward-looking task register. Meta block links every other document. **Start here.** | `docs/control/` |
| `current_state.yaml` | Backward-looking operational record. DB metrics, completed DCs, handoff history. Read alongside TASKS.yaml. | `docs/control/` |
| `[ACTIVE_QA_INSPECTION].md` | QA walkthrough covering current scope. Open items and next-scope candidates. | `docs/control/` |
| `[ACTIVE_SCOPE_DOC].md` | Governing scope. Defines what "done" means for the current scope. | `docs/control/` |

### The Join Point

Three fields must stay consistent between TASKS.yaml and current_state.yaml.
If they disagree, current_state.yaml is authoritative for DC status;
TASKS.yaml is authoritative for task status.

```
TASKS.yaml                              current_state.yaml
meta.last_closed_dc                ↔   last_completed_dc.id
meta.pending_cto_review            ↔   active_dc.status
meta.active_scope.final_dc_pending ↔   active_dc.id
```

### Session Governance

| Document | What it is | Who reads it |
|---|---|---|
| `SESSION_START_PROMPT.md` v4.0 | Role-aware load order. CTO path (9 steps) vs Dev path (4 steps). | CTO + Dev, session start |
| `SESSION_END_PROMPT.md` | Dev session close checklist. Mandatory DB verification queries. | Dev, session close |
| `SESSION_END_PROMPT_CTO.md` | CTO session close checklist. Mandatory outputs by session type. Join point verification. | CTO, session close |
| `SESSION_HEADER.md` | Immutable governance rules (risk thresholds, self-approval policy, layer boundary). | Dev, session start (step 1) |
| `SESSION_BOOTSTRAP_STABLE.md` | Load-once architectural invariants. Completed waves, closed decisions, key file locations. | CTO + Dev |
| `SESSION_BOOTSTRAP_CURRENT.md` | Narrative layer — active DC, recent work, open blockers. Not metrics (those are in current_state.yaml). | CTO + Dev |

### Process Docs

| Document | What it is |
|---|---|
| `AGENT_ROLES.md` | CTO authority, scope, and escalation boundaries. Dev role definitions. |
| `CTO_ENGINEERING_STANDARDS.md` | Phase framework (Foundation→Production) + 10 engineering domains. CTO applies at every session start. |
| `CTO_REVIEW_PROCESS.md` | 10-step return handoff review protocol. Three-way reconciliation of tasks, QA doc, and scope doc. |
| `CONTROL_DIRECTORY.md` | Complete document map — every file in docs/control/, who reads it, when, how it fits. |
| `WORKING_PROCESS.md` | This document. Orientation for a new CTO. |

### Handoffs

```
docs/handoffs/
  HANDOFF_CTO_DEV_{DC-ID}_{DATE}.yaml    — CTO brief issued to dev
  HANDOFF_DEV_CTO_{DC-ID}_{DATE}.yaml    — dev return to CTO (outcome + verification)
  RETURN_TEMPLATE.yaml                    — template for dev return handoffs
  archive/                                — all prior handoffs
```

The brief YAML must include: DC-ID, scope, success criteria, autonomous authority
boundaries (including explicit `files_in_scope`), `source_refs` linking to scope doc,
inlined context, testing section, self-check queries, and escalation triggers.

The return handoff must include: outcome, files changed, `test_artifacts` (mandatory
for feature/fix DCs), DB state (exact values from verification queries), open items,
`control_update_data` block, and `related_tasks` field (which TASKS.yaml entries
this DC addresses).

### Skill Integration

Engineering skills are mapped to roles and loop phases. See `SKILL_ROLE_MAP.md`
for full details. Summary:

| Skill | Role | When |
|-------|------|------|
| `/tdd` | Dev | Default execution pattern for feature DCs |
| `/diagnose` | Dev | Execution pattern for bug fix DCs |
| `/zoom-out` | Dev | Orientation when touching unfamiliar code |
| `/improve-codebase-architecture` | CTO | Post-review scan when shallow_drift detected |
| `/grill-with-docs` | Human + CTO | Domain language maintenance (updates CONTEXT.md) |
| `/to-prd` | Human + CTO | PRD authorship (input to scope doc) |
| `/to-issues` | CTO | Task breakdown from scope doc to TASKS.yaml |
| `/triage` | CTO | Task prioritisation before loop starts |

---

## CTO Session Load Order

Full detail in `SESSION_START_PROMPT.md`. Summary:

1. `TASKS.yaml` — task register (entry point, links all docs)
2. `current_state.yaml` — DB metrics, active DC, completed work
3. `[ACTIVE_QA_INSPECTION].md` — open items + next-scope candidates
4. `[ACTIVE_SCOPE_DOC].md` — end-state criteria + what was broken
5. `AGENT_ROLES.md` — CTO authority and scope
6. `CTO_ENGINEERING_STANDARDS.md` — produce phase narrative + domain gap scan
7. `SESSION_BOOTSTRAP_STABLE.md` — architectural invariants
8. `SESSION_BOOTSTRAP_CURRENT.md` — rolling current state
9. Check `docs/handoffs/` for any DEV_TO_CTO return newer than last CTO_TO_DEV

**At session start, the CTO must produce:**
- One-paragraph phase narrative (where the project sits in Foundation→Production)
- QA sign-off status
- Scope end-state criteria status
- Pending review flag
- Active task summary with priorities
- Domain gaps surfaced by CTO_ENGINEERING_STANDARDS.md scan

---

## Where a New CTO Starts

**Step 1:** Read `TASKS.yaml` meta block. It links every other document and
gives you the current state in one place.

**Step 2:** Read the active QA inspection (Part 5: open items, Part 8: next-scope candidates).

**Step 3:** Read the active scope doc (Section 1: end-state criteria).

**Step 4:** Read `CTO_ENGINEERING_STANDARDS.md` and produce a phase narrative.

**Step 5:** Check `docs/handoffs/` for any unreviewed dev return. If found,
execute `CTO_REVIEW_PROCESS.md` before any new brief work.

---

## Archive

Completed scope docs, trackers, and briefs live in `docs/control/archive/`:

```
archive/
  scopes/       — completed scope docs
  trackers/     — superseded tracker files (do not update)
  inspections/  — superseded QA inspections
  briefs/       — completed delivery briefs
```

The root of `docs/control/` always contains only active documents.
Completed scope docs and inspections move to archive when superseded.

---

**Document Status:** TEMPLATE — replace [PROJECT] markers when adapting for a new project
**Owner:** CTO
**Review:** Update after each scope transition or when the governance loop changes
