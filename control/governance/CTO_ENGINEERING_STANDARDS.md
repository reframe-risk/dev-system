# CTO_ENGINEERING_STANDARDS.md — Engineering Knowledge Base

**Version:** 1.0
**Created:** 2026-04-11
**Status:** ACTIVE — loaded in every CTO session alongside AGENT_ROLES.md
**Scope:** Universal — applies to all projects using this standard

---

## Purpose

This document gives the CTO agent the engineering knowledge it needs to govern
a production-grade project proactively — not just react to what the human observes.

AGENT_ROLES.md defines how the CTO behaves in a session (authority, scope, escalation).
This document defines what the CTO knows: the failure modes, the production standards,
the questions to ask before being asked, and the things that are hard to fix later.

A CTO session loaded with only AGENT_ROLES.md knows how to conduct itself.
A CTO session loaded with both documents knows what a good system looks like and
where this one currently stands against that standard.

---

## How to Use This Document

At the start of every CTO session, after loading project state and the active brief,
the CTO must scan the relevant sections of this document and ask:

> "Does the current project satisfy this standard? If not, is that a known deferral
> or an unknown gap? Should I surface it before executing the brief?"

This is not a checklist to tick. It is a lens to apply. The CTO is expected to
surface gaps proactively — especially the ones the human hasn't asked about.

---

## Part 1 — Project Phase Framework

Every project passes through recognisable phases. The right concerns at each phase
are different. Getting the early phases wrong is expensive because the decisions
compound. Getting the later phases wrong is recoverable, but wastes time.

The CTO must know which phase a project is in and apply the standards for that phase.

---

### Phase 1 — Foundation

**When:** Before any significant implementation begins. Database chosen, repo created,
first API or pipeline skeleton exists.

**What must be decided at this phase — because they are hard to change later:**

- **Data model and layer separation.** What are the logical layers? What data belongs
  in each? How do layers communicate? Cross-layer joins and implicit coupling created
  here become structural debt within weeks. Decide explicitly: layer names, ownership
  rules, what crosses the boundary and how.

- **Database choice and schema discipline.** Why this database? What are the
  migration strategy and rollback approach from day one? Schema constraints
  (NOT NULL, CHECK, UNIQUE, foreign keys) must be designed in — not added after
  data accumulates. Adding constraints retroactively to populated tables is painful
  and error-prone.

- **Primary key and identifier strategy.** How are entities identified across the
  system? If there are multiple source systems or future multi-tenancy requirements,
  identifier collisions are a design problem, not an implementation problem.

- **Git workflow and branch strategy.** What branches exist? What is the PR and
  merge policy? What triggers a deployment? Decide before the first meaningful commit,
  not after the first merge conflict.

- **Secrets management.** Where do API keys, tokens, and credentials live? Never in
  code, never in the repo. `.env` pattern with documented rotation process. Token
  expiry must be tracked — expiring credentials are an operational failure, not bad luck.

- **Repo structure.** Where does code live? Where do migrations live? Where do docs
  live? Where do tests live? A consistent structure matters because agents, developers,
  and CI systems all need to find things reliably.

**CTO questions to ask at Phase 1:**
- Do we have a layer separation document or ADR?
- Is the migration strategy documented, including rollback?
- Are schema constraints enforced at the database level, not just the application level?
- Is there a secrets management approach? Where are tokens tracked?
- Is the git workflow written down?

---

### Phase 2 — First Implementation

**When:** Core functionality is being built. First real data in the system, first
meaningful pipeline or API running end to end.

**What must be established before declaring this phase complete:**

- **A working observability baseline.** You must be able to see what is in the
  database without writing code. A read-only query interface (Datasette, pgAdmin,
  a simple admin endpoint) is not optional — it is how you catch data quality problems
  before they propagate. If you cannot inspect the data easily, you cannot trust it.

- **Migration safety protocol.** By the time the second migration runs, there must
  be a written protocol: snapshot before migration, verify row counts before and after,
  rollback procedure documented. The first migration that fails without a snapshot
  teaches this lesson expensively.

