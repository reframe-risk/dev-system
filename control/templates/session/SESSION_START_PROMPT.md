# SESSION_START_PROMPT.md

**Version:** 4.0
**Updated:** 2026-04-12 — role-aware CTO and Dev paths; REFRAME_TASKS.yaml pattern
**Usage:** Paste at the start of every session. Follow the path for your role.

---

This session operates under the `/control` governance system.

There are two load paths depending on role. Follow the one that applies.

---

## CTO SESSION LOAD ORDER (9 steps)

**Before proposing or executing any work, load in this order:**

1. `docs/control/TASKS.yaml`
   Task register and meta block. Tells you: what is open, what scope is active,
   QA inspection status, where every other document is. **Start here — every session.**

2. `docs/control/current_state.yaml`
   Machine-readable project metrics — DB state, active DC, completed DCs, key counts.

2b. `docs/control/[ACTIVE_QA_INSPECTION].md`
   Read Part 5 (open items) and Part 8 (next-scope candidates) only.

2c. `docs/control/[ACTIVE_SCOPE_DOC].md`
   Read Section 1 (end-state criteria) and Section 5 (what was broken). [PROJECT: adapt section refs]

3. `docs/control/AGENT_ROLES.md`
   CTO authority, scope boundary, and escalation triggers.

4. `docs/control/CTO_ENGINEERING_STANDARDS.md`
   Engineering knowledge base. Produce phase narrative and domain gap scan at session start.

5. `docs/control/SESSION_BOOTSTRAP_STABLE.md`
   Architectural invariants and closed decisions. Treat as permanent for this session.

6. `docs/control/SESSION_BOOTSTRAP_CURRENT.md`
   Rolling current state narrative — recent work, active DC, open blockers.

7. `docs/handoffs/`
   Check for any DEV_TO_CTO return handoff newer than the last CTO_TO_DEV brief.
   If found, review before proceeding — return review takes priority over new brief work.

8. Active brief (if one exists)
   `docs/handoffs/HANDOFF_CTO_DEV_{DC-ID}_{DATE}.yaml`
   If no active brief: read `docs/control/SESSION_END_PROMPT_CTO.md` for session type guidance.

**At session start, the CTO must produce:**
- Phase narrative: one paragraph locating the project in the Foundation → Production framework
- QA sign-off status: which QA inspection is active, sign-off complete or pending
- Scope end-state criteria: which criteria are met, which are pending
- Pending review flag: any DEV_TO_CTO return awaiting CTO review
- Active task summary: P0 and P1 tasks, with owners
- Domain gap scan: any gaps from CTO_ENGINEERING_STANDARDS.md worth surfacing

Then await human instruction before beginning any brief work.

---

## DEV SESSION LOAD ORDER (4 steps)

**Before writing any code or making any changes, load in this order:**

1. `docs/control/SESSION_HEADER.md`
   Immutable governance rules, risk thresholds, self-approval policy, layer boundaries.
   These rules cannot be overridden by the brief.

2. `docs/control/SESSION_BOOTSTRAP_STABLE.md`
   Architectural invariants. Treat as permanent for this session.

3. `docs/handoffs/HANDOFF_CTO_DEV_{DC-ID}_{DATE}.yaml`
   The active brief. This defines your scope, autonomous authority, and success criteria.
   Read it completely before writing a single line of code.

4. `docs/control/SESSION_END_PROMPT.md`
   Read now so you know what is required at session close before you begin.

**At session start, the Dev must confirm:**
- Which DC is being executed
- Which files are in scope (from the brief — list them explicitly)
- What the success criteria are
- What the `do_not` list contains
- What requires a checkpoint before proceeding

Then begin Phase 1 of the brief. Do not begin Phase 2 until Phase 1 validation gate passes.

---

## DO NOT (both roles)

- ❌ Re-open completed delivery candidates
- ❌ Infer scope beyond what is documented in the brief or task register
- ❌ Make changes to files not named in the brief
- ❌ Propose architectural changes when the session calls for implementation
- ❌ Skip a validation gate to reach the next phase faster
- ❌ Pause for permission on actions explicitly covered by autonomous authority
- ❌ Expand scope. Do not expand scope. Stop and await instruction.

---

## Acknowledge When Ready

**CTO:** Respond with phase narrative, QA status, pending review flag, task summary,
domain gaps, and "awaiting instruction."

**Dev:** Respond with DC identifier, files in scope, success criteria, do_not list,
and "beginning Phase 1."
