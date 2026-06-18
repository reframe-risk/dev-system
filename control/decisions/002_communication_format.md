# Decision 002 — Structured AI-to-AI Communication Format

**Date:** 2026-03-05
**Status:** DECIDED — schema defined, templates created
**Decided by:** Simon Schwab (owner)
**Context session:** CTO advisory (Cowork), 2026-03-05

---

## The Three Questions That Prompted This Decision

**1. Streamlining the human relay**

The current workflow requires the human to manually copy prompts between CTO (Cowork
session) and Dev (terminal session). The human is acting as the data pipe — carrying
output from one agent to the next. This introduces friction, fidelity loss, and
unnecessary interruption.

The fix: CTO writes output directly to a structured file committed to the repo. Dev
reads from that file at session start. The human moves from data pipe to decision gate
— present at escalation points, not at every handoff.

**2. Prompts as the communication format**

Free-text prompts are the right format for human-to-AI communication. They are not
the right format for AI-to-AI communication. When an agent reads prose, it interprets
it — and interpretation is where variance enters. Two runs of the same prompt can
produce different behaviour.

The better format for AI-to-AI communication is a structured artifact with a fixed
schema. Explicit fields, typed values, required vs optional declared, no implicit
structure that requires interpretation. Closer to a function call than a letter.

**3. /control docs vs GitHub as state layer**

Markdown documents in `/control` are optimised for human readability. State consumed
by agents should be optimised for agent reliability — explicit schema, typed fields,
machine-readable status.

GitHub already provides better primitives for volatile state:
- Issues: structured, queryable, closeable — better than a brief in a markdown file
- Commit history: better session log than a manually updated markdown document
- PR status: better handoff gate than a prose handoff artifact
- Actions: better validation gates than human checkpoints

**Direction (not yet fully implemented):**
- `/control` retains stable governance documents (vision, rules, role definitions,
  architectural invariants) — prose is appropriate here
- Volatile state (active DC, current metrics, open blockers) moves toward GitHub
  Issues and Actions
- Handoffs between agents use structured YAML files, not prose prompts
- Briefs use YAML front-matter for machine-readable fields + prose only for rationale

---

## What Is Decided Now

The immediate decision is the structured handoff format. This is the highest-value
change because it directly eliminates the human relay problem.

**Handoff format:** YAML file with strict schema (see `/schemas/handoff.schema.yaml`)
**Brief format:** YAML front-matter + minimal prose for rationale only
(see `/schemas/brief.schema.yaml`)

**Open question (not yet decided):** Whether to move BOOTSTRAP_CURRENT to GitHub
Issues/Actions entirely, or keep it as a structured YAML file in the repo. This
depends on how the GitHub workflow automation is set up. Deferred to Decision 003.

---

## The Split Model

This decision introduces a "split model" for state and communication:

**Structured (machine-readable):** Handoffs, briefs, session state, metrics, DC status
→ YAML schema files. Read by agents directly. No interpretation required.

**Document (human-readable):** Governance rules, architectural rationale, vision,
role definitions, decisions like this one → Markdown prose. Read by humans and agents
for context, not for instruction.

The distinction: if an agent needs to act on the content, it should be structured.
If a human needs to understand the content, it can be prose.

---

## What This Does NOT Change

- SESSION_HEADER.md — remains prose (governance rules are human-authored and
  human-reviewed; prose is appropriate)
- VISION.md, AGENT_ROLES.md, PROMPT_DISCIPLINE.md — remain prose (reference documents)
- DECISIONS/ — remain prose (reasoning and rationale are for humans)
- The governance rules themselves — no change