- **A health check.** Something that can be run to confirm the system is in a known
  good state. For a pipeline: a known-input, known-output test. For an API: a
  `/health` or equivalent endpoint. For a database: a row count check against expected
  baseline. Health checks exist so the CTO can verify state without reading all the code.

- **CI from the start.** Even a minimal CI that runs on push — linting, a basic test,
  a schema version check. CI added retroactively is always harder than CI built in.
  The governance gates that enforce data quality and prevent regressions must be
  written as code, not as human checklists.

- **Brief quality standard.** By this phase the brief → dev → handoff workflow is
  established. Briefs must include: explicit file paths, success criteria that can be
  verified without running the full system, a "Do Not" section, and a self-check list.
  A brief that returns a hollow implementation is a brief-writing failure, not just
  a dev failure.

**CTO questions to ask at Phase 2:**
- Can we inspect the database state from a browser or terminal without writing code?
- Is there a written migration safety protocol? Has it been tested?
- Is there a health check that confirms the system is in a known good state?
- Is CI running on every push? What does it check?
- Did the last brief produce what was expected? If not, what was missing from the brief?

---

### Phase 3 — Scale Readiness

**When:** The core implementation works for one instance (one company, one user,
one pipeline run). Now the question is: does it work for N?

**What must be resolved before scaling:**

- **Multi-tenancy design.** If the system will serve multiple independent entities
  (companies, customers, users), how is their data separated? Shared tables with a
  tenant column? Separate databases? Separate schemas? This decision must be made
  before onboarding the second tenant, not the fifth. Retrofitting multi-tenancy
  is one of the most expensive structural changes a system can undergo.

- **Legacy artefact audit.** Every system accumulates artefacts from early
  experimentation — tables that were workarounds, scripts that were one-offs, UNION
  hacks that were "temporary." Before scaling, audit what is in the system and what
  has outlived its purpose. Artefacts that served the first implementation but are
  not part of the intended architecture must be removed before they become load-bearing.

- **Onboarding runbook.** How does a new entity (company, customer, user) enter the
  system? This must be documented as a repeatable process before the second entity
  is onboarded. The runbook must include: what data is required, what validation gates
  must pass, what the rollback looks like if onboarding fails partway through. The
  first onboarding is always bespoke. The second must follow the runbook.

- **Data lifecycle policy.** How is data updated when the source changes? How is
  stale data identified? Is the system append-only, or does it update in place?
  If updating in place: what is the audit trail? If append-only: how is current state
  queried efficiently? These decisions must be explicit.

- **Backup and recovery.** What are the recovery paths if the primary data store
  is corrupted or lost? There must be at least two. Recovery paths must be tested —
  an untested backup is not a backup.

**CTO questions to ask at Phase 3:**
- How does a second tenant enter the system? Is the runbook written?
- What in this system was built as a workaround and has never been cleaned up?
- How does data get updated when the source changes?
- What are the recovery paths? Have they been tested?
- Is there anything in the system that only works because we have one tenant?

---

### Phase 4 — Production

**When:** Real users or clients are consuming the system. Data correctness matters
because errors have external consequences.

**What production requires that earlier phases do not:**

- **Auditability.** Every data change must be traceable: who made it, when, from what
  source, by what process. This is not just good practice — it is the difference
  between being able to answer "why does the register say this?" and not being able to.

- **Deployment and rollback discipline.** Every production change must have a written
  rollback plan before it is applied. "We'll figure it out if something goes wrong"
  is not a rollback plan. For database migrations: snapshot, apply, verify, then
  proceed. Never apply a migration to production that has not been run locally first.

- **Separation of factual and interpretive content.** In systems that produce
  outputs consumed by humans or downstream systems, factual data and interpretive
  data must be stored and managed separately. Factual data (what the law says, what
  the filing shows) is immutable once sourced. Interpretive data (what it means
  for this company) is governed and versioned. Mixing them makes both unreliable.

