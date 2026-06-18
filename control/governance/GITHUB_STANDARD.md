# GITHUB_STANDARD.md — GitHub Integration Standard

**Version:** 1.0
**Created:** 2026-03-05
**Status:** ACTIVE — reference standard for all projects using this control system

---

## Role of GitHub in This System

GitHub is the persistent state layer. Local session state is volatile — it does not
survive context resets, agent handoffs, or session ends. GitHub survives all three.

The control system is designed to treat GitHub as the source of truth, not a destination
for finished work. This means:

- Decisions are recorded as commits or decision docs, not just chat output
- Work in progress has a branch — it is never just "local"
- Handoffs between agents happen via structured artifacts committed to the repo
- The state of any delivery candidate can be determined from GitHub without asking
  an agent to recall it

---

## Branch Naming

All branches follow this convention:

```
{type}/{dc-identifier}-{short-description}
```

**Types:**
- `feat/` — new capability or delivery candidate implementation
- `fix/` — bug fix or correctness improvement
- `docs/` — control document changes only (no code)
- `chore/` — infrastructure, migration, or admin work
- `cto/` — CTO advisory output (proposals, analysis — no code changes)
- `governance-test/` — smoke test branches (NEVER merge to main)

**Examples:**
```
feat/dc-w3-01b-universal-obligations
fix/dc-w3-07d-bhp-productivity-recall
docs/bootstrap-split-implementation
cto/dc-w3-07d-analysis
governance-test/phase2-blocking-behaviour
```

**Rules:**
- Branch names are lowercase and hyphen-separated
- DC identifier included whenever work relates to a specific delivery candidate
- `governance-test/` branches are NEVER merged to main — this is enforced by
  SESSION_HEADER.md and must be repeated in every brief involving test branches

---

## Commit Message Convention

```
{type}({scope}): {imperative description}
```

**Types:** `feat`, `fix`, `docs`, `chore`, `refactor`, `test`

**Scope:** the system or file area affected — `phase4`, `phase2`, `schema`, `control`,
`taxonomy`, `pipeline`, `admin`

**Examples:**
```
feat(phase4): Add universal obligation gate before evidence filter
fix(phase2): Add CHEMICAL_OPERATIONS trigger handler
docs(control): Bootstrap split — create STABLE and CURRENT documents
chore(schema): Apply migration 021 universal obligations pathway
```

**Rules:**
- Imperative mood ("Add", "Fix", "Update" — not "Added", "Fixed", "Updates")
- No period at end
- Scope is mandatory — it is the primary navigation tool in git log
- One logical change per commit — do not bundle unrelated changes

---

## Pull Request Format

Every PR must include a System Impact Matrix (SIM) table and a structured description.

### PR Description Template

```markdown
## Summary

[One to three sentences describing what this PR does and why.]

## Delivery Candidate

[DC identifier and name, or "N/A — infrastructure/docs change"]

## System Impact Matrix

| System | Impact | Justification | Owner |
|---|---|---|---|
| [System 1] | IMPACTED / INDIRECTLY AFFECTED / NOT AFFECTED | [≥10 chars] | [@owner] |
| [System 2] | ... | ... | ... |
[All systems must be listed — no omissions]

## Risk Classification

- **Level:** LOW / MEDIUM / HIGH
- **Rationale:** [one sentence]
- **Systems impacted:** [count]

## Verification

[What was run to confirm this works. Test command sequence. Measurement output.]

## What This Does NOT Change

[Explicit list of things that might seem in scope but are not.]
```

### Risk Thresholds (standard — adapt per project)

- **LOW:** <2 systems affected — no approvals required
- **MEDIUM:** ≥2 systems affected — owner approvals required
- **HIGH:** ≥3 systems IMPACTED — owner approvals required, auto-escalation

---

## Handoff Artifact Schema

When one agent's work becomes another agent's input, that boundary is a handoff.
Handoffs are committed to the repo as structured documents — not left as chat output.

### Location

Handoff artifacts live in `docs/handoffs/` and are named:

```
HANDOFF_{FROM-ROLE}_{TO-ROLE}_{DC-IDENTIFIER}_{DATE}.md
```

Example: `HANDOFF_CTO_DEV_DC-W3-07D_2026-03-05.md`

### Schema

```markdown
# Handoff: {FROM} → {TO}

**Date:** YYYY-MM-DD
**From:** {agent role and session identifier}
**To:** {agent role — next session}
**DC:** {delivery candidate identifier}
**Brief:** {path to engineering brief}

---

## What Was Decided

- [Decision 1 with rationale]
- [Decision 2 with rationale]

## What Was Produced

| Artifact | Path | Status |
|---|---|---|
| [name] | [path] | Draft / Final / Committed |

## Current State

- Local DB: [migration status, row counts if relevant]
- Remote (Turso/GitHub): [sync status]
- Pipeline: [last run result if applicable]
- Branch: [current working branch]

## Files Changed (this session)

| File | Change type | Notes |
|---|---|---|
| [path] | Created / Modified / Deleted | [one line] |

## Open Questions (must be resolved before dev proceeds)

- [Question 1]
- [Question 2]

## Do Not (carry forward from brief)

- [Negative constraint 1]
- [Negative constraint 2]

## Risk Classification

- Level: LOW / MEDIUM / HIGH
- Rationale: [one sentence]
```

---

## Issues as Brief Source

GitHub Issues are the preferred home for engineering briefs when a project uses
GitHub for task tracking. An issue-as-brief follows this template:

**Labels:** `brief`, `{workstream}`, `{priority}`

**Body:**

```markdown
## Problem Statement
[Measured, not estimated. Root cause identified.]

## Phases
### Phase 1: [name]
Output: [defined artifact]
Validation: [how to confirm Phase 1 is correct before Phase 2 begins]

### Phase 2: [name]
...

## Autonomous Execution Authority
[Copy from AUTONOMOUS_EXECUTION.md, narrowed for this task]

## Do Not
- [Negative constraint 1]
- [Negative constraint 2]

## Success Criteria
- [ ] [Measurable outcome 1]
- [ ] [Measurable outcome 2]

## Self-Check Before Closing
- [ ] [Verification step 1]
- [ ] [Verification step 2]

## What This Does NOT Cover
[Explicit scope boundary]
```

Closing the issue (with a linked PR) completes the delivery candidate loop.

---

## Autonomous Git Operations by Role

### CTO — autonomous
- `git log`, `git diff`, `git status`, `git show`, `git branch`, `git stash list`
- `git remote -v`

### CTO — checkpoint required
- Any `git push`
- `git commit` (CTO produces proposals only; commits are dev's responsibility)
- `git merge`, `git rebase`
- Creating or closing a PR

### Dev — autonomous (standard defaults, adapt per brief)
- All read operations above
- `git add {specific files}` (not `git add .` — always stage named files)
- `git commit` on the working branch for this brief
- `git push origin {working-branch}` (push to own branch, never to main)

### Dev — checkpoint required
- `git push origin main` — always requires owner confirmation
- Force push of any kind
- Merging a PR
- Deleting a branch

---

## What GitHub Does NOT Replace

GitHub is the persistent state layer, not the governance layer. The following remain
in `/control` documents:

- Immutable governance rules — SESSION_HEADER.md
- Architectural invariants — SESSION_BOOTSTRAP_STABLE.md
- Active delivery candidate status — SESSION_BOOTSTRAP_CURRENT.md and WAVE3_TRACKER.md
- Role authority boundaries — AGENT_ROLES.md

GitHub records what happened. `/control` documents define what is allowed to happen.
