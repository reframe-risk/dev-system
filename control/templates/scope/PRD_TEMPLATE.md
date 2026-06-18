# PRD — [Feature / Initiative Title]

**Status:** DRAFT | APPROVED | SCOPE-LINKED
**Created:** [DATE]
**Author:** [who drafted this — human, CTO, or product owner]
**Scope link:** [path to SCOPE doc once created, or "not yet scoped"]
**CONTEXT.md:** [path to domain glossary this PRD uses, or "not yet created"]

---

## Problem Statement

[PROJECT: describe the problem from the USER's perspective. What can they not do today?
What is painful, slow, or broken? Do not describe the solution here — describe the gap.

Use vocabulary from CONTEXT.md. If a term doesn't exist in CONTEXT.md yet, flag it
as a candidate for addition during the /grill-with-docs session that should precede
or accompany this PRD.]

---

## Solution

[PROJECT: describe the solution from the USER's perspective. What will they be able
to do after this is built? What does the experience look like?

Keep this at product level — not "we'll add a database column" but "the user will
see their financial position alongside regulatory exposure."]

---

## User Stories

[PROJECT: numbered list of user stories. Each story is a thin, end-to-end behaviour
that a user cares about. These become the raw material for scope doc end-state
criteria and task register entries.

Format: "As a [role], I can [action], so that [outcome]."
Be specific enough that each story is independently testable.]

1. As a [role], I can [action], so that [outcome].
2. As a [role], I can [action], so that [outcome].
3. As a [role], I can [action], so that [outcome].

---

## Implementation Decisions

[PROJECT: technical decisions that are already resolved or strongly recommended.
These feed directly into the scope doc's "Architectural decisions confirmed" section.

Organise by category. Only include decisions that are load-bearing — skip obvious ones.]

### Modules

[PROJECT: which modules will be built or modified? Use CONTEXT.md vocabulary.
Identify deep modules (high leverage, small interface) vs. shallow modules
(candidates for consolidation or deepening).]

- **[Module name]:** [what it does, why it exists, what its interface looks like]

### Interfaces and contracts

[PROJECT: API endpoints, data shapes, or contracts between modules.
These become the basis for governance contracts (CONTEXT_API_CONTRACT.md etc.).]

- **[Interface name]:** [request/response shape, or data contract description]

### Schema and data

[PROJECT: database changes, new tables/columns, migration strategy.]

### Architecture

[PROJECT: which ADRs apply? Any new architectural decisions needed?
Reference existing ADRs. Flag decisions that need owner input as open questions.]

---

## Testing Decisions

[PROJECT: what makes a good test for this feature? Which modules have the most
testing leverage? Reference any existing test patterns in the codebase.]

- **What to test:** [which behaviours, at which boundaries]
- **How to test:** [integration tests, unit tests, measurement scripts]
- **Prior art:** [existing test files or patterns to follow]

---

## Out of Scope

[PROJECT: what this PRD explicitly does NOT cover. Be specific — vague exclusions
invite scope creep. Each item should name what it is and why it's excluded.]

- [Excluded item]: [why — deferred to future scope / not relevant / too risky now]

---

## Open Questions

[PROJECT: questions that must be resolved before scoping can begin. Each question
should name what it blocks and who can answer it.]

1. **[Question]** — blocks [what]. Owner to decide.
2. **[Question]** — blocks [what]. Requires [investigation / prototype / data].

---

## Further Notes

[PROJECT: anything else relevant — competitive context, regulatory constraints,
stakeholder expectations, timeline pressures. This section feeds the scope doc's
origin narrative.]

---

## Pipeline Position

This PRD sits in the artifact pipeline as follows:

```
/grill-with-docs → CONTEXT.md (shared language — should exist before or alongside this PRD)
       ↓
THIS PRD (product-level "what and why")
       ↓
Scope doc (engineering phases, gates, end-state criteria — authored by CTO from this PRD)
       ↓
TASKS.yaml (atomic work units derived from scope doc phases)
       ↓
CTO brief → Dev → Return → Review (execution loop)
```

Once a scope doc is created from this PRD, link it in the header above and update
status to SCOPE-LINKED. The PRD remains as a reference artifact — it is not modified
after scope creation. If product requirements change, create a new PRD or amend the
scope doc directly.

---

**Document Status:** TEMPLATE — replace [PROJECT] markers when adapting
**Owner:** Product owner or CTO (drafts PRD), Human (approves)
**Produced by:** /grill-with-docs + /to-prd skill chain, or manual authorship