- **External dependency monitoring.** Legislation changes. APIs change. Tokens expire.
  Source URLs go stale. Production systems must have automated checks that surface
  these changes before they silently corrupt output. Monitoring external dependencies
  is not optional — it is part of the product.

- **Documented decision log.** Every significant architectural decision must be
  recorded as an ADR (Architecture Decision Record) before production. Not because
  the decision will always be wrong, but because the next CTO session, the next dev,
  and the human owner must be able to understand why the system is the way it is
  without reverse-engineering it.

**CTO questions to ask at Phase 4:**
- Can we answer "why does the system say X?" for any output it produces?
- What is the rollback plan for the next migration? Is it written down?
- Are factual and interpretive content stored separately?
- What external dependencies exist? Are they monitored automatically?
- Are the key architectural decisions recorded as ADRs?

---

## Part 2 — Domain Knowledge Library

This section gives the CTO standing knowledge across engineering domains. For each
domain, it defines: what good looks like, what the common failure modes are, and
what to look for in a project that hasn't addressed this domain properly.

---

### Domain 1 — Database and Schema Design

**What good looks like:**
- Schema constraints enforced at the database level (NOT NULL, CHECK, UNIQUE, FK)
- Migration files are the source of truth for schema — never manual edits
- Each migration is atomic, reversible, and tested locally before being applied anywhere else
- Table names and column names are stable — renames require migrations, not find-and-replace
- No UNION hacks between tables that serve the same logical purpose
- No orphaned tables from prior experiments

**Common failure modes:**
- Adding constraints after data exists — requires table recreation or backfill scripts
- Migrations applied directly to production without local validation first
- Schema drift between environments (local, staging, production) that accumulates silently
- Tables that were workarounds becoming load-bearing infrastructure
- Missing CHECK constraints discovered when invalid data enters and corrupts downstream output
- Column names that lie — a column called `source_url` that sometimes contains IDs

**What to look for in a project:**
- Are there tables that nobody can explain the current purpose of?
- Is there a UNION between two tables that serve conceptually the same purpose?
- Is the migration count in sync across all environments?
- Do constraints exist at the DB level, or only as application-layer validation?

**Lesson from reframe-app:** The CHECK constraint gap on relationship_type caused a
live migration failure requiring surgical table recreation of 412k rows. Constraints
must be designed into the schema before data is inserted, not added after.

---

### Domain 2 — Layer Separation and Separation of Concerns

**What good looks like:**
- Named layers with documented responsibilities and boundaries
- Each layer owns its data — no cross-layer direct access except through defined interfaces
- The rule for what belongs in each layer is written down and enforced
- Adding a new entity type or data source doesn't require touching multiple layers

**Common failure modes:**
- Global/policy data and per-entity data mixed in the same tables
- The "temporary" shared table that becomes the dependency everything relies on
- API endpoints that access the database directly, bypassing the data layer
- Logic that should be in one layer appearing in three different places
- No clear answer to "where does this type of data go?"

**What to look for in a project:**
- If I add a second tenant tomorrow, what breaks?
- Is there a written definition of what each layer is responsible for?
- Are there cross-layer dependencies that weren't designed, just accumulated?

**Lesson from reframe-app:** L1/L2/L3 layer separation (ADR-023) emerged from CRM
retirement pain rather than upfront design. The principle — global policy data vs
per-company overlay vs ephemeral application layer — is sound, but it was discovered
through refactoring, not design. The cost was a 213MB database deletion and migrations
88-157 to establish what should have been designed at project start.

---

### Domain 3 — Migration Safety

**What good looks like:**
- Snapshot before every migration (Option D or equivalent)
- Row count verification before and after every migration
- Local validation before any production or remote apply
- Written rollback procedure for every migration that modifies existing data
- Migration files are immutable once committed — never edit a committed migration
- Each migration is numbered sequentially and tracked (local vs remote sync status known)

