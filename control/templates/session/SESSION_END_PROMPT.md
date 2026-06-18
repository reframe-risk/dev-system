# SESSION_END_PROMPT.md — Dev Session Close

**Version:** 2.0
**Updated:** 2026-04-12 — rewritten to match TASKS.yaml-centric governance system
**Usage:** Execute at the end of every dev session before closing. Do not skip sections.

---

End-of-session governance check. Complete all sections in order before this session closes.

---

## 1. DC Outcome

State the outcome of the Delivery Candidate this session was working on:

- **DC identifier:** [e.g. DC-S001-2-3]
- **Outcome:** COMPLETE / PARTIAL / BLOCKED
- **What is now true that was not true before:** [one concrete sentence]
- **If PARTIAL or BLOCKED:** state what could not be completed and why

---

## 2. DB Verification Queries

Run these queries before writing the return handoff. Paste actual output — not summaries.

Standard queries (run all that apply):

```sql
-- Migration count (local)
SELECT COUNT(*) FROM migrations;

-- [PROJECT: add any standard verification queries for this project]
```

Record results in the return handoff `db_state` block. Do not estimate.

If no DB changes this session: state "No DB changes — verification queries not applicable."

---

## 3. Files Changed

List every file that was modified, created, or deleted this session. Include:
- Exact repo-relative path
- Change type: CREATED / MODIFIED / DELETED
- One-line note if the change is non-obvious

If any file was changed that was NOT in the brief's explicit file scope:
**Stop.** This is an escalation trigger. Document clearly in the return handoff and
flag for CTO before proceeding.

---

## 4. Do_Not Compliance

For each item in the brief's `do_not` list, confirm it was respected.
If any `do_not` constraint was violated: document in the return handoff and flag for CTO.

---

## 5. Return Handoff Artifact (mandatory)

Write the return handoff using `docs/handoffs/RETURN_TEMPLATE.yaml` as the base.

Save to: `docs/handoffs/HANDOFF_DEV_CTO_{DC-ID}_{DATE}.yaml`

Required fields — all must be filled with actual values before committing:
- [ ] `dc_identifier` — matches brief exactly
- [ ] `outcome` — COMPLETE / PARTIAL / BLOCKED
- [ ] `outcome_summary` — concrete paragraph, no placeholders
- [ ] `files_changed` — complete list
- [ ] `db_state` — actual query results, not estimated
- [ ] `success_criteria_check` — PASS/FAIL/PARTIAL for each criterion
- [ ] `do_not_compliance` — confirmed for each constraint
- [ ] `open_items` — list of anything found or left incomplete (empty list if none)
- [ ] `control_update_data` — values for CTO to update TASKS.yaml and current_state.yaml
- [ ] `related_tasks` — which TASKS.yaml entries this DC closes

Do NOT commit a return handoff with any field containing: TODO, TBD, null (where
a value is required), or placeholder text. The CTO will return it unreviewed.

---

## 6. /control Document Updates

Dev sessions do **not** update TASKS.yaml or current_state.yaml directly.
The CTO updates these in Step 7–8 of CTO_REVIEW_PROCESS.md.

Dev sessions must update the following if applicable:

### SESSION_BOOTSTRAP_CURRENT.md (update only if CTO is not reviewing immediately)

If the CTO will review promptly: skip this — the CTO updates it in Step 8.
If there will be a significant gap before CTO review: update the narrative layer:
- Active DC status
- Open blockers (if new ones were discovered)

### SESSION_BOOTSTRAP_STABLE.md (update only if a new architectural invariant was established)

Update ONLY IF: a new architectural invariant was established and it is owner-approved.
Otherwise: "SESSION_BOOTSTRAP_STABLE.md not updated — no stable content changed."

---

## 7. Version Control

### Commit

- Commit message: `{type}({scope}): {description}` (see docs/control/GITHUB_STANDARD.md)
- Files committed: [list]
- Branch: [current branch]
- Push to remote: YES / NO / CHECKPOINT REQUIRED

Include the return handoff YAML in the commit.

If no changes to commit: state "No commit required" and reason.

---

## 8. Stop

- ❌ Do NOT propose next steps
- ❌ Do NOT suggest follow-on work
- ❌ Do NOT expand scope
- ❌ Do NOT add future roadmap items
- ❌ Do NOT update TASKS.yaml — that is CTO's responsibility

Await explicit instruction from human or CTO.

---

## Compliance Checklist

Before closing the session, confirm:

- [ ] DC outcome stated (COMPLETE / PARTIAL / BLOCKED)
- [ ] DB verification queries run and results recorded
- [ ] Files changed list is complete and within brief scope
- [ ] Do_not constraints confirmed respected
- [ ] Return handoff written with all required fields filled ⭐ MANDATORY
- [ ] Return handoff saved to `docs/handoffs/HANDOFF_DEV_CTO_{DC-ID}_{DATE}.yaml`
- [ ] Return handoff committed and pushed
- [ ] Commit message follows convention
- [ ] No out-of-scope files touched (or flagged if they were)

---

## Acknowledge When Complete

Respond with:

1. ✅ DC outcome stated
2. ✅ DB verification queries run and results recorded
3. ✅ Files changed confirmed within scope
4. ✅ Do_not compliance confirmed
5. ✅ Return handoff written and committed
6. ✅ Version control actions completed
7. **STOPPED** — awaiting explicit instruction
