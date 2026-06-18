# [PROJECT NAME]

**Repo:** https://github.com/[org]/[repo]
**Owner:** [name]
**Status:** [Active / Paused / Complete]
**Standard version:** ai-dev-control v2.0

---

## What This Project Is

[2-3 sentences. What does this project do? What is the anchor goal?]

---

## Bootstrap Checklist

Copy templates from dev-system and adapt `[PROJECT]` markers:

### Governance docs (copy to `docs/control/`)

- [ ] `SESSION_HEADER.md` — immutable rules (adapt Rule 1+ for your project)
- [ ] `SESSION_START_PROMPT.md` — role-aware load order
- [ ] `SESSION_END_PROMPT.md` — dev session close
- [ ] `SESSION_END_PROMPT_CTO.md` — CTO session close
- [ ] `SESSION_BOOTSTRAP_STABLE.md` — architectural invariants
- [ ] `SESSION_BOOTSTRAP_CURRENT.md` — rolling current state
- [ ] `TASKS.yaml` — task register (from TASKS_TEMPLATE.yaml)
- [ ] `current_state.yaml` — project state (from CURRENT_STATE_TEMPLATE.yaml)

### Scope and planning (copy to `docs/control/` when needed)

- [ ] `SCOPE_TEMPLATE.md` → first scope doc (adapt for your project)
- [ ] `PRD_TEMPLATE.md` → first PRD (optional — owner can go direct to scope)
- [ ] `CONTEXT.md` — domain glossary (produced by `/grill-with-docs`)

### Governance process docs (copy to `docs/control/`)

- [ ] `AGENT_ROLES.md`
- [ ] `WORKING_PROCESS.md`
- [ ] `CTO_REVIEW_PROCESS.md`
- [ ] `CTO_ENGINEERING_STANDARDS.md`
- [ ] `CONTROL_DIRECTORY.md`
- [ ] `SKILL_ROLE_MAP.md`

### Handoffs directory

- [ ] Create `docs/handoffs/` (empty — fills up as loop runs)
- [ ] Create `docs/handoffs/archive/` (for completed handoffs)

### Autonomous loop (optional — copy to `.sandcastle/`)

- [ ] `cto-dev-loop/` template (from `templates/sandcastle/cto-dev-loop/`)
- [ ] Configure `main.mts` paths for your project layout
- [ ] Docker image built (`sandcastle build-image docker`)

### Skills setup

- [ ] Run `/setup-matt-pocock-skills` to scaffold `docs/agents/` config
- [ ] Run `/grill-with-docs` to produce initial `CONTEXT.md`

---

## Adaptation Notes

### Where this project diverges from the standard

[List any deliberate deviations from ai-dev-control standard and why.
Record each deviation as an ADR if it meets ADR criteria.]

### What's implemented

| Component | Status | Notes |
|-----------|--------|-------|
| SESSION_HEADER.md | | |
| TASKS.yaml | | |
| current_state.yaml | | |
| Scope doc | | |
| CONTEXT.md | | |
| YAML briefs | | |
| YAML returns | | |
| Autonomous loop | | |

---

## Current State

See `current_state.yaml` for machine-readable state.
See `SESSION_BOOTSTRAP_CURRENT.md` for human-readable narrative.

---

## How to Start

### First CTO Session

1. Read `TASKS.yaml` meta block — it links every other document
2. Read active scope doc (path in meta.active_scope.path)
3. Read `AGENT_ROLES.md` — your authority and scope boundary
4. Read `CTO_ENGINEERING_STANDARDS.md` — produce phase narrative
5. Check `docs/handoffs/` for any unreviewed dev return

Full load order: `SESSION_START_PROMPT.md`

### First AFK Run

1. Ensure TASKS.yaml has P1 tasks with assignee `dev`
2. Run `npx tsx .sandcastle/main.mts`
3. See `AFK_EXECUTION_OPTIONS.md` for setup details
