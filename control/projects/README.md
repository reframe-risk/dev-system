# /projects

One directory per project using the ai-dev-control standard.

Each project directory contains:
- `README.md` — what the project is, adaptation notes, CTO session load order
- `current_state.yaml` — structured volatile state, updated by agent at session end
- `handoffs/` — committed YAML handoff artifacts (the structured replacement for
  text prompts passed between agents)

---

## Projects

| Project | Status | Repo |
|---|---|---|
| reframe-app | Active — Wave 3 | https://github.com/reframe-risk/reframe-app |
| [next project] | — | — |

---

## Adding a New Project

1. Copy `_template/` to a new directory named after the project repo
2. Fill in `README.md` — project description, adaptation notes, CTO context
3. Fill in `current_state.yaml` — adapt metric fields to the project
4. Create `handoffs/` directory
5. Add a row to the table above
6. First CTO session reads this directory before touching the project repo

---

## The Role of This Layer

This `/projects` layer sits between the standard (`/control`, `/schemas`, `/templates`)
and the project repos themselves. It gives any CTO session full context about a project
without needing direct repo access for orientation — the README and current_state.yaml
are sufficient to start a session, ask the right questions, and produce a valid brief
or handoff.

It also makes the human relay unnecessary. Instead of:

  Human ← CTO session output (text) → Human → Dev terminal (text paste)

The flow becomes:

  CTO session → commits handoff.yaml to projects/[project]/handoffs/
  Human reviews human_loop fields (30 seconds)
  Dev session reads handoff.yaml directly → proceeds autonomously

The human is the decision gate, not the data pipe.