**Common failure modes:**
- Migration applied to production that was never run locally
- Snapshot skipped "just this once" — the one that fails is always that one
- Migration that modifies data without verifying preconditions (assumes rows exist)
- Remote sync ahead of local pipeline validation
- Migration count out of sync between local and remote with no one noticing

**What to look for in a project:**
- Is there a written migration safety protocol?
- Is the local vs remote migration count tracked explicitly?
- Has the rollback procedure ever been tested?

**Lesson from reframe-app:** EXT-002 M146 first attempt failed on a column name error.
Recovery was only clean because the snapshot workflow had been established. Snapshot
workflow validated under real failure. The protocol must exist before it is needed —
not be discovered during an incident.

---

### Domain 4 — Observability

**What good looks like:**
- Database state is inspectable from a browser or terminal without writing code
- A health check exists that confirms the system is in a known good state
- CI produces a health report on a schedule, not just on push
- Anomalies in data quality surface automatically (orphaned nodes, stale records,
  missing required fields) — they do not require manual discovery
- Schema tab or equivalent: anyone can see what tables exist and how many rows

**Common failure modes:**
- Data quality problems discovered only when a downstream output is wrong
- No way to query the database without writing a script or setting up a local environment
- Health checks that pass when the system is in a degraded state
- Alerts that fire but nobody reads

**What to look for in a project:**
- Can the CTO answer "what is in the database right now?" without running code?
- Is there a scheduled health report that would catch a regression automatically?
- How would we know if a nightly job silently failed?

**Lesson from reframe-app:** Datasette was unscoped and emerged from the need for
SQL query access without local setup. It should have been part of the Phase 2 baseline.
Once deployed (reframe-datasette.fly.dev), it became a daily tool for data quality
review. Observability that arrives late is better than none, but it should be first.

---

### Domain 5 — CI/CD and Automation

**What good looks like:**
- CI runs on every push — minimum: schema version check, key data quality assertions
- Governance gates are code, not human checklists — automated enforcement cannot be skipped
- Scheduled jobs (data refresh, health audit, external dependency checks) are in CI,
  not on someone's cron tab
- The deployment workflow is documented — what triggers a deploy, what the rollback is
- Generated artefacts (HTML exports, reports) are regenerated automatically on data change

**Common failure modes:**
- CI that runs but doesn't catch the failure mode that matters
- Scheduled jobs that nobody checks because there's no alerting on failure
- Manual steps in the deployment that are not documented
- CI that was added after the project was established and doesn't cover legacy paths

**What to look for in a project:**
- Does CI catch a data quality regression without a human noticing first?
- Are there important scheduled jobs? Do they alert on failure?
- Is the deployment process documented well enough that someone else could do it?

**Lesson from reframe-app:** The governance CI gates (onboarding-validation.yml)
enforce bilateral evidence 100%, page_ref 90%, schema version, no stale DRAFTs
on every push. This means regressions cannot be merged silently. CI as enforcement
is more reliable than CI as notification.

---

### Domain 6 — Brief Quality and Dev Handoff

**What good looks like:**
- Every brief names the exact files the dev is expected to touch
- Success criteria are verifiable without running the full system
- A "Do Not" section blocks the most plausible wrong implementations
- A self-check list before marking complete
- Phase structure: brief has at least 2 phases with a validation gate between them
- The brief is specific enough that a dev who has never seen the codebase could
  execute it correctly

**Common failure modes:**
- Brief describes the goal but not the implementation path — dev makes architectural
  decisions that should have been made by the CTO
- No "Do Not" section — dev takes the most expedient path which is the wrong one
- Success criteria that require a full pipeline run to verify — slow feedback loop
- Brief scope that is too large — multiple concerns in one brief increase the risk
  that the handoff is incomplete
- Hollow implementation returned: dev returns code that parses correctly but doesn't
  actually call the API / query the database / handle the error case

**What to look for in a project:**
- Did the last brief produce what was expected on first pass?
- Are there patterns of specific failure that suggest a systematic brief-writing gap?
- Is the "Do Not" section being used, or is it blank?

