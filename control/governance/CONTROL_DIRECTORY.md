# CONTROL_DIRECTORY.md — Document Map and Consumption Guide

**Version:** 2.0
**Created:** 2026-04-12
**Last Updated:** 2026-05-20 — v2.0 templates added (autonomous loop, scope, PRD, skills)
**Status:** ACTIVE — template; adapt [PROJECT] markers for new projects
**Purpose:** Single reference showing every document in docs/control/, what it is,
who reads it, and exactly where in the process it gets consumed.

---

## How to use this document

When starting a new CTO session or onboarding a new agent, use this to understand
what each document does and why it exists. It answers: "which document do I need
right now, and how does it connect to the others?"

---

## Document Map

### The Entry Point

**`TASKS.yaml`** — *Read this first, every CTO session*

The single entry point for understanding current project state. Tells you:
- What is open (tasks), what is done, and what is blocked
- Which scope is active and its completion status (`meta.active_scope`)
- Which QA inspection covers the current scope (`meta.qa_inspection`)
- Where every governance document lives (`meta.governance_docs`)
- Which QA open items map to which tasks
- Which next-scope candidates are tracked vs not yet tracked

**Everything else in this directory is referenced from TASKS.yaml's meta block.**
You should never need to hunt for a document — the meta block tells you where it is.

---

### Operational State (what is true right now)

| Document | What it is | Who reads it | When |
|---|---|---|---|
| `TASKS.yaml` | Open task register + meta cross-references | CTO (step 1 of session start) | Every CTO session, first |
| `current_state.yaml` | Machine-readable project metrics — DB state, active DC, key counts | CTO (step 2), Dev (after brief) | Every session start |
| `SESSION_BOOTSTRAP_CURRENT.md` | Human-readable rolling current state — active DC narrative, recent work, open blockers | CTO (step 6), Dev for context | Every session start |
| `SESSION_BOOTSTRAP_STABLE.md` | Architectural invariants — closed decisions that do not change session to session | CTO (step 5), Dev (step 2) | Every session start |

---

### Scope and QA (what was built and what "done" means)

| Document | What it is | Who reads it | When |
|---|---|---|---|
| `[ACTIVE_QA_INSPECTION].md` | Full accounting of completed scope. Numbered checks, open items, next-scope candidates. QA sign-off block. | CTO (step 2b), Human (QA walkthrough) | CTO session start; QA walkthrough with human; next-scope planning |
| `[ACTIVE_SCOPE_DOC].md` | Active scope — defines what "done" means. Section 1 = end-state criteria. | CTO (step 2c) | CTO session start; DC sign-off; scope transition |

**How these connect to TASKS.yaml:**
- Every QA open item maps to a task via `meta.qa_inspection.open_items_in_qa`
- Every next-scope candidate is listed in `meta.qa_inspection.scope_candidates_from_qa`
- Every scope end-state criterion is in `meta.active_scope.end_state_criteria`

When a scope completes and a new scope opens:
1. New scope doc created: `docs/control/[SCOPE-NAME].md`
2. Old scope doc moves to: `docs/control/archive/scopes/`
3. New QA inspection created at scope close
4. Old QA inspection moves to: `docs/control/archive/inspections/`
5. TASKS.yaml meta updated to point to both new documents

---

### Governance Process (how work gets done)

| Document | What it is | Who reads it | When |
|---|---|---|---|
| `SESSION_START_PROMPT.md` | Session start instructions — CTO load order (9 steps) + Dev load order (4 steps) | CTO and Dev | Pasted at start of every session |
| `SESSION_END_PROMPT.md` | Dev session close — DB verification queries, return handoff format, mandatory checklist | Dev | Before closing every dev session |
| `SESSION_END_PROMPT_CTO.md` | CTO session close — session type classification, join point verification, mandatory outputs | CTO | Before closing every CTO session |
| `CTO_REVIEW_PROCESS.md` | Return handoff review — 10 steps from load to /control update. Three-way reconciliation (Step 7). | CTO | After every dev return handoff received |
| `WORKING_PROCESS.md` | Full CTO→Dev→CTO loop overview. System orientation. | New CTO onboarding; process audits | Reference; not read every session |

---

### Role Definitions (who does what)

| Document | What it is | Who reads it | When |
|---|---|---|---|
| `AGENT_ROLES.md` | CTO authority, scope boundary, escalation triggers. Dev role definitions. Skill integration. Handoff artifact formats. Load order. | CTO (step 3), Dev at role init | Every CTO session start; when starting a dev session |
| `CTO_ENGINEERING_STANDARDS.md` | Engineering standards — Phase framework (Foundation→Production), 10 domain knowledge sections, proactive CTO behaviour | CTO (step 4) | Every CTO session — produces phase narrative and domain gap scan |
| `SESSION_HEADER.md` | Immutable governance rules — Rule 0 (testing), criticality system, risk thresholds, self-approval policy | Dev (step 1 of dev load order) | Every dev session start |
| `SKILL_ROLE_MAP.md` | Maps engineering skills (tdd, diagnose, zoom-out, etc.) to agent roles. Defines artifact pipeline and integration points. | CTO (reference), Dev (execution patterns) | Brief authorship; new project setup |

---

### Scope and Planning Templates (how scope is defined)

