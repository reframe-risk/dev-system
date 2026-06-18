# SCOPE-[NNN] — [Scope Title]

**Status:** DRAFT | ACTIVE | COMPLETE
**Created:** [DATE]
**Drafted by:** CTO (in conversation with owner)
**Replaces:** [previous scope or "N/A"]
**Precedes:** [next scope or "N/A"]
**Gate:** [what must be true for this scope to be considered complete and the next scope to begin]

---

## Origin

[PROJECT: 2–4 paragraphs explaining WHY this scope exists. Not what it builds — why
it needs to be built. What question does it answer? What gap was surfaced? What is
the consequence of not doing this work?

This section should be readable by a non-technical stakeholder. It is the narrative
anchor that every task in this scope traces back to. If a task cannot be justified by
this origin narrative, it does not belong in this scope.

Include the triggering event: owner question, QA inspection finding, architectural
gap surfaced during a prior scope, or external requirement.]

---

## Architectural decisions confirmed

[PROJECT: list the architectural decisions that govern this scope's implementation.
Reference ADRs by number. These are NOT new decisions — they are pre-existing
constraints the scope must respect. New decisions made during this scope should be
recorded as ADRs and referenced here once committed.]

- **[Decision name]** (ADR-NNN). [One sentence: what was decided and how it constrains this scope.]
- **[Decision name]** (ADR-NNN). [One sentence.]

New principle confirmed this scope (if any):

- **[Principle name].** [One sentence description. Reference the task or conversation
  where this was confirmed. Record as ADR if it meets ADR criteria: hard to reverse,
  surprising without context, result of real trade-off.]

---

## End-State Criteria

SCOPE-[NNN] is complete when ALL of the following are true.

### Phase A — [Phase name] ([task range])

[PROJECT: Phase A is typically foundation/governance artefacts — specs, contracts,
ADRs, walkthroughs that must exist before implementation begins.]

- [ ] **C1:** [Criterion description — measurable, verifiable, not subjective]
- [ ] **C2:** [Criterion description]

### Phase B — [Phase name] ([task range])

[PROJECT: Phase B is typically implementation — code, schema, data population,
endpoints, UI components.]

- [ ] **C3:** [Criterion description]
- [ ] **C4:** [Criterion description]
- [ ] **C5:** [Criterion description]

### Phase C — [Phase name] ([task range]) (if applicable)

[PROJECT: Phase C is typically reconciliation, archival, or cleanup from prior scopes.
Not all scopes have a Phase C.]

- [ ] **C6:** [Criterion description]

---

## Phase structure

### Phase A — [Phase name]

| Task | Title | Assignee | Status | Depends on |
|------|-------|----------|--------|------------|
| T-NNN | [title] | [cto/dev/human] | OPEN | — |
| T-NNN | [title] | [cto/dev/human] | OPEN | T-NNN |

### Phase B — [Phase name]

| Task | Title | Assignee | Status | Depends on |
|------|-------|----------|--------|------------|
| T-NNN | [title] | [dev] | OPEN | Phase A complete |
| T-NNN | [title] | [dev] | OPEN | T-NNN |

### Phase C — [Phase name] (if applicable)

| Task | Title | Assignee | Status | Depends on |
|------|-------|----------|--------|------------|
| T-NNN | [title] | [cto] | OPEN | Phase B complete |

---

## Open questions

[PROJECT: questions surfaced during scope drafting that require owner decision
before certain tasks can proceed. Each OQ must name what it blocks.]

### OQ-SNNN-1: [Question title]

**Question:** [The specific question requiring a decision]
**CTO recommendation:** [What the CTO recommends and why]
**Blocks:** [Which tasks cannot proceed until this is resolved]
**Owner decision:** [PENDING | recorded decision and date]

### OQ-SNNN-2: [Question title]

**Question:** [...]
**CTO recommendation:** [...]
**Blocks:** [...]
**Owner decision:** [PENDING]

---

## References

- **Governing scope doc:** this document
- **Task register:** `docs/control/TASKS.yaml` (authoritative for task status)
- **Current state:** `docs/control/current_state.yaml` (authoritative for DB metrics)
- **Handoffs:** `docs/handoffs/` (CTO briefs and dev returns for this scope)
- **Prior scope:** `docs/control/archive/scopes/SCOPE-[NNN-1]-[name].md`
- **ADRs referenced:** `docs/adr/[NNN]-[slug].md`

---

## Scope transition checklist

When all end-state criteria are MET and owner confirms:

- [ ] All tasks in TASKS.yaml for this scope are DONE or explicitly deferred with rationale
- [ ] QA inspection open items mapped to this scope are resolved or transferred
- [ ] Scope doc moved to `docs/control/archive/scopes/`
- [ ] current_state.yaml updated with scope completion status
- [ ] SESSION_BOOTSTRAP_CURRENT.md updated
- [ ] Next scope doc (if any) moved to ACTIVE status

---

**Document Status:** TEMPLATE — replace [PROJECT] markers when adapting for a new project
**Owner:** CTO (drafts scope), Human (approves scope activation and completion)
**Review:** At scope transitions and when end-state criteria change