**Lesson from reframe-app:** DC-S001-2-1b returned a hollow script. The CTO
discovered a working OData v4 API and rewrote it. The brief had described the goal
(check legislation currency) without specifying the mechanism (which API, what
authentication, what output format, what error handling). Brief quality is the
primary lever on dev output quality.

---

### Domain 7 — Secrets and Token Management

**What good looks like:**
- All credentials in environment variables, never in code or committed to git
- Token expiry dates are tracked in project state (current_state.yaml or equivalent)
- Rotation procedure is documented before the token expires, not after
- CI secrets are managed separately from local development secrets
- A record of what credentials exist and where they are used

**Common failure modes:**
- Token expiry discovered when a job fails in production
- Credentials committed to git (even if removed later — git history)
- No documentation of what token is used for what, so rotation breaks things
  in unexpected places
- Different tokens in local vs CI vs production with no documentation of which is which

**What to look for in a project:**
- Are all token expiry dates tracked somewhere that gets reviewed?
- Is there a rotation procedure written down?
- Does anyone know what would break if a given token expired?

**Lesson from reframe-app:** Turso token expiry (2026-03-10) was tracked as URGENT
in current_state.yaml and as BLOCKER-001. The tracking worked. The failure mode is
when this kind of thing is not tracked — discovered only when remote sync fails
mid-pipeline and the cause is unclear.

---

### Domain 8 — Data Lifecycle and Provenance

**What good looks like:**
- Every data record has a traceable source: where it came from, when it was ingested,
  by what process
- Updates to source data produce new records or explicit version transitions —
  not silent overwrites
- DRAFT / COMMITTED / ARCHIVED states or equivalent for records that require
  CTO review before becoming canonical
- Stale data is identified automatically, not discovered when it causes an error
- External source URLs are tracked and verified — a URL that 404s silently is a
  data quality failure

**Common failure modes:**
- Data updated in place with no record of what it was before
- Ingested data committed to the canonical store without a review step
- Source URLs that go stale with no automated check
- No way to answer "when was this data last verified against its source?"
- DRAFT records that never get promoted and accumulate as noise

**What to look for in a project:**
- If a data record is wrong, can we trace how it got into the system?
- Is there a review gate between ingestion and canonical storage?
- Are source URLs checked automatically?

**Lesson from reframe-app:** The document ingest workflow (ingest_document.py)
creates DRAFT evidence nodes that the CTO reviews in Datasette before promoting
to T1 via migration. This pattern — ingest → draft → review → commit — is the
correct approach for any data that requires human judgment before becoming canonical.

---

### Domain 9 — Architecture Decision Records (ADRs)

**What good looks like:**
- Every decision that is hard to reverse has an ADR
- ADRs record: the decision, the options considered, the rationale, and the consequences
- ADRs are immutable once accepted — they constrain future decisions, not just
  document past ones
- The CTO reads all ADRs before proposing any change that might conflict with them
- ADRs are linked from the code and migrations they constrain

**Common failure modes:**
- Architectural decisions made verbally or in session handoffs, never written down
- The same decision re-litigated in every CTO session because it was never recorded
- Code that violates an accepted ADR because the dev didn't know it existed
- ADRs written after the fact to justify a decision rather than to govern future ones

**What to look for in a project:**
- Are there patterns of the same architectural question being raised repeatedly?
- Are there constraints in the codebase that are enforced only by convention,
  not by documentation?
- When a dev makes an architectural choice, do they know what ADRs apply?

**Lesson from reframe-app:** ADR-022 (Model B Direct), ADR-023 (Layer Separation),
ADR-024 (L3 product boundary), ADR-025 (L1 factual only) were all derived from
implementation experience rather than upfront design. Each one is sound. All of them
would have saved refactoring cost if written before the first implementation of the
system they govern.

---

### Domain 10 — Legacy Hygiene

**What good looks like:**
- Every wave or phase begins with an explicit audit: what has outlived its purpose?
- Removed code and tables leave documented traces (archive scripts, migration notes)
  so recovery is possible if the removal was wrong
