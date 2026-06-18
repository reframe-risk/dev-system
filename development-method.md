# Development Method — Consolidated

A merged methodology combining a three-role YAML-handoff system with Matt Pocock's module-and-vertical-slice approach, plus AFK execution via Sandcastle. Designed as project context for setting up a local repo to build software with AI agents.

---

## Part 1 — Core concepts (Matt Pocock's contribution)

### Modules vs layers

A **layer** is a horizontal region of the system — UI, API, domain, persistence. Layers describe *where code runs*.

A **module** is a unit of code with an interface and an implementation. Modules describe *what the system does for the user*. Good modules are usually named after **domain concepts** (Order, Payment, Inventory) rather than technical layers (OrderController, OrderService, OrderRepository).

A single deep module typically cuts vertically through several layers. An `Order` module may own its API handler, its domain rules, and its DB writes — callers invoke `order.place(items)` and don't see any of the internals.

### Diagram — layers vs modules

```
                    ┌─────────────────────────────────────────────┐
                    │ Order   │ Payment   │ Inventory   (modules) │
        ┌───────────┼─────────┴───────────┴─────────────┼─────────┤
   API  │           │ ▓▓▓▓▓▓▓ │ ▓▓▓▓▓▓▓▓▓ │ ▓▓▓▓▓▓▓▓▓▓▓ │         │
   Dom  │           │ ▓▓▓▓▓▓▓ │ ▓▓▓▓▓▓▓▓▓ │ ▓▓▓▓▓▓▓▓▓▓▓ │ layers  │
   Ing  │           │ ▓▓▓▓▓▓▓ │ ▓▓▓▓▓▓▓▓▓ │ ▓▓▓▓▓▓▓▓▓▓▓ │         │
   DB   │           │ ▓▓▓▓▓▓▓ │ ▓▓▓▓▓▓▓▓▓ │ ▓▓▓▓▓▓▓▓▓▓▓ │         │
        └───────────┴─────────────────────────────────────────────┘
                    Modules cut vertically through layers
```

Layers are acknowledged but not formalised. The structure that matters is the module map, named in domain language.

### The deletion test

Point at any module and ask: *if I deleted this and inlined its contents into every caller, what happens to total system complexity?*

- **Complexity concentrates** — same logic now appears in every caller, repeated. Module was earning its keep; keep it.
- **Complexity just moves** — callers get marginally bigger but nothing fundamentally changes. Module was a shallow pass-through; it can be deleted, or (more often) **deepened** by absorbing what callers were doing around it.

Deep module = small interface, large implementation. The gap between "what a caller has to know" and "what the module actually does" is where the value lives. The deletion test forces that gap to be visible.

### Vertical slices vs modules

These get conflated because both are vertical. They're not the same thing.

| | Vertical slice | Module |
|---|---|---|
| What | Unit of work | Unit of code |
| Lifespan | Temporary — ticket, closes when shipped | Permanent — lives in the codebase |
| Verb/noun | Verb: "let a customer place an order" | Noun: "the Order module" |
| Example | Slice 1: `order.place()`; Slice 2: `.cancel()`; Slice 3: `.applyDiscount()` | Order module grows across all three slices |

Slices are *how you make progress*. Modules are *what accumulates as a result*. Each slice creates or grows a module. Architecture review checks whether the accumulated modules are still deep.

### Horizontal slicing is the antipattern

Don't build "all the schema, then all the API, then all the UI." That tends to produce shallow modules at every layer because no real end-to-end use case has been pulled through them yet to discover what the interface should hide.

### Domain language as shared state

Two files anchor everything:

- `CONTEXT.md` — the project's domain glossary. Names of entities (Order, Customer, Shipment), names of operations users perform, names of important state transitions. This is what makes module names *domain-named* instead of *file-path-named*.
- `docs/adr/` — Architecture Decision Records. Lightweight markdown files capturing decisions that are hard to reverse and surprising without context. Read by future-you and by AI agents working in the codebase.

The systems engineer owns these. Both the CTO and dev roles read from them.

---

## Part 2 — The three-role system (your contribution)

### Roles and timescales

```
┌─────────────────────────────────────────────────────────────┐
│  Systems Engineer  (YOU)             weeks → months         │
│  • Owns CONTEXT.md, ADRs, module map                        │
│  • Architectural calls, deletion-test reviews               │
│  • Cross-store coordination decisions                       │
└────────────────────────┬────────────────────────────────────┘
                         │ ↓ Architectural state handoff (YAML)
                         │   module_map · domain_terms
                         │   constraints · active_ADRs · deepening_intents
┌────────────────────────┴────────────────────────────────────┐
│  CTO / Lead Dev  (AI)                days                   │
│  • Take feature need + arch state → produce vertical slices │
│  • PRDs, slice decomposition, prioritisation                │
│  • Writes slice handoffs                                    │
└────────────────────────┬────────────────────────────────────┘
                         │ ↓ Slice handoff (YAML)
                         │   slice_description · acceptance_criteria
                         │   target_module · referenced_domain_terms
┌────────────────────────┴────────────────────────────────────┐
│  Dev  (AI)                           hours                  │
│  • TDD: red → green → refactor per slice                    │
│  • Implementation                                           │
│  • Writes return handoff                                    │
└────────────────────────┬────────────────────────────────────┘
                         │ ↑ Return handoff (YAML) — to CTO
                         │   status · code_refs
                         │   architectural_flags · proposed_ADRs
                         │
                         │ ↑↑ Aggregated signal (YAML) — CTO → SE
                         │    drift_observed · shallow_modules_forming
                         │    review_recommended

           ↺ Architecture review triggered by signal,
             not just by calendar
```

