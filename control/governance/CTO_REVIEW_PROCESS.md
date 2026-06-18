# CTO_REVIEW_PROCESS.md — Return Handoff Review Protocol

**Version:** 1.0
**Created:** 2026-04-12
**Status:** ACTIVE — executed after every dev return handoff is received
**Scope:** Universal — applies to all projects using this standard

---

## Purpose

This document defines the 10-step protocol the CTO follows when reviewing a dev
return handoff. It ensures that: the implementation matches the brief, the DB state
is verified, TASKS.yaml and current_state.yaml stay consistent, and no regressions
slip through before a DC is closed.

Execute these steps in order. Do not mark a DC closed until all steps pass.

---

## Trigger

Execute this protocol when a `HANDOFF_DEV_CTO_{DC-ID}_{DATE}.yaml` file appears
in `docs/handoffs/` that has not yet been reviewed.

At CTO session start, checking `docs/handoffs/` for unreviewed returns is Step 7
of the load order. Return review takes priority over new brief work.

---

## Step 1 — Load the return handoff

Read `docs/handoffs/HANDOFF_DEV_CTO_{DC-ID}_{DATE}.yaml` completely.

Confirm it contains all required fields:
- [ ] `dc_identifier` matches an open task in TASKS.yaml
- [ ] `outcome` stated (COMPLETE / PARTIAL / BLOCKED)
- [ ] `files_changed` list present
- [ ] `db_state` block present with actual query results (not placeholders)
- [ ] `open_items` section present (may be empty)
- [ ] `control_update_data` block present
- [ ] `related_tasks` field present (which TASKS.yaml entries this closes)

If any required field is missing: return to dev with a list of what is needed.
Do not proceed with an incomplete return.

---

## Step 2 — Load the original brief

Read `docs/handoffs/HANDOFF_CTO_DEV_{DC-ID}_{DATE}.yaml` — the brief that was issued.

Extract and hold:
- Success criteria (from `success_criteria` block)
- Autonomous authority boundaries (from `autonomous_authority` block)
- Do not list (from `do_not` block)
- Expected file scope (from `file_scope` or `files_expected` block)
- Self-check list (from `self_check` block)

---

## Step 3 — Verify files changed against brief scope

Compare `files_changed` in the return against the brief's explicit file scope.

- [ ] All files changed were in scope per the brief
- [ ] No files changed that were not in scope

If out-of-scope files were touched: this is an escalation trigger. Surface to human
before accepting the return. Do not close the DC.

---

## Step 4 — Verify success criteria

For each success criterion in the brief, check whether the return handoff confirms it:

- [ ] Criterion 1: [from brief] — PASS / FAIL — evidence: [from return]
- [ ] Criterion 2: [from brief] — PASS / FAIL — evidence: [from return]
- [ ] ...

If any criterion is FAIL: DC is not complete. Return to dev with specific failure.

---

## Step 5 — Verify DB state

The return handoff must include actual query results from the verification queries
specified in the brief (or standard queries from SESSION_END_PROMPT.md).

- [ ] Migration count matches expected (local)
- [ ] Remote sync status stated explicitly (DONE / NOT DONE / N/A)
- [ ] Key row counts match expected baseline or explained deviation
- [ ] Schema version correct
- [ ] No unexpected tables, orphaned rows, or constraint violations reported

If DB state cannot be verified from the return: return to dev for clarification.

---

## Step 6 — Check the do_not list

For each item in the brief's `do_not` list, verify the return confirms it was respected:

- [ ] [do_not item 1] — respected: YES / EVIDENCE OF VIOLATION
- [ ] [do_not item 2] — respected: YES / EVIDENCE OF VIOLATION

Any violation is a return-for-rework trigger, not a close.

---

## Step 7 — Reconciliation (the three-way sync)

This is the most important step. Keep three documents in sync:

### 7a — Close task in TASKS.yaml
- Move the DC task from open to done
- Record: dc_identifier, date closed, outcome summary
- Update `meta.last_closed_dc`
- Clear `meta.pending_cto_review`

### 7b — Add new tasks from open_items
- For each item in `open_items` in the return handoff:
  - If it is a new task: add to TASKS.yaml with appropriate priority
  - If it maps to an existing task: update that task's status or notes
- Update task IDs in `meta` block if new P0/P1 items added

### 7c — Reconcile QA inspection and scope doc
- Does any open item in the return handoff appear in the active QA inspection?
  If yes: update the QA inspection's open item status.
- Does this DC satisfy any of the active scope's end-state criteria?
  If yes: update `meta.active_scope.end_state_criteria` in TASKS.yaml.
- Are all scope end-state criteria now met?
  If yes: flag for human approval to formally close the scope.

