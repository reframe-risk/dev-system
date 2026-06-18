# SKILL_ROLE_MAP.md — Pocock Skills Integration

**Version:** 1.0
**Created:** 2026-05-20
**Purpose:** Maps engineering skills to agent roles, defines when each skill is used
in the CTO-Dev loop, and documents the artifact pipeline they produce.

---

## Artifact Pipeline

Skills are chained to produce the artifact pipeline that feeds the autonomous loop:

```
/setup-matt-pocock-skills          one-time project bootstrap
       ↓
/grill-with-docs → CONTEXT.md     shared domain language (feeds everything)
       ↓
/prototype (optional)              flush out design uncertainty before committing
       ↓
/to-prd → PRD_TEMPLATE.md         product-level "what and why"
       ↓
Scope doc (SCOPE_TEMPLATE.md)      engineering phases, gates, end-state criteria
       ↓
/to-issues → TASKS.yaml           vertical slices with acceptance criteria
       ↓
/triage → prioritise + assign     P0-P3, ready-for-agent vs ready-for-human
       ↓
┌─── Autonomous CTO-Dev Loop ──────────────────────────────────────┐
│  CTO: pick task → write brief                                     │
│    ├─ bug fix DC  → Dev uses /diagnose pattern                    │
│    └─ feature DC  → Dev uses /tdd pattern                         │
│  Dev: execute → /zoom-out if orientation needed → return           │
│  CTO: review return                                               │
│    ├─ update /control docs                                        │
│    ├─ if shallow_drift signal → /improve-codebase-architecture    │
│    │   → new P2/P3 refactor tasks in TASKS.yaml                   │
│    └─ /zoom-out if module boundaries shifted                      │
│  CTO: next task                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## Skill-to-Role Mapping

### Pre-Loop Skills (human + CTO, before autonomous execution)

| Skill | Role | When | Produces |
|-------|------|------|----------|
| `/setup-matt-pocock-skills` | Human | Once per project setup | `docs/agents/` config, CLAUDE.md agent skills block |
| `/grill-with-docs` | Human + CTO | Before first scope; revisit when domain shifts | `CONTEXT.md` (domain glossary), ADRs |
| `/prototype` | Human + CTO | When design is uncertain before scoping | Throwaway code that informs scope decisions |
| `/to-prd` | Human + CTO | When product requirements need formalisation | PRD (input to scope authoring) |
| `/to-issues` | CTO | After scope doc approved, before loop starts | Tasks in TASKS.yaml (vertical slices) |
| `/triage` | CTO | After tasks created, before loop starts | Priority + assignee on each task |

### In-Loop Skills (CTO + Dev, during autonomous execution)

| Skill | Role | Trigger | Effect |
|-------|------|---------|--------|
| `/tdd` | Dev | Default for feature DCs | Red-green-refactor execution; tests ship with code |
| `/diagnose` | Dev | Bug fix DCs | Structured hypothesis → reproduce → fix → regression test |
| `/zoom-out` | Dev | Brief touches unfamiliar code | Module map + caller context; prevents hallucination |
| `/improve-codebase-architecture` | CTO | Post-review, when shallow_drift detected | Surfaces deepening opportunities → P2/P3 refactor tasks |

### Supporting Skills (available but not role-bound)

| Skill | Use case |
|-------|----------|
| `/grill-me` | When human wants to stress-test a plan before approving scope |
| `/write-a-skill` | When project needs custom skills beyond the standard set |
| `/git-guardrails-claude-code` | Safety net: block destructive git commands in dev sessions |

---

## Skill Integration Points

### How /tdd integrates with the brief

The brief's `testing` section tells the dev what testing pattern to use:

```yaml
testing:
  pattern: tdd              # tdd | post-implementation | regression-only
  coverage_gate: 40         # minimum coverage % or null
  test_location: "tests/"   # where tests go
  prior_art: "tests/test_company_context_endpoint.py"  # existing pattern to follow
```

When `pattern: tdd`, the dev executes the /tdd skill workflow:
1. Planning — confirm interface, identify behaviours, design for testability
2. Tracer bullet — one test, minimal code to pass
3. Incremental — remaining behaviours
4. Refactor — after all tests pass

When `pattern: post-implementation`, tests are written after code but must still
ship in the same DC. When `pattern: regression-only`, only regression tests are
required (used for refactor DCs where existing tests cover the behaviour).

### How /diagnose integrates with bug fix briefs

Bug fix briefs include a `bug_context` section:

```yaml
bug_context:
  symptom: "[what the user sees]"
  reproduction: "[steps or command to reproduce]"
  hypotheses: []            # CTO may pre-populate if diagnosis is already started
```

The dev follows the /diagnose pattern:
1. Build a feedback loop (failing test, curl, etc.)
2. Reproduce the bug
3. Generate 3-5 ranked hypotheses
4. Instrument with targeted probes
5. Fix + regression test
6. Cleanup

The return handoff includes `diagnosis_record` with the confirmed hypothesis
and eliminated alternatives.

### How /improve-codebase-architecture integrates with CTO review

After reviewing a dev return, if the CTO observes:
- Caller-pattern concentration (complexity moving to callers instead of modules)
- Shallow modules (interface nearly as complex as implementation)
- Testability friction (tests are hard to write because of poor module boundaries)

The CTO runs /improve-codebase-architecture as a post-review scan:
1. Explore the area changed by the DC
2. Apply deletion test to suspect modules
3. Present deepening opportunities
4. Add refactor tasks to TASKS.yaml at P2/P3

These refactor tasks ride alongside feature work — they are not separate cycles.
The CTO assigns them to future DCs when there is natural overlap.

### How /grill-with-docs maintains CONTEXT.md

CONTEXT.md is a living document. It is updated as a side effect of:
- `/grill-with-docs` sessions (primary authorship)
- `/improve-codebase-architecture` sessions (when deepening reveals new concepts)
- CTO review (when a DC introduces a term not in CONTEXT.md)

CONTEXT.md format follows `CONTEXT-FORMAT.md` from the grill-with-docs skill:
- Language section (terms with one-sentence definitions)
- Relationships section (cardinality between terms)
- Example dialogue section
- Flagged ambiguities section

### How /to-issues maps to TASKS.yaml

The /to-issues skill produces vertical slices with:
- What to build (end-to-end behaviour)
- Acceptance criteria
- Blocked by

These map to TASKS.yaml fields:
- `title` ← what to build
- `detail` ← acceptance criteria (becomes success criteria in the brief)
- `depends_on` ← blocked by
- `source_refs` ← link to scope doc section and PRD user story

---

## Skills NOT Integrated (and why)

| Skill | Reason |
|-------|--------|
| `/caveman` | Communication style preference, not workflow |
| `/edit-article` | Content creation, not engineering |
| `/obsidian-vault` | Personal knowledge management |
| `/writing-*` | Content creation, not engineering |
| `/scaffold-exercises` | Course/tutorial authoring |
| `/migrate-to-shoehorn` | TypeScript-specific, too narrow for standard |
| `/setup-pre-commit` | Useful but project-specific; not part of the governance loop |

Deprecated skills (`/ubiquitous-language`, `/request-refactor-plan`, `/qa`,
`/design-an-interface`) are superseded by their current equivalents
(`/grill-with-docs`, `/improve-codebase-architecture`, `/triage`, `/prototype`).

---

**Document Status:** ACTIVE
**Owner:** CTO
**Review:** When new skills are added or role definitions change
