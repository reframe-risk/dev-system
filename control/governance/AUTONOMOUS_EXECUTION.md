# AUTONOMOUS_EXECUTION.md — Pre-Authorized Action Classes

**Version:** 1.0
**Created:** 2026-03-05
**Status:** ARCHIVED REFERENCE (2026-05-20)

> **Note:** As of v2.0, autonomous authority is embedded directly in each brief
> via the `autonomous_authority` section of `HANDOFF_TEMPLATE.yaml` and
> `BRIEF_TEMPLATE.yaml`. For autonomous loop operation, see
> `CTO_AUTONOMOUS_SESSION.md` and `DEV_AUTONOMOUS_SESSION.md`.
>
> This document is retained as a reference for understanding the *rationale*
> behind action classification. Use it when writing new briefs — the categories
> and examples here inform what to put in `autonomous_authority.may_proceed`
> vs `must_checkpoint`.

---

## The Problem This Solves

Agents pause for permission when they encounter decisions their brief did not anticipate.
This is the "press enter" problem: a human is interrupted to approve an action that
should have been pre-authorized at brief time.

The fix is not a tooling flag alone. It is defining, before the session starts, which
classes of action the agent can take without pausing — and which require a checkpoint.
This document defines those classes by role. Each brief and session header should embed
the relevant section verbatim.

---

## How to Use This Document

When writing a brief or session header:

1. Copy the relevant role's **Autonomous Execution Authority** section
2. Add any project-specific extensions in the brief's own authority section
3. Add any brief-specific restrictions in the brief's "Do Not" section

The authority defined here is the **default floor**. Briefs can narrow it (restrict
further) but should not widen it without explicit owner approval.

---

## CTO — Autonomous Execution Authority

The following action types require no confirmation. Execute immediately:

**Read operations — always autonomous**
- Any shell command that reads without writing:
  `grep`, `cat`, `ls`, `find`, `head`, `tail`, `wc`, `diff`
- Any flag that produces help or version output: `--help`, `--version`, `-h`
- `git log`, `git diff`, `git status`, `git show`, `git branch`
- `git stash list`, `git remote -v`
- Database SELECT queries (read-only)
- Reading any file in the repository
- Running existing measurement, audit, or reporting scripts when invoked with
  read-only arguments

**Diagnostic pipeline runs — autonomous when explicitly flagged as diagnostic**
- Running a single pipeline phase in diagnostic mode if the brief specifies it
- Re-running measurement scripts to capture current state

**Document production — always autonomous**
- Writing any proposal, analysis, brief, or decision document to `/control` or
  `/docs` as a new file
- Updating `WAVE3_TRACKER.md` status fields when a delivery candidate is confirmed
  complete by the brief's success criteria

---

The following actions require a checkpoint — stop and surface to human before proceeding:

**Write operations outside documents**
- Any modification to production code files
- Any database write, INSERT, UPDATE, DELETE, or schema migration
- Any file deletion

**Remote operations**
- Any `git push`
- Any sync to Turso or other remote database
- Any deployment or publish action

**Structural decisions**
- Creating a new workstream, delivery wave, or architectural system
- Modifying an immutable governance rule
- Changing a risk threshold
- Any action that affects more than 2 systems (MEDIUM/HIGH risk boundary)

**Ambiguous scope**
- Any action not clearly covered by the brief
- Any action that would require re-opening a completed delivery candidate
- Any action where the CTO session discovers undocumented prior changes

---

## Dev — Autonomous Execution Authority

*(To be defined when the Dev role is formally added to AGENT_ROLES.md)*

**Interim guidance for dev sessions (embed in brief):**

Adapt the following to the specific brief's risk profile. These are starting-point
defaults, not fixed rules:

```
## Autonomous Execution Authority (this session)

Proceed without pausing for:
- Read-only commands: grep, cat, ls, git log, git diff, git status, --help flags
- Running existing test suites and measurement scripts
- Reading any file in the repository
- Writing new files to /docs, /scripts/admin, or paths specified in this brief
- Modifying files explicitly named in this brief's scope

Stop and surface to human before:
- Applying any database migration to Turso (remote sync)
- Modifying shared infrastructure files used across all pipeline runs
- Deleting any file
- Running the full pipeline for more than the company/companies specified in this brief
- Any action not described in this brief
```

---

## Rationale for Common "Press Enter" Cases

The following are the most common unnecessary permission pauses and why they should
be pre-authorized:

| Command class | Example | Why autonomous | Risk |
|---|---|---|---|
| Help flags | `turso --help \| grep upload` | Read-only diagnostic. No side effects. | None |
| Git status/log | `git status`, `git log --oneline -10` | Read-only. No side effects. | None |
| File reads | `cat scripts/phase4/filter.py` | Read-only. Essential for CTO analysis. | None |
| Grep | `grep -r "is_universal" scripts/` | Read-only search. No side effects. | None |
| Measurement scripts | `python3 scripts/admin/measure_ground_truth.py --code CSL` | Read-only output. No DB writes. | None |
| SELECT queries | `SELECT COUNT(*) FROM compliance_requirements WHERE is_universal=1` | Read-only. Diagnostic. | None |
| Listing files | `ls docs/control/`, `find . -name "*.py" -type f` | Read-only. Navigation. | None |

These commands should never require confirmation. If an agent is pausing on these,
the session header's autonomous execution authority section is missing or incomplete.

---

## Embedding in a Brief

Every engineering brief should include a section formatted as follows:

```markdown
## Autonomous Execution Authority

Proceed without pausing for:
- [list from role defaults above, narrowed or extended for this brief]

Stop and surface to human before:
- [list from role defaults above, extended with brief-specific restrictions]
```

This section appears after "Context" and before "Task" in the brief. It is read
by the agent at session start and governs the entire session's execution behaviour.