### Why three roles, not two or four

- **Systems engineer above CTO** earns its place because architecture and feature decomposition are different cognitive jobs at different timescales. The CTO would be overloaded otherwise.
- **CTO and lead dev are merged** into one role. Splitting them creates a translation layer that loses information without adding judgement.
- **No separate testing role.** TDD is how the dev *builds*, not a separate phase. Acceptance/integration testing rides with the systems engineer's ownership of the PRD.

### Why YAML handoffs (vs GitHub issues)

Pocock's skills assume issues as the handoff medium. Your YAML handoffs do the same job, with one structural advantage: **the return path is first-class.** Issues just close; YAML returns can carry architectural flags as structured fields.

That means signal flows back up — per-slice — rather than being captured only in periodic full-codebase reviews. The architecture review cycle gets *triggered by signal*, not just by calendar.

### Handoff schemas (sketch)

**Architectural state — Systems Engineer → CTO**
```yaml
module_map:
  Order:
    interface: [place, cancel, applyDiscount]
    flagged: deepen  # or: stable, shallow, splitting
    notes: callers currently doing inventory checks externally
domain_terms:
  - Order: a customer's request to purchase items
  - Inventory: available stock per SKU
constraints:
  - graph_db: stores customer relationships only
  - relational_db: source of truth for transactions
active_adrs: [adr-003, adr-007]
deepening_intents:
  - module: Order
    intent: absorb pre-call inventory validation from callers
```

**Slice handoff — CTO → Dev**
```yaml
slice: order_apply_discount_v1
description: customer can apply a single discount code at checkout
acceptance_criteria:
  - discount validated against active codes table
  - applied amount visible in order summary
  - failure modes return structured error
target_module: Order
new_method: applyDiscount
referenced_domain_terms: [Order, DiscountCode]
test_strategy: tdd
```

**Return handoff — Dev → CTO**
```yaml
slice: order_apply_discount_v1
status: complete
code_refs:
  - src/domain/order.ts
  - src/domain/order.test.ts
architectural_flags:
  - shallow_drift: DiscountCode module has only one method, may be premature
  - caller_pattern: 3 callers wrap applyDiscount in identical try/catch
proposed_adrs:
  - title: discount stacking policy
    reason: encountered ambiguity, picked single-discount, may need revisiting
```

**Aggregated signal — CTO → Systems Engineer**
```yaml
since_last_review: 2026-04-28
slices_completed: 6
flags_raised:
  Order: [shallow_drift x 2, caller_pattern x 3]
  DiscountCode: [shallow_drift x 1]
review_recommended: true
suggested_focus: Order module deepening, absorb caller wrappers
```

---

## Part 3 — How the two systems combine

### What Matt's method contributes
Methodology — *how to think* about code:
- Module = unit of code, domain-named
- Vertical slice = unit of work, end-to-end
- Deletion test = diagnostic for shallow modules
- TDD = red/green/refactor per slice
- `CONTEXT.md` and ADRs as shared state

### What your system contributes
Plumbing — *how work flows* between roles:
- Three explicit roles with distinct timescales
- YAML handoffs in both directions
- Per-slice architectural flags from dev
- Aggregated signal from CTO triggers reviews

### How they interact

The systems engineer's architectural state handoff carries two kinds of content:

1. **Structural facts** — modules, vocabulary, ADRs. Shapes how slices get *named* and *targeted*.
2. **Deepening intents** — flagged modules. Shapes how slices get *scoped*.

Deepening rides along with feature work, not as a separate cycle. When a slice touches a module flagged for deepening, the CTO scopes the slice slightly larger to absorb the caller patterns the dev would otherwise leave in place.

When a structural change is too big for ride-along (split a module, introduce a new coordinator), the systems engineer authors it as architectural slices that flow through the same pipeline.

### Cadence of the architecture review

- **Per-slice (CTO writing handoff):** lightweight module check — which module, deeper or shallower?
- **Per-slice (dev returning handoff):** flag drift honestly in YAML.
- **Aggregated (CTO → SE):** summary of flags across recent slices.
- **Formal review (SE running `improve-codebase-architecture`):** triggered by aggregated signal, or every couple of weeks if signal is quiet, or before a major new scope of work.