This three-way reconciliation is what prevents the task register, QA doc, and scope
doc from drifting out of sync across sessions.

---

## Step 8 — Update /control documents

Update in this sequence to avoid inconsistency:

1. `docs/control/TASKS.yaml` — task closed, new tasks added, meta updated (Step 7)
2. `docs/control/current_state.yaml` — active DC, last completed DC, DB metrics,
   open blockers (from return handoff)
3. `docs/control/SESSION_BOOTSTRAP_CURRENT.md` — narrative layer updated:
   recent work entry added, active DC updated, blockers updated
4. `docs/control/SESSION_BOOTSTRAP_STABLE.md` — update ONLY if this DC established
   a new architectural invariant or closed a wave/workstream
5. Any other /control documents referenced in the return's `control_update_data` block

Do not update documents not referenced in the return or this protocol.

---

## Step 9 — Notify human

Produce a summary for the human owner:

```
DC {DC-ID} — {outcome}

Success criteria: {X}/{total} passed
Files changed: {count} ({list})
DB state: {migration count, schema version, key counts}
New tasks added: {list or "none"}
Scope progress: {which end-state criteria now met}
Human decision required: {YES — [what] / NO}
```

If human decision is required (scope close, escalation, out-of-scope finding):
stop and await explicit instruction before proceeding.

---

## Step 10 — Write CTO session handoff artifact

Complete `SESSION_END_PROMPT_CTO.md` Section 3 (Type B) and Section 6 (handoff artifact).

The handoff artifact is the record that the next CTO session reads. It must capture:
- What was accepted and why
- What was returned or deferred
- What tasks were opened
- What the human needs to decide

---

## Wave Review — Post-Batch Consolidated Review

**Trigger:** Execute after a session that completes 3 or more DCs in sequence. Inline
per-DC reviews catch issues within each DC's scope; the wave review catches issues
*between* DCs — integration seams, consistency drift, and accumulated side-effects.

**When:** First CTO session after a multi-DC batch. Before writing new briefs.

**Protocol:**

### W1 — Run full test suite (unit + integration)

Run all test suites on the current main branch. Confirm zero regressions.
This includes both unit tests and integration tests — integration tests verify
that cross-service contracts established by individual DCs still hold when
combined. If tests cannot run locally, note the environment gap.

### W2 — Cross-DC seam inspection

Identify the integration seams between the batch's DCs. For each seam:

- Read both sides of the interface (producer output, consumer input)
- Verify exact field name alignment
- Check null/optional handling: if the producer can emit `null`, does the consumer guard?
- Check wrapper handling: if a service wraps results, do consumers unwrap consistently?

[PROJECT: list common seams to check, e.g. Plugin→Plugin, API→Frontend, Event→Handler]

### W3 — Output shape consistency

Verify all components follow the same return patterns and that the integration
layer treats them uniformly.

### W4 — Scope checkpoint update

Tick off end-state criteria in the active scope doc for phases covered by the batch.
Update SESSION_BOOTSTRAP_STABLE.md if a wave or workstream completed.

### W5 — Bug triage

Any bugs found during W1-W3 are added to TASKS.yaml with appropriate priority.
Cross-DC integration bugs are typically P1 (they affect the product surface but
were not caught by individual DC tests).

### W6 — Record the wave review

Add a summary to the CTO session handoff artifact:

```
### Wave Review (DCs reviewed: DC-X, DC-Y, DC-Z, ...)
- Test suite: PASS / FAIL (details)
- Integration tests: PASS / FAIL (details)
- Seams checked: N seams, M issues found
- Bugs raised: [task IDs]
- Scope criteria ticked: [list]
```

---

## Return for Rework — Protocol

If the return fails Steps 3, 4, 5, or 6:

1. Do NOT close the DC in TASKS.yaml
2. Document the specific failures clearly
3. Write a `HANDOFF_CTO_DEV_{DC-ID}-REWORK_{DATE}.yaml` with:
   - `outcome: RETURNED_FOR_REWORK`
   - `rework_required`: specific list of what failed and what is needed
   - `do_not`: carry forward from original brief plus any new constraints
   - `autonomous_authority`: carry forward from original brief
4. Update TASKS.yaml: task status ACTIVE, note added
5. Do not issue a new DC-ID — rework is still DC-ID, iteration 2

---

## Escalation to Human — Triggers

Stop the review and surface to human before proceeding when:

- Out-of-scope files were modified
- A do_not constraint was violated
- Success criteria cannot be verified from the return
- The return reveals an architectural decision not in any ADR
- The scope end-state criteria are all met (scope close requires human approval)
- A new P0 blocker is discovered in the open_items
- The return describes a change to shared infrastructure not in the brief
