# ONBOARDING.md — Start Here

**Version:** 2.0
**Updated:** 2026-04-12
**For:** Any CTO session arriving at this repo for the first time
**Repo:** https://github.com/reframe-risk/multi-agent
**Owner:** Simon Schwab

---

## What This Repo Is

This is the canonical standard for multi-agent AI development governance. It defines
how AI agents collaborate — how they communicate, maintain state, hand off work, and
stay within scope. It is project-agnostic. Individual projects adapt from this standard;
they do not modify it.

It is not a project. It has no codebase. It is the reference every project-level
`/control` directory is derived from.

For orientation on how the system works as a whole, read `control/WORKING_PROCESS.md`
first. For a map of every document and how they connect, read `control/CONTROL_DIRECTORY.md`.

---

## CTO Session Load Order

Load documents in this sequence at the start of every CTO session:

1. `control/WORKING_PROCESS.md` — how the CTO↔Dev loop works; where to start
2. `control/CONTROL_DIRECTORY.md` — document map; what each file does
3. `control/VISION.md` — design principles; why the system is structured this way
4. `control/AGENT_ROLES.md` — your role definition, authority, scope boundary,
   session load order, handoff artifact format
5. `control/CTO_ENGINEERING_STANDARDS.md` — 10-domain engineering knowledge library;
   phase framework; proactive CTO behaviours; remediation sequencing
6. `control/PROMPT_DISCIPLINE.md` — 7 patterns for brief authoring
7. `control/AUTONOMOUS_EXECUTION.md` — pre-authorized action classes

Then from the project repo:
8. `templates/SESSION_BOOTSTRAP_STABLE.md` (project's stable layer)
9. `templates/SESSION_BOOTSTRAP_CURRENT.md` (project's volatile state)
10. Check `docs/handoffs/` for any pending handoff addressed to CTO
11. Active brief (path in current_state.yaml → active_work.brief_path)

The full annotated load order is in `templates/SESSION_START_PROMPT.md`.

---

## Dev Session Load Order

1. `templates/SESSION_HEADER.md` (project's governance rules)
2. `templates/SESSION_BOOTSTRAP_STABLE.md` (project's stable layer)
3. Active brief (HANDOFF_CTO_DEV_{DC}_{DATE}.yaml from docs/handoffs/)
4. `templates/SESSION_END_PROMPT.md`

---

## Key Documents at a Glance

| Document | What it is |
|---|---|
| `control/WORKING_PROCESS.md` | System orientation; CTO↔Dev loop |
| `control/CONTROL_DIRECTORY.md` | Document map; full flow diagram |
| `control/VISION.md` | Design principles |
| `control/AGENT_ROLES.md` | Role definitions; authority; session types |
| `control/CTO_ENGINEERING_STANDARDS.md` | Engineering domain knowledge; phase framework |
| `control/CTO_REVIEW_PROCESS.md` | 10-step post-return review protocol |
| `control/PROMPT_DISCIPLINE.md` | 7 brief-authoring patterns |
| `control/AUTONOMOUS_EXECUTION.md` | Pre-authorized action classes |
| `templates/SESSION_START_PROMPT.md` | Role-aware session load order (CTO + Dev) |
| `templates/SESSION_END_PROMPT_CTO.md` | CTO session close; four session types |
| `templates/SESSION_END_PROMPT.md` | Dev session close; return handoff checklist |
| `templates/HANDOFF_TEMPLATE.yaml` | CTO-to-dev brief template |
| `templates/RETURN_HANDOFF_TEMPLATE.yaml` | Dev-to-CTO return handoff template |
| `templates/TASKS_TEMPLATE.yaml` | Task register with meta block and join points |

---

## Communication Contracts

Every handoff between agents uses a structured YAML artifact — not prose. The schemas:

- `schemas/handoff.schema.yaml` — every handoff artifact
- `schemas/brief.schema.yaml` — every engineering brief

Real populated examples (from reframe-app — domain-specific but illustrative):
- `examples/HANDOFF_CTO_DEV_DC-W3-07D_2026-03-05.yaml`
- `examples/DC_W3_07d_ENGINEERING_BRIEF.yaml`
- `examples/projects/reframe-app/` — example project entry (README + current_state)

---

## Starting a New Project

1. Copy `projects/_template/` to `projects/{project-name}/`
2. Fill in README.md (what the project is, adaptation notes, CTO context)
3. Fill in current_state.yaml (adapt metric fields to the project)
4. Create `projects/{project-name}/handoffs/` directory
5. First CTO session reads this directory, then loads from the project repo

---

## What Every CTO Session Produces

Every session closes with committed artifacts — no exceptions:

**Type A (brief authoring):** HANDOFF_CTO_DEV_{DC}_{DATE}.yaml committed to project's `docs/handoffs/`

**Type B (return review):** Updated TASKS.yaml, current_state.yaml, SESSION_BOOTSTRAP_CURRENT.md

**Type C (architecture/planning):** ADR or planning document committed to project repo

**Type D (standards assessment):** Domain gap scan table + remediation tasks added to TASKS.yaml

Full detail in `templates/SESSION_END_PROMPT_CTO.md`.

---

## Decisions Log

The `/decisions` directory records why the standard is the way it is.
Read before proposing changes to the standard.

| # | Decision | Status |
|---|---|---|
| 001 | Bootstrap split — stable vs current | DECIDED |
| 002 | Structured YAML format for AI-to-AI communication | DECIDED |
| 003 | Role definitions — full agent team | SUPERSEDED by AGENT_ROLES.md v1.2 |

---

## Key Rules (Non-Negotiable)

- Projects are adapted **toward** this standard, not the other way around
- Do not modify this repo to fit a specific project — adapt the project's copies
- Every CTO session ends with a committed artifact — no exceptions
- `human_loop.required_before_proceeding: true` means stop and wait
- Decisions are recorded in `/decisions` before changes are made to the standard
- TASKS.yaml is updated by the CTO, not by dev sessions
