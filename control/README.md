# ai-dev-control

The standard for multi-agent AI development governance. This repository defines how AI agents collaborate on software projects — how they communicate, maintain state, hand off work, and stay within scope.

It is not tied to any specific project. Project-level `/control` directories are adapted from this standard.

**Version:** 2.0 | **Updated:** 2026-04-12

---

## What Problem This Solves

Multi-agent AI development fails for five consistent reasons:

1. **Inconsistent state** — each session starts with a different understanding of what is true and what is in scope
2. **Scope creep** — agents default to being helpful, doing more than asked when instructions are ambiguous
3. **Cascading errors** — mistakes in early phases propagate silently with no validation gate
4. **Human bottlenecks** — agents pause for permission on decisions that should have been pre-authorized
5. **Handoff loss** — state and decisions made by one agent are not reliably available to the next

This system addresses all five through structure, not cleverness.

---

## Repository Structure

```
/control        — the governance standard (CTO engineering knowledge, role definitions, process docs)
/schemas        — YAML schemas for structured AI-to-AI communication
/templates      — ready-to-adapt files for new project /control directories
/examples       — populated examples and reference artefacts
/decisions      — record of decisions that shaped this standard
/projects       — one entry per project using this standard (_template/ is the starting point)
/docs           — handoffs produced during work on the standard itself
```

---

## How the Human Stays in the Loop

The human is the decision gate, not the data pipe.

**Old model:** Human copies prompt from CTO session → pastes to Dev terminal → copies output back.

**This model:** CTO commits a YAML handoff. Dev reads it at session start. The `human_loop.required_before_proceeding` field declares whether human review is needed before Dev acts. Everything else proceeds autonomously within pre-authorized scope. The human is pulled in at escalation points — not at every handoff.

---

## Key Documents

### The Governance Standard (`/control`)

| File | Purpose |
|---|---|
| `WORKING_PROCESS.md` | System orientation — the CTO↔Dev loop; where to start |
| `CONTROL_DIRECTORY.md` | Document map — what every file does and how they connect |
| `VISION.md` | Design principles; why the system is structured this way |
| `AGENT_ROLES.md` | Role definitions — CTO, Pipeline Dev, Infrastructure Dev, Validation Dev |
| `CTO_ENGINEERING_STANDARDS.md` | 10-domain engineering knowledge; phase framework; proactive CTO behaviours |
| `CTO_REVIEW_PROCESS.md` | 10-step protocol the CTO runs after every dev return handoff |
| `PROMPT_DISCIPLINE.md` | 7 prompt patterns applied throughout the system |
| `AUTONOMOUS_EXECUTION.md` | Pre-authorized action classes — eliminates unnecessary permission pauses |
| `GITHUB_STANDARD.md` | Branch naming, commit format, PR schema |

### The Schemas (`/schemas`)

| File | Purpose |
|---|---|
| `handoff.schema.yaml` | Canonical schema for AI-to-AI handoff artifacts |
| `brief.schema.yaml` | Canonical schema for engineering briefs |

### The Templates (`/templates`)

Copy into a new project's `docs/control/` directory. Fields marked `[PROJECT: ...]` are filled in per project.

| File | Purpose |
|---|---|
| `SESSION_START_PROMPT.md` | Role-aware session load order — CTO (9 steps) and Dev (4 steps) |
| `SESSION_END_PROMPT_CTO.md` | CTO session close — four session types (A/B/C/D) |
| `SESSION_END_PROMPT.md` | Dev session close — return handoff checklist |
| `HANDOFF_TEMPLATE.yaml` | CTO-to-dev brief template |
| `RETURN_HANDOFF_TEMPLATE.yaml` | Dev-to-CTO return handoff template |
| `TASKS_TEMPLATE.yaml` | Task register with meta block, join points, and cross-references |
| `SESSION_HEADER.md` | Governance constitution — role, authority, immutable rules |
| `SESSION_BOOTSTRAP_STABLE.md` | Load-once invariants — anchor goal, architectural facts |
| `SESSION_BOOTSTRAP_CURRENT.md` | Volatile session state — active DC, open blockers |
| `BRIEF_TEMPLATE.yaml` | Structured engineering brief |

### The Examples (`/examples`)

Real artefacts from production sessions, included as illustrative references.

---

## How to Start a New Project

1. Read `CLAUDE.md` — automatic session instructions for Claude Code
2. Read `ONBOARDING.md` — full orientation for CTO and dev sessions
3. Copy `projects/_template/` to `projects/{project-name}/` and fill it in
4. Copy `/templates` into the project repo's `docs/control/` directory
5. Fill in all `[PROJECT: ...]` fields
6. Do not modify this repository to fit the project — adapt the copies, preserve the standard

---

## Decisions

| # | Decision | Status |
|---|---|---|
| 001 | Bootstrap split — stable vs current session state | DECIDED |
| 002 | Structured YAML format for AI-to-AI communication | DECIDED |
| 003 | Role definitions — full agent team | SUPERSEDED by AGENT_ROLES.md v1.2 |

---

## Current Status

**Standard version:** 2.0
**Roles defined:** CTO, Pipeline Dev, Infrastructure Dev, Validation Dev
**Projects using this standard:** reframe-app
