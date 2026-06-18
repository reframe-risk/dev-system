# PROMPT_DISCIPLINE.md — The 7 Patterns

**Version:** 1.0
**Created:** 2026-03-05
**Status:** ACTIVE — reference standard for all agent prompting in this system

---

## The Core Insight

The gap between average and expert AI output is not model intelligence. It is prompt
discipline. OpenAI and Anthropic engineers treat prompting as system design — not
clever wording. Their internal documents reveal a disciplined approach built around
structure, constraints, and controlled behaviour.

Their goal is not impressive-sounding outputs. The goal is to reduce errors, increase
first-pass success, and produce results teams can actually trust.

These 7 patterns are the operational standard for this system. Every brief, every
session document, and every agent system prompt in this repo is designed against them.

---

## Pattern 1: Structured Constraints

**What it is:** Define explicit rules for what the model must and must not do before
describing the task.

**The problem:** Vague instructions produce inconsistent outputs. The model fills
ambiguity with plausible-sounding content that may be wrong.

**The approach:** Write rules as a numbered list at the top of the system prompt.
Include both positive constraints (always do X) and negative constraints (never do Y).
Be specific about format, tone, scope, and edge cases.

**In this system:** SESSION_HEADER.md is the primary application. Every brief opens
with a constraints section before describing the task.

**Example:**
> "Never speculate about pricing. Always cite a source for factual claims. Output must
> be under 200 words. Do not reference competitors by name."

**The result:** Outputs become predictable and auditable. Edge cases are handled
consistently. The model does not improvise in ways that create problems downstream.

---

## Pattern 2: Task Decomposition with Validation Gates

**What it is:** Break complex tasks into sequential phases where each phase validates
the previous one before proceeding.

**The problem:** Long single-prompt requests accumulate errors silently. A mistake in
step 2 propagates through steps 3, 4, and 5 with no opportunity for correction.

**The approach:** Identify the natural phases of the task. Make each phase an explicit
step with a defined output. Add a validation check between phases — either a self-check
prompt or a human review point before the next step runs.

**In this system:** Engineering briefs define explicit phases with success criteria.
The handoff artifact is the validation gate between agent sessions.

**Example:**
> Phase 1: Extract key facts from the document.
> Phase 2: Verify the extracted facts are complete.
> Phase 3: Draft the summary using only the verified facts.

**The result:** Errors surface early when they are cheap to fix. The final output can
be traced back through each validated step.

---

## Pattern 3: Output Format Enforcement

**What it is:** Specify the exact structure of the output, not just the content.

**The problem:** Without format constraints, AI outputs vary in structure across runs.
This creates downstream processing problems and makes outputs hard to scan or compare.

**The approach:** Define the output schema explicitly. Use examples of correct format,
not just descriptions. Specify what happens in edge cases.

**In this system:** The CTO handoff artifact has a fixed schema. Brief output sections
specify exact document names and paths. Session end produces a structured checklist,
not free-form prose.

**Example:**
> "Output must be valid JSON with these fields: { \"finding\": string,
> \"confidence\": \"high\" | \"medium\" | \"low\", \"source\": string | null }.
> No other fields. No explanatory text outside the JSON block."

**The result:** Outputs are consistent across runs. Downstream agents that consume
the output do not need to parse ambiguous formats.

---

## Pattern 4: System/User Role Separation

**What it is:** Separate persistent behavioural rules (system prompt) from
task-specific instructions (user prompt / brief).

**The problem:** When rules and task instructions are mixed, the model treats them
with equal weight. Rules can be overridden by later instructions or forgotten.

**The approach:** Put all governance rules, persona definitions, and behavioural
constraints in the system prompt (SESSION_HEADER.md). Put task-specific content in
the brief. Never repeat system prompt rules in the brief — repetition signals they
are negotiable.

**In this system:** SESSION_HEADER.md is the system prompt layer. Engineering briefs
are the task layer. The load order in SESSION_START_PROMPT.md enforces this separation.

**Example:**
> System prompt: You are a CTO advisory. Never modify production code.
> Brief: Analyse the Phase 4 filter logic and propose a fix.

**The result:** Behavioural rules persist reliably across the session. Task instructions
can vary without affecting rule enforcement.

