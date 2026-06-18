> **ILLUSTRATIVE EXAMPLE** — This is a real project entry from reframe-app,
> included to show what a populated `projects/[project]/` directory looks like.
> The domain detail (pipeline metrics, Turso, BHP/LIT/CSL) is reframe-app specific.
> For the blank template, see: `projects/_template/`

# reframe-app

**Repo:** https://github.com/reframe-risk/reframe-app
**Owner:** Simon Schwab
**Status:** Active — Wave 3 in progress
**Standard version:** ai-dev-control v1.0 (adaptation in progress)

---

## What This Project Is

Reframe is a compliance intelligence system that converts company documents into
evidence-backed risk registers via a 5-phase pipeline. The pipeline produces
reality-based graph coverage of regulatory obligations across Australian listed companies.

**Anchor goal (ACHIEVED Feb 2026):**
Documents → evidence → risk registers backed by reality-based graph.

---

## Adaptation Notes

### Where reframe-app diverges from the standard

**Bootstrap:** Currently uses a single SESSION_BOOTSTRAP.md (55KB+, 31+ entries).
Migration to STABLE/CURRENT split is a pending bounded task — see
`handoffs/HANDOFF_CTO_HUMAN_BOOTSTRAP-SPLIT_2026-03-05.yaml` when created.

**Briefs:** Currently markdown prose. Migration to YAML schema briefs is the next
structural change after bootstrap split.

**Handoffs:** Currently text prompts copied manually by human. Migration to YAML
handoff artifacts is the highest priority change — eliminates human relay entirely.

**State ownership:** `current_state.yaml` update ownership TBD — see Decision 002.

### What's already implemented

- SESSION_HEADER.md with structured constraints and negative constraints ✅
- SESSION_START_PROMPT.md with explicit load order ✅
- SESSION_END_PROMPT.md with mandatory update checklist ✅
- WAVE3_TRACKER.md as delivery candidate tracker ✅
- Engineering briefs with "Do Not" and success criteria sections ✅
- Governance validation GitHub Action (PR-level SIM enforcement) ✅

---

## Current State

See `current_state.yaml` — updated by agent at session end.

---

## Active CTO Context

The CTO session for reframe-app holds the following standing context:

- 5-phase pipeline: Phase 2 (hypothesis generation) → Phase 3 (evidence collection)
  → Phase 4 (evidence filtering) → Phase 5 (risk register output)
- Universal obligations pathway (is_universal flag) implemented in Phase 2 and Phase 4
- Precision target: 85% (current best: 81.2% on LIT)
- Ground truth locked for CSL, LIT, BHP
- Turso token expires 2026-03-10 — renew urgently
- Wave 3 active: WS-01 (Precision), WS-02 (Watch Lane), WS-03 (Frontend),
  WS-04 (Multi-company)

---

## Pending Structural Tasks (in priority order)

1. **Bootstrap split** — migrate SESSION_BOOTSTRAP.md to STABLE/CURRENT
   (Decision 001, brief pending)
2. **YAML briefs** — migrate engineering briefs from markdown to schema format
3. **YAML handoffs** — first CTO session to produce YAML handoff instead of text prompt
4. **current_state.yaml** — create and wire into session end protocol
5. **GitHub Actions** — schema validation for briefs and handoffs

---

## How to Start a CTO Session for This Project

Load in this order:

1. `projects/reframe-app/current_state.yaml` — current metrics, active DC, blockers
2. `projects/reframe-app/README.md` — this file (project context)
3. `control/AGENT_ROLES.md` — CTO authority and scope boundary
4. `control/AUTONOMOUS_EXECUTION.md` — pre-authorized action classes
5. Then load from reframe-app repo: `docs/control/SESSION_HEADER.md`,
   `docs/control/SESSION_BOOTSTRAP_STABLE.md` (once split is done),
   active brief

Produce a YAML handoff artifact at session end following `schemas/handoff.schema.yaml`.
Commit to `projects/reframe-app/handoffs/` before closing session.
