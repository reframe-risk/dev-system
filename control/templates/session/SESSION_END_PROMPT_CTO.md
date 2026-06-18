# SESSION_END_PROMPT_CTO.md

**Version:** 1.0
**Created:** 2026-04-12
**Usage:** Paste at the end of every CTO session. Complete all sections before closing.

---

End-of-session governance check for CTO sessions. The mandatory outputs differ
depending on session type. Determine your session type first, then complete the
relevant sections.

---

## Session Type

Identify which type this session was before completing the checklist:

**Type A — Brief authoring session:** CTO wrote a new brief for a dev session.
**Type B — Return review session:** CTO reviewed a dev return handoff.
**Type C — Architecture/planning session:** CTO produced analysis, ADRs, or proposals.
**Type D — Standards assessment session:** CTO produced phase narrative and gap scan.

A session may be more than one type. Apply all relevant sections.

---

## Section 1 — Mandatory for ALL session types

### 1a. Session Summary
One paragraph: what was the session scope, what was decided or produced, what changed.

### 1b. Join Point Verification
The following three fields must be consistent between TASKS.yaml and current_state.yaml.
Verify and correct if they disagree.

```
TASKS.yaml                           current_state.yaml
meta.last_closed_dc             ↔    last_completed_dc.id
meta.pending_cto_review         ↔    active_dc.status
meta.active_scope.final_dc_pending ↔ active_dc.id
```

State: "Join point verified — consistent" or list what was corrected.

### 1c. Standards Gaps Surfaced
List any engineering standards gaps identified from CTO_ENGINEERING_STANDARDS.md,
with phase/domain reference. If none: "None surfaced this session."

---

## Section 2 — Type A: Brief Authoring Session

### 2a. Brief produced
- DC identifier: [DC-ID]
- Brief path: `docs/handoffs/HANDOFF_CTO_DEV_{DC-ID}_{DATE}.yaml`
- Risk classification: LOW / MEDIUM / HIGH
- Systems affected: [count and list]
- Human approval required before dev starts: YES / NO

### 2b. TASKS.yaml update
- [ ] Task status updated to ACTIVE for this DC
- [ ] `meta.pending_cto_review` cleared (no pending review outstanding)
- [ ] `meta.last_closed_dc` unchanged (brief authored, not closed)

### 2c. Quality gate
Before handing to dev, confirm the brief contains:
- [ ] Explicit file paths (no vague references)
- [ ] Success criteria verifiable in under 5 minutes without full pipeline run
- [ ] `do_not` section completed
- [ ] Self-check list included
- [ ] Phase structure: at least 2 phases with validation gate between them
- [ ] Autonomous authority boundaries explicit

---

## Section 3 — Type B: Return Review Session

Complete CTO_REVIEW_PROCESS.md before this section. This section records the outcome.

### 3a. DC outcome
- DC identifier: [DC-ID]
- Outcome: ACCEPTED / ACCEPTED WITH CONDITIONS / RETURNED FOR REWORK
- Conditions or rework required: [or "None"]

### 3b. TASKS.yaml updates
- [ ] DC task closed (moved to done section)
- [ ] New tasks added from open_items in return handoff
- [ ] `meta.last_closed_dc` updated
- [ ] `meta.pending_cto_review` cleared

### 3c. current_state.yaml updates
- [ ] `last_completed_dc` updated
- [ ] `active_dc` updated (next DC or null)
- [ ] DB metrics updated from return handoff verification queries
- [ ] Open blockers updated

### 3d. Scope progress
- Which of the active scope's end-state criteria does this DC satisfy?
- Is the scope now complete? If yes: flag for human approval before closing.

---

## Section 4 — Type C: Architecture/Planning Session

### 4a. Artefacts produced
List all documents produced with paths:
- ADRs: [list with paths]
- Proposals: [list with paths]
- Analysis docs: [list with paths]

### 4b. Decisions made
List decisions that are now closed ground:
- [Decision]: [rationale in one sentence] — immutable: YES / NO

### 4c. TASKS.yaml updates
- [ ] Any tasks addressed by this session updated
- [ ] New tasks added if analysis surfaced new work

---

## Section 5 — Type D: Standards Assessment Session

### 5a. Phase narrative
State the project's current position in the Foundation → Production framework.
Include: which phase the project is in, what justifies that classification,
and what the phase transition criteria are.

### 5b. Domain gap scan results
For each of the 10 domains in CTO_ENGINEERING_STANDARDS.md, state:
GREEN (satisfies standard) / YELLOW (partial) / RED (gap) / N/A

| Domain | Status | Gap description |
|---|---|---|
| 1. Database and Schema Design | | |
| 2. Layer Separation | | |
| 3. Migration Safety | | |
| 4. Observability | | |
| 5. CI/CD and Automation | | |
| 6. Brief Quality and Dev Handoff | | |
| 7. Secrets and Token Management | | |
| 8. Data Lifecycle and Provenance | | |
| 9. Architecture Decision Records | | |
| 10. Legacy Hygiene | | |

### 5c. Remediation tasks
List any remediation tasks to be added to TASKS.yaml with priority classification.

---

## Section 6 — CTO Session Handoff Artifact (mandatory)

Every CTO session must produce a handoff artifact. Format:

```yaml
# HANDOFF_CTO_SESSION_{DATE}.yaml
date: [DATE]
session_type: [A / B / C / D — may be multiple]
session_summary: >
  [one paragraph]

decisions:
  - description: [decision]
    rationale: [one sentence]
    immutable: [true / false]

artifacts_produced:
  - name: [document name]
    path: [path]
    status: FINAL / DRAFT

standards_gaps_surfaced:
  - domain: [domain name]
    severity: [P0 / P1 / P2]
    description: [one sentence]

tasks_updated:
  closed: [list of DC-IDs]
  opened: [list of task IDs]

open_questions:
  - question: [question]
    owner: HUMAN / CTO / DEV
    blocks: [what it blocks]

do_not:
  - [what the next agent must not do]
```

---

## Section 7 — Stop

- ❌ Do NOT propose next steps
- ❌ Do NOT suggest follow-on work
- ❌ Do NOT expand scope
- ❌ Do NOT open a new brief in the same session without explicit human instruction

Produce the handoff artifact. Await explicit instruction.

---

## Governance Compliance Checklist

- [ ] Session type identified
- [ ] Session summary written
- [ ] Join point verified (TASKS.yaml ↔ current_state.yaml)
- [ ] Standards gaps surfaced (or "none")
- [ ] TASKS.yaml updated (tasks closed/opened)
- [ ] current_state.yaml updated (if Type B)
- [ ] Brief quality gate passed (if Type A)
- [ ] CTO_REVIEW_PROCESS.md completed (if Type B)
- [ ] Handoff artifact produced ⭐ MANDATORY
- [ ] STOPPED — awaiting explicit instruction ⭐ MANDATORY
