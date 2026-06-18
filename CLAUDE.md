# CLAUDE.md — dev-system

This repo is the portable **multi-agent AI development system** — a governance
framework, engineering skill toolkit, and sandbox orchestrator designed to run
CTO-Dev loops autonomously or with human-in-the-loop.

It is not a project. It has no application code. It is the reference system that
every project's `docs/control/` directory is adapted from.

**Owner:** Simon Schwab
**Repo:** https://github.com/reframe-risk/multi-agent

---

## Repo Structure

Three subsystems, one methodology doc:

```
dev-system/
├── CLAUDE.md                       ← you are here
├── development-method.md           ← conceptual foundation (Pocock + three-role system)
│
├── control/                        ← governance framework (the known interface for projects)
│   ├── governance/                 ← role definitions, process, standards
│   │   ├── AGENT_ROLES.md
│   │   ├── WORKING_PROCESS.md
│   │   ├── CTO_REVIEW_PROCESS.md
│   │   ├── CTO_ENGINEERING_STANDARDS.md
│   │   └── ...
│   ├── templates/
│   │   ├── session/                ← session lifecycle (header, start, end, bootstrap)
│   │   ├── handoffs/               ← CTO↔Dev artifacts (brief, handoff, return)
│   │   ├── scope/                  ← planning (scope, PRD, tasks, current state)
│   │   ├── autonomous/             ← AFK loop (CTO/Dev prompts, halt contract, sandcastle)
│   │   ├── roles/                  ← per-role definition templates (CTO, Pipeline Dev, etc.)
│   │   └── settings/               ← Claude Code configs
│   ├── schemas/                    ← YAML schemas for handoffs and briefs
│   ├── examples/                   ← production handoff examples
│   ├── projects/                   ← per-project implementations (_template/ for new)
│   └── decisions/                  ← ADRs for the framework itself
│
├── skills/                         ← engineering skills, grouped by role and phase
│   ├── SKILL_ROLE_MAP.md           ← canonical skill-to-role mapping
│   ├── pre-loop/                   ← human + CTO, before execution
│   │   ├── setup-matt-pocock-skills/
│   │   ├── grill-with-docs/
│   │   ├── prototype/
│   │   ├── to-prd/
│   │   ├── to-issues/
│   │   └── triage/
│   ├── dev/                        ← Dev role, during CTO-Dev loop
│   │   ├── tdd/
│   │   ├── diagnose/
│   │   └── zoom-out/
│   ├── cto/                        ← CTO role, during CTO-Dev loop
│   │   └── improve-codebase-architecture/
│   ├── productivity/               ← role-agnostic (write-a-skill, caveman, grill-me)
│   ├── misc/                       ← utilities (pre-commit, git-guardrails, etc.)
│   ├── drafts/                     ← in-progress skills
│   └── deprecated/                 ← superseded skills
│
└── sandcastle/                     ← AFK sandbox orchestrator (@ai-hero/sandcastle)
    ├── src/                        ← TypeScript library (sandbox providers, agent invokers)
    └── templates/                  ← orchestration patterns (parallel-planner, simple-loop, etc.)
```

---

## How the Three Subsystems Connect

```
development-method.md           conceptual foundation
        │                       (modules, vertical slices, deletion test, three roles)
        │
        ├── control/            operational plumbing
        │   │                   (YAML handoffs, role authority, governance rules,
        │   │                    halt conditions, session prompts)
        │   │
        │   └── integrates ──→  skills/
        │       via             (pre-loop/, dev/, cto/ folders map skills
        │       SKILL_ROLE_MAP   to roles at specific loop phases)
        │
        └── sandcastle/         execution environment
            │                   (isolated sandbox for dev agents — Docker, Vercel, etc.)
            │
            └── runs ──→        control/templates/autonomous/
                                CTO_AUTONOMOUS_SESSION.md  (CTO agent prompt)
                                DEV_AUTONOMOUS_SESSION.md  (Dev agent prompt)
                                HALT_CONTRACT.yaml         (stop conditions)
```

---

## The Artifact Pipeline

Before any code is written, scope is produced through a chain of artifacts:

```
/setup-matt-pocock-skills       one-time project bootstrap
       ↓
/grill-with-docs → CONTEXT.md   shared domain language
       ↓
/prototype (optional)            design exploration
       ↓
/to-prd → PRD                   product-level requirements
       ↓
Scope doc                        engineering phases + end-state criteria
       ↓
/to-issues → TASKS.yaml         vertical slices with acceptance criteria
       ↓
/triage → prioritise            P0-P3, assign roles
       ↓
CTO-Dev loop                     brief → execute → return → review → next
```

---

## The CTO-Dev Loop

Two modes of operation:

**Human-in-the-loop:** CTO and Dev are separate Claude Code sessions. Human reviews
between cycles. Standard session prompts: `SESSION_START_PROMPT.md`, `SESSION_END_PROMPT.md`.

**Autonomous (AFK):** CTO and Dev agents run in a sandcastle loop. Human approves
scope up front, gets notified only on halt conditions. Prompts:
`CTO_AUTONOMOUS_SESSION.md`, `DEV_AUTONOMOUS_SESSION.md`. Stop conditions:
`HALT_CONTRACT.yaml`. Orchestration: `sandcastle/cto-dev-loop/main.mts`.

Three execution options (see `sandcastle/AFK_EXECUTION_OPTIONS.md`):
- **Option A:** Shell script (simplest, no isolation, test prompts first)
- **Option B:** Sandcastle + Docker (recommended, proper isolation and halt enforcement)
- **Option C:** Vercel / GitHub Actions / cloud (fully AFK, laptop off)

---

## Key Entry Points

| Want to... | Start with... |
|---|---|
| Understand the methodology | `development-method.md` |
| Understand the governance system | `control/governance/WORKING_PROCESS.md` |
| Set up a new project | `control/projects/_template/` |
| Know what skills exist | `skills/README.md` |
| See how skills map to roles | `skills/SKILL_ROLE_MAP.md` |
| Write a CTO brief | `control/templates/handoffs/HANDOFF_TEMPLATE.yaml` |
| Write a scope doc | `control/templates/scope/SCOPE_TEMPLATE.md` |
| Run an autonomous loop | `control/templates/autonomous/sandcastle/cto-dev-loop/README.md` |
| Choose an AFK execution option | `control/templates/autonomous/sandcastle/AFK_EXECUTION_OPTIONS.md` |
| Understand halt conditions | `control/templates/autonomous/HALT_CONTRACT.yaml` |
| See a production example | `control/examples/` |

---

## Non-Negotiable Rules

- Do not modify this repo to fit a specific project — adapt the project's copies
- TASKS.yaml is updated by the CTO only — never by a dev session
- Every session ends with a committed handoff artifact — no exceptions
- Tests are mandatory for feature and fix DCs (SESSION_HEADER.md Rule 0) — both unit tests and integration test suite must pass
- `human_loop.required_before_proceeding: true` means stop and wait for human
- Out-of-scope file changes are an escalation trigger — flag immediately

---

## Template Inventory

### Templates by location

| Location | Templates | Purpose |
|----------|-----------|---------|
| `control/templates/scope/` | `SCOPE_TEMPLATE.md`, `PRD_TEMPLATE.md`, `TASKS_TEMPLATE.yaml`, `CURRENT_STATE_TEMPLATE.yaml` | Planning artifacts |
| `control/templates/handoffs/` | `HANDOFF_TEMPLATE.yaml`, `BRIEF_TEMPLATE.yaml`, `RETURN_HANDOFF_TEMPLATE.yaml` | CTO↔Dev work artifacts |
| `control/templates/session/` | `SESSION_HEADER.md`, `SESSION_START_PROMPT.md`, `SESSION_END_PROMPT.md`, `SESSION_END_PROMPT_CTO.md`, `SESSION_BOOTSTRAP_*.md` | Session lifecycle |
| `control/templates/autonomous/` | `CTO_AUTONOMOUS_SESSION.md`, `DEV_AUTONOMOUS_SESSION.md`, `HALT_CONTRACT.yaml` | AFK loop operation (12 halt conditions) |
| `control/templates/roles/` | `CTO_ROLE_TEMPLATE.md`, `PIPELINE_DEV_ROLE_TEMPLATE.md`, `INFRA_DEV_ROLE_TEMPLATE.md`, `TEST_DEV_ROLE_TEMPLATE.md` | Per-role authority definitions |
| `control/templates/settings/` | `settings.json`, `settings-*-dev.json` | Claude Code configs |
| `skills/SKILL_ROLE_MAP.md` | — | Skill-to-role mapping with integration points |