- The system can be explained from first principles — no "don't touch that, nobody
  knows what it does"
- Technical debt is tracked explicitly (in structural_tasks or equivalent) and
  has an owner and a planned resolution

**Common failure modes:**
- Tables and scripts that were experiments and never got removed
- Code paths that are never executed but not known to be dead
- "Temporary" solutions that became permanent because no one scheduled the cleanup
- Cleanup deferred indefinitely because it is "safe to defer" — it is safe until it isn't

**What to look for in a project:**
- Is there anything in the system that nobody can confidently explain?
- Are there tables with zero rows or rows that date from early experiments?
- What was the last thing removed from this system? When was it?

**Lesson from reframe-app:** Stage 4a required: 9+9 junk tables dropped, 411k
legacy bulk rows purged (DB from 334MB → 10MB), the compliance_requirements UNION
hack removed, 4 tables dropped, CRM directory deleted entirely. All of this was
pipeline-era accumulation that should have been cleaned at wave boundaries, not
allowed to persist into a scale readiness phase.

---

## Part 3 — Proactive CTO Behaviour

This section defines the behaviours expected of the CTO beyond executing the brief.

**At every session start, the CTO must:**

1. Read current_state.yaml and identify any URGENT or BLOCKER items before touching
   the brief. If a blocker blocks the brief, surface it immediately — do not proceed.

2. Check the last handoff artifact. Were the open questions answered? Were the
   deferred items tracked?

3. Ask: "Is the system in the phase I think it is? Do the phase standards apply?"

4. Ask: "Is there anything in Domain 1–10 above that this project has not addressed
   that is becoming urgent given where we are?"

**When writing a brief, the CTO must:**

1. Name the exact files the dev is expected to touch. No brief is complete without
   explicit file paths.

2. Write the "Do Not" section before writing the implementation phases. What is the
   most plausible wrong implementation? Block it explicitly.

3. Define success criteria that can be verified in under 5 minutes without running
   the full system.

4. Classify the risk: LOW (1 system), MEDIUM (2 systems), HIGH (3+ systems or
   shared infrastructure). If HIGH, the brief requires human approval before dev starts.

5. Ask: "Would a dev who has never seen this codebase be able to execute this brief
   correctly?" If not, the brief is not done.

**When reviewing a dev handoff, the CTO must:**

1. Verify every file listed in `files_changed` against the brief's scope. Anything
   touched that is not in the brief is an escalation trigger.

2. Check all validation gates: did they pass? If a gate was skipped, why?

3. Check the "What Was NOT Done" section. Are the deferrals appropriate? Do they
   need to be tracked as structural tasks?

4. Ask: "Did this implementation introduce any new technical debt? Is it tracked?"

---

## Part 4 — Remediation Framework

When applying this standard to an existing project (rather than a greenfield), the
CTO must assess the project against the phase framework and domain knowledge, then
produce a remediation plan that is realistic about sequencing.

**Remediation sequencing principle:** Fix the things that block correctness before
the things that improve cleanliness. Fix the things that affect all future work
before the things that affect only current work.

**Typical remediation priority order:**

1. **Blockers first** — anything in URGENT or BLOCKER state in current_state.yaml
2. **Data integrity** — schema constraints, migration safety, known data quality issues
3. **Observability** — if you cannot see the system, you cannot fix it safely
4. **Layer separation** — if the architecture is unclear, all implementation work
   has a higher error rate
5. **Legacy hygiene** — remove what has outlived its purpose before adding more
6. **CI enforcement** — automate what is currently a human checklist
7. **Documentation** — ADRs, runbooks, data lifecycle policy

The CTO must not attempt to remediate everything in one session. Remediation is
scoped to briefs, like any other work. The remediation plan is the deliverable from
a remediation assessment session — the execution happens in subsequent dev sessions.

---

*This document is part of the ai-dev-control standard. It is updated when a new
lesson from production experience validates a new principle or refines an existing one.
It is not updated to reflect project-specific decisions — those belong in the
project's own ADR directory.*
