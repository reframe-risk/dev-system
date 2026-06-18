# Decision 001 — Bootstrap Split: Stable vs Current

**Date:** 2026-03-05
**Status:** DECIDED — pending implementation in reframe-app
**Decided by:** Simon Schwab (owner)
**Proposed by:** CTO advisory session (reframe-app, 2026-03-05)

---

## Context

SESSION_BOOTSTRAP.md in the reframe-app `/control` directory had grown to 55KB+
containing 31+ chronological session entries. It mixed two categories of information
with fundamentally different volatility:

- Architectural invariants and completed wave history — changes rarely, if ever
- Current metrics, active DC, recent commits, open blockers — changes every session

The result was a document that was too large to reliably load in full, where every
session update risked corrupting stable information, and where agents had to parse
the entire document to find what was actually current.

---

## Decision

Split SESSION_BOOTSTRAP.md into two documents:

**SESSION_BOOTSTRAP_STABLE.md** — load-once invariants. Updated only when a wave
completes, governance phase changes, or an architectural invariant is established.
Not updated by dev at session end.

**SESSION_BOOTSTRAP_CURRENT.md** — volatile session state. Updated every session
end. Rolling 3–5 session window (not an append-only log). Contains: current metrics,
active DC, open blockers, urgent operational items.

**SESSION_BOOTSTRAP.md** — retained as a two-line redirect stub pointing to the two
new files. This preserves backward compatibility for any reference to the original
filename and prevents missing-file errors.

---

## Rationale

The volatility-based split is the correct mental model. Information that changes
every session and information that changes monthly have different trust horizons,
different failure modes when stale, and different update responsibilities.

The chronological log that had accumulated in SESSION_BOOTSTRAP.md is historical
record, not authoritative state. An agent loading the bootstrap does not need a
full history — it needs current state. Historical work belongs in WAVE_TRACKER.md
and individual audit/achievement docs.

---

## Implementation Scope (reframe-app)

1. Create `docs/control/SESSION_BOOTSTRAP_STABLE.md` with stable content extracted
   from current SESSION_BOOTSTRAP.md
2. Create `docs/control/SESSION_BOOTSTRAP_CURRENT.md` with rolling 3–5 session
   window and current state
3. Convert `docs/control/SESSION_BOOTSTRAP.md` to a two-line redirect stub
4. Update Section 1 of SESSION_START_PROMPT.md (file list only)
5. Update Section 3 of SESSION_END_PROMPT.md (update instructions)
6. Update GOVERNANCE_INDEX.md navigation to reference both new files

**Pre-implementation check required:** Confirm whether the 31+ entry chronological
log in SESSION_BOOTSTRAP.md is already captured in WAVE3_TRACKER.md and/or audit
docs. If not, archive the log before trimming. Implementation order changes if
history is not already captured elsewhere.

---

## What This Decision Does NOT Change

- SESSION_HEADER.md — unchanged
- DELIVERY_ROADMAP.md — unchanged
- WAVE3_TRACKER.md — unchanged, remains authoritative DC-level tracking
- Governance rules — no rules added, removed, or modified
- Content of what is tracked — same information, reorganised by volatility

---

## Incorporation into Standard

This decision is incorporated into the ai-dev-control standard as:

- `templates/SESSION_BOOTSTRAP_STABLE.md` — template for stable layer
- `templates/SESSION_BOOTSTRAP_CURRENT.md` — template for volatile layer
- `templates/SESSION_START_PROMPT.md` — updated load order (Section 1)
- `templates/SESSION_END_PROMPT.md` — updated update instructions (Section 3)

All future projects should use the split bootstrap structure from the start.
Single-file SESSION_BOOTSTRAP.md is deprecated.
