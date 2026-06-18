# VISION.md — AI Dev Control Standard

**Version:** 1.1
**Created:** 2026-03-05
**Last Updated:** 2026-04-12 — standard updated to reflect implemented practice
**Status:** ACTIVE — canonical reference, not project-specific

---

## What This Is

This repository defines the ideal standard for multi-agent AI development teams operating
on software projects. It is not tied to any specific project. It is the reference that
project-level `/control` directories are adapted from.

When starting a new project or auditing an existing one, this repo is the baseline.
Projects are adapted toward this standard, not the other way around.

---

## The Core Problem This Solves

Most AI-assisted development fails not because the models are incapable, but because
the operational structure around them is weak. Specifically:

- **Inconsistent state** — each session starts with a different understanding of what
  is true, what is complete, and what is in scope
- **Scope creep** — agents default to being helpful, which means they do more than
  asked when instructions are ambiguous
- **Cascading errors** — mistakes in early steps propagate silently through later steps
  with no validation gate to catch them
- **Human bottlenecks** — agents pause for permission on decisions that should have
  been pre-authorized, consuming the human's time on low-value confirmations
- **Handoff loss** — state and decisions made by one agent are not reliably available
  to the next

This system addresses all five failure modes through structure, not cleverness.

---

## Design Principles

**1. Prompt discipline over prompt cleverness**
The gap between average and expert AI output is not model intelligence — it is how
well the prompt defines constraints, scope, and expected behaviour. Every document
in this system is an exercise in prompt discipline.

**2. Volatility separation**
Information that changes every session must be separated from information that changes
rarely. Mixing them causes both to become untrustworthy. The bootstrap split (stable
vs current) is the primary application of this principle.

**3. Pre-authorization over permission requests**
Agents should arrive at a session knowing what they are allowed to do autonomously.
The human's role is to define scope at brief time, not to approve individual actions
during execution. Every unnecessary permission request is a failure of brief design.

**4. Negative constraints are first-class**
Every brief must define what the agent must NOT do, not just what it should do.
The most plausible wrong action is more dangerous than an implausible one. Negative
constraints block it before it happens.

**5. Handoffs are structured artifacts, not messages**
When one agent's work becomes another agent's input, that boundary must have an
explicit schema. Informal handoffs are where state gets lost. The handoff artifact
is as important as the work itself.

**6. Validation gates between phases**
Complex tasks are decomposed into phases. Each phase produces a validated artifact
before the next phase begins. Errors surface early, when they are cheap to fix.

**7. GitHub as the persistent state layer**
Local session state is volatile. GitHub — branches, PRs, issues, commit history —
is the durable record that survives context resets, agent handoffs, and session ends.
The control system is designed to treat GitHub as the source of truth, not a destination.

---

## What This Repository Contains

### /control
The standard documents that define how the system works:
- `VISION.md` — this document
- `AGENT_ROLES.md` — role definitions, authority boundaries, escalation rules, load order
- `CTO_ENGINEERING_STANDARDS.md` — engineering knowledge base: phase framework + 10 domains
- `CTO_REVIEW_PROCESS.md` — 10-step return handoff review protocol
- `WORKING_PROCESS.md` — CTO↔Dev loop overview and system orientation
- `CONTROL_DIRECTORY.md` — document map: every file, who reads it, when
- `PROMPT_DISCIPLINE.md` — the 7 patterns as a living reference standard
- `AUTONOMOUS_EXECUTION.md` — pre-authorized action classes by role
- `GITHUB_STANDARD.md` — branch naming, PR format, handoff artifact schema

### /templates
Ready-to-adapt files for new project `docs/control/` directories:
- `SESSION_START_PROMPT.md` v4 — role-aware CTO path (9 steps) + Dev path (4 steps)
- `SESSION_END_PROMPT.md` — dev session close checklist
- `SESSION_END_PROMPT_CTO.md` — CTO session close, session type classification
- `SESSION_HEADER.md` — immutable governance rules
- `SESSION_BOOTSTRAP_STABLE.md` — architectural invariants template
- `SESSION_BOOTSTRAP_CURRENT.md` — rolling current state template
- `TASKS_TEMPLATE.yaml` — task register with meta block and cross-references
- `HANDOFF_TEMPLATE.yaml` — CTO-to-dev brief template
- `RETURN_HANDOFF_TEMPLATE.yaml` — dev-to-CTO return handoff template
- `BRIEF_TEMPLATE.yaml` — engineering brief with all 7 patterns built in

### /decisions
A record of decisions that shaped this standard — so they do not have to be
re-derived in future sessions, and so the reasoning is available when adapting
the standard to specific projects.

---

## What This Repository Is NOT

- It is not a project. It has no codebase, no pipeline, no delivery candidates.
- It is not a living system that gets updated every session. It is updated when
  the standard itself evolves — when a new pattern is validated, a new role is
  defined, or a decision changes the structure.
- It is not prescriptive about technology stack, domain, or team size. It defines
  the governance and operational layer, not the implementation layer.

---

## How to Use This When Starting a New Project

1. Copy `/templates` into the new project's `docs/control/` directory
2. Fill in the project-specific fields in each template (marked with `[PROJECT: ...]`)
3. Read `AGENT_ROLES.md` and adapt the authority boundaries to the project's risk profile
4. Record the adaptation decisions in the project's own `/decisions` directory
5. Do not modify this repository to fit the project — adapt the copies, preserve the standard

---

## Evolution

This standard evolves through decisions, not drift. When a pattern is refined,
a new role is added, or a structural change is validated in practice, a decision
record is added to `/decisions` and the relevant standard document is updated.

The standard should always reflect best current practice, not historical compromise.