The lightweight checks happen continuously. The heavy diagnostic skill runs occasionally — your YAML signal channel means you can run it less often than Pocock's calendar-driven recommendation, because per-slice surveillance is tighter.

---

## Part 4 — AFK execution via Sandcastle

Matt's separate project [Sandcastle](https://github.com/mattpocock/sandcastle) handles agent execution in isolated environments. It complements the methodology rather than being part of it.

### What Sandcastle does

A TypeScript library that runs coding agents in sandboxed worktrees. Provider-agnostic — Docker, Podman, Vercel, or custom. Two modes:

- **Interactive** — run an agent attached to a worktree, you're in the loop.
- **AFK** — sandbox a worktree, hand it to an agent, come back to a branch with commits.

### How it fits

In the three-role system, Sandcastle is the dev role's execution environment for AFK work. The flow:

1. CTO writes a slice handoff (YAML).
2. The handoff (or a script that reads it) launches a Sandcastle run with `claudeCode()` as the agent and the slice handoff as the prompt.
3. The agent works in an isolated worktree, runs TDD, commits to a branch.
4. On completion, a return handoff (YAML) is generated — either by the agent directly or by a wrapping script that reads the diff, test output, and commit history.
5. The return handoff feeds back to the CTO.

### Sandbox provider notes

- Docker is the most common local choice.
- For genuine isolation (the agent can't reach your host), use Docker or Podman with `branchStrategy: "branch"` so changes go to a temp branch you review before merging.
- For trust-the-agent flows, `merge-to-head` brings changes back to the main branch automatically.

### What needs building

- A YAML schema spec for each handoff type (above is a sketch).
- A small launcher script: reads a slice handoff, configures Sandcastle, runs the agent with the handoff as prompt context.
- A return-handoff generator: post-run, reads the worktree diff and produces structured YAML — including architectural flags. Either the agent writes this as its final action, or a separate "QA agent" reads the worktree and produces it.
- A signal aggregator: reads return handoffs over time, produces the CTO → SE summary handoff when flags cross a threshold.

---

## Part 5 — Setting up a new repo

### Day-one steps (new app)

1. Install Pocock's skills — clone [mattpocock/skills](https://github.com/mattpocock/skills) into your `.claude` directory or equivalent.
2. Run `setup-matt-pocock-skills`, choosing **local markdown** as the issue tracker (not GitHub) since your handoffs are YAML, not issues. This scaffolds `AGENTS.md` (or `CLAUDE.md`) and `docs/agents/`.
3. Write `CONTEXT.md` — the domain glossary. An hour minimum. Name the entities, operations, and key state transitions in your domain.
4. Write 1–2 initial ADRs capturing foundational decisions (stack, stores, broad architectural shape).
5. Install Sandcastle (`@ai-hero/sandcastle`), run `sandcastle init` to scaffold `.sandcastle/`.
6. Set up handoff directories: e.g. `.handoffs/architectural/`, `.handoffs/slices/`, `.handoffs/returns/`, `.handoffs/signals/`.
7. Write the launcher script that bridges YAML handoffs to Sandcastle runs.

### Day-one steps (existing app, mid-flight)

If currently working on a scope and want to introduce the method:

1. Finish the in-flight scope first. Don't refactor mid-stream.
2. *During* the in-flight scope, optionally write `CONTEXT.md` — costs little, sharpens thinking.
3. Once the scope is done and the app is working: install skills + Sandcastle, write/expand `CONTEXT.md` and 1–2 ADRs, run `improve-codebase-architecture` to get an initial deepening map.
4. Pick 1–2 deepening opportunities the architecture review surfaces. Don't try to fix everything.
5. Begin the full pipeline (architectural state → slice → dev → return) for the next scope of features.

---

## Part 6 — Principles to keep visible

A short list to keep in `AGENTS.md` or pinned in the project:

- **Modules are domain-named, not layer-named.** OrderController/OrderService/OrderRepository is the antipattern.
- **Slices are vertical and end-to-end.** Never "all the schema, then all the API."
- **The deletion test is the diagnostic for module depth.** Apply it before designing, not just after.
- **Deepening rides with feature work** when possible. Standalone deepening only when ride-along can't absorb the change.
- **Honest return handoffs are the loop.** A dev that doesn't flag drift breaks the whole signal channel.
- **The systems engineer's judgement is yours.** AI can draft `CONTEXT.md` and ADRs; what gets committed to is your call.
- **Run the heavy architecture skill when signal warrants, not on autopilot.**
- **Trust the workflow over heroic interventions.** If a slice is hard, the slice is too big — go back to the CTO and re-decompose.

---

## References

- Matt Pocock's skills repo: https://github.com/mattpocock/skills
- Sandcastle (AFK orchestration): https://github.com/mattpocock/sandcastle
- John Ousterhout, *A Philosophy of Software Design* — source of the deep-modules concept and deletion test reasoning