| Document | What it is | Who reads it | When |
|---|---|---|---|
| `SCOPE_TEMPLATE.md` | Engineering scope with origin narrative, architectural decisions, end-state criteria, phase structure, OQs | CTO (authoring scope), Human (approving scope) | Scope creation; scope transitions |
| `PRD_TEMPLATE.md` | Product requirements — problem, solution, user stories, implementation decisions. Input to scope authoring. | CTO + Human | Before scope creation (optional — owner can go direct to scope) |
| `CURRENT_STATE_TEMPLATE.yaml` | Machine-readable project state — DB metrics, scope status, test suite, deployment, session log | CTO (every session), Dev (after brief) | Every session start |

---

### Handoffs (artefacts that move work between agents)

| Location | What it contains | Who writes it | Who reads it |
|---|---|---|---|
| `docs/handoffs/HANDOFF_CTO_DEV_{DC-ID}_{DATE}.yaml` | CTO brief — task definition, file scope, success criteria, autonomous authority, testing section, inlined context, source_refs | CTO | Dev at session start |
| `docs/handoffs/HANDOFF_DEV_CTO_{DC-ID}_{DATE}.yaml` | Dev return — outcome, files changed, test_artifacts, DB state, open items, control_update_data, related_tasks | Dev | CTO (CTO_REVIEW_PROCESS.md) |
| `docs/handoffs/RETURN_TEMPLATE.yaml` | Template for dev return handoffs | — | Dev, before writing return |

---

### Autonomous Loop (AFK operation)

| Document | What it is | Who reads it | When |
|---|---|---|---|
| `CTO_AUTONOMOUS_SESSION.md` | Self-contained CTO prompt for autonomous loop — load order, review protocol, task selection, brief authorship, sandcastle variables | CTO agent (orchestrator) | Each CTO iteration in autonomous loop |
| `DEV_AUTONOMOUS_SESSION.md` | Self-contained dev prompt for autonomous loop — governance loading, skill-based execution (tdd/diagnose), mandatory testing, structured return | Dev agent (orchestrator) | Each dev iteration in autonomous loop |
| `HALT_CONTRACT.yaml` | 11 explicit stop conditions (HALT-001 through HALT-011) — test failures, scope violations, blocked returns, iteration limits | Orchestrator (sandcastle) | After each loop iteration |

---

### Archive (historical record — not read in normal sessions)

| Location | What it contains |
|---|---|
| `docs/control/archive/scopes/` | Completed scope docs |
| `docs/control/archive/trackers/` | Superseded tracker files — do not update |
| `docs/control/archive/inspections/` | Superseded QA inspections |
| `docs/control/archive/briefs/` | Completed delivery briefs |

---

## The Document Flow

```
CTO session start
    │
    ├── 1. TASKS.yaml ──────────────────── tells you: what's open, scope status,
    │       │                              QA status, where all other docs are
    │       ├── meta.active_scope ───────► [ACTIVE_SCOPE_DOC].md
    │       ├── meta.qa_inspection ──────► [ACTIVE_QA_INSPECTION].md
    │       └── meta.governance_docs ────► all docs below
    │
    ├── 2. current_state.yaml ──────────── metrics, active DC, blockers
    ├── 2b. [ACTIVE_QA_INSPECTION] ─────── open items, next-scope candidates
    ├── 2c. [ACTIVE_SCOPE_DOC] ─────────── end-state criteria
    ├── 3. AGENT_ROLES.md ──────────────── CTO authority boundary
    ├── 4. CTO_ENGINEERING_STANDARDS.md ── phase narrative + domain gaps
    ├── 5. SESSION_BOOTSTRAP_STABLE.md ─── architectural invariants
    ├── 6. SESSION_BOOTSTRAP_CURRENT.md ── rolling current state
    ├── 7. docs/handoffs/ ──────────────── check for unreviewed dev return
    └── 8. Active brief (if one exists)

CTO writes brief ──► docs/handoffs/HANDOFF_CTO_DEV_{DC-ID}_{DATE}.yaml

Dev session
    ├── SESSION_HEADER.md
    ├── SESSION_BOOTSTRAP_STABLE.md
    ├── Active brief
    └── SESSION_END_PROMPT.md

Dev writes return ──► docs/handoffs/HANDOFF_DEV_CTO_{DC-ID}_{DATE}.yaml

CTO review (CTO_REVIEW_PROCESS.md)
    ├── Steps 1–6: verify outcome, files, DB state, do_not compliance
    ├── Step 7a: close task in TASKS.yaml
    ├── Step 7b: add new tasks from open_items
    ├── Step 7c: reconcile QA inspection + scope doc ──► keeps all three in sync
    ├── Step 8: update /control in sequence
    └── Steps 9–10: notify human, write CTO session handoff
```

---

## When a New Scope Starts

When the active scope is declared complete and a new scope opens:

1. New scope doc written: `docs/control/[SCOPE-00X-NAME].md`
2. Old scope doc moves to: `docs/control/archive/scopes/`
3. New QA inspection created: `docs/control/[QA_INSPECTION_{DATE}].md`
4. Old QA inspection moves to: `docs/control/archive/inspections/`
5. `TASKS.yaml` meta updated:
   - `meta.active_scope` → new scope name and path
   - `meta.qa_inspection` → new QA inspection path (or "pending")
   - New scope tasks added; completed tasks remain in done section

The root of `docs/control/` always contains exactly one active scope doc and
one active QA inspection. Everything else is in archive.

---

**Document Status:** TEMPLATE — replace [PROJECT] markers when adapting
**Owner:** CTO
**Review Frequency:** When a new scope starts or a governance document is added