---

## Pattern 5: Temperature Control by Task Type

**What it is:** Set the model's randomness parameter based on whether the task
requires creativity or precision.

**The problem:** Using default temperature for all tasks produces outputs that are
either too creative for factual work or too rigid for generative work.

**The approach:**
- Low temperature (0.0–0.2): consistency, factual accuracy, classification, structured
  output, code generation, migration scripts, schema definitions
- Higher temperature (0.7–1.0): brainstorming, architectural option generation,
  brief drafting, scenario planning

**In this system:** CTO analysis sessions use low temperature. Brief drafting and
option generation use moderate temperature. Document temperature alongside the prompt
so it can be reproduced.

**The result:** Factual tasks produce consistent, reproducible outputs. Creative tasks
produce genuine variation.

---

## Pattern 6: Self-Checking Before Final Output

**What it is:** Instruct the model to review its own output against the stated
constraints before returning it.

**The problem:** Models generate outputs that satisfy the surface request while missing
edge cases, violating constraints, or containing errors that a simple review would catch.

**The approach:** Add a self-check step at the end of every brief: "Before marking this
task complete, verify: [criteria]. If any check fails, revise before stopping."

**In this system:** Every engineering brief template includes a "Self-Check Before
Marking Complete" section with a checkbox list. SESSION_END_PROMPT.md includes a
governance compliance checklist that functions as the session-level self-check.

**Example:**
> "Before outputting your final response, verify: (1) every claim is supported by a
> source, (2) the output is under 300 words, (3) no speculative language is used.
> Revise if any check fails."

**The result:** First-pass quality improves measurably. Constraint violations are caught
within the same call rather than requiring a follow-up prompt.

---

## Pattern 7: Negative Constraints

**What it is:** Explicitly list what the model must not do, in addition to what it
should do.

**The problem:** Models default to being helpful, which means they fill gaps by doing
something plausible when instructions are ambiguous. This produces confident-sounding
wrong answers, unsolicited additions, and scope creep.

**The approach:** For every task, ask: what would a plausible but wrong response look
like? Write a negative constraint that blocks it. Every brief must have a "Do Not"
section.

**In this system:** Engineering briefs have an explicit "Do Not" section. SESSION_HEADER.md
has a "Prohibited Modifications" section. SESSION_END_PROMPT.md ends with explicit
"Do NOT propose next steps / Do NOT expand scope" instructions.

**Common negative constraints for this system:**
- Do not re-open completed delivery candidates
- Do not propose architectural changes when the brief asks for analysis only
- Do not apply migrations before local validation passes
- Do not sync to remote before local pipeline confirms expected results
- Do not add new governance rules without owner approval
- Do not infer scope beyond what is documented

**The result:** Outputs stay within scope. The model does not pad responses or add
protective caveats that dilute the signal.

---

## How the Patterns Work Together

These patterns are a layered system, not independent techniques:

- **Patterns 1 and 7** (Structured Constraints + Negative Constraints) define the
  boundary of acceptable output
- **Pattern 4** (Role Separation) makes those boundaries persistent across the session
- **Pattern 2** (Task Decomposition) applies them at each phase with validation gates
- **Pattern 3** (Output Format) makes results auditable and handoff-ready
- **Pattern 5** (Temperature) calibrates the model for the task type
- **Pattern 6** (Self-Checking) catches violations before they reach the human or the
  next agent

Applied together, the result is a prompt that behaves like a specification — one that
an agent can execute consistently, that a team can reason about, and that can be tested
and improved over time.

---

## Applying Patterns in This System

| Document | Patterns Applied |
|---|---|
| SESSION_HEADER.md | 1, 4, 7 |
| SESSION_START_PROMPT.md | 2, 4 |
| SESSION_END_PROMPT.md | 3, 6, 7 |
| SESSION_BOOTSTRAP_STABLE.md | 1, 4 |
| SESSION_BOOTSTRAP_CURRENT.md | 3 |
| Engineering Brief Template | 1, 2, 3, 6, 7 |
| CTO Handoff Artifact | 3 |
| AUTONOMOUS_EXECUTION.md | 1, 7 |
