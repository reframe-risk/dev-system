# cto-dev-loop — Sandcastle Template

Runs the governance loop from `control/` autonomously — CTO reviews, selects tasks, writes briefs; Dev executes briefs with TDD; orchestrator evaluates halt conditions.

## Quick Start (Local — Docker)

```bash
# Prerequisites: Docker running

# Auth option 1: Max/Pro subscription (no API billing)
# Generate a long-lived token, then add to .sandcastle/.env:
claude setup-token
# → paste token into .sandcastle/.env as CLAUDE_CODE_OAUTH_TOKEN

# Auth option 2: API key billing
# export ANTHROPIC_API_KEY="sk-ant-..."

# Run 1 iteration (default — use during refinement)
npm run sandcastle

# Run 3 iterations
MAX_ITERATIONS=3 npm run sandcastle
```

## Setup

### 1. Copy to your project

```bash
cp -r control/templates/autonomous/sandcastle/cto-dev-loop/ your-project/.sandcastle/
```

### 2. Build the Docker image

```bash
cd your-project/
sandcastle build-image docker
```

### 3. Configure paths

Edit `main.mts` — update the configuration block to match your project layout:

```typescript
const TASKS_PATH = "control/TASKS.yaml";
const CURRENT_STATE_PATH = "control/current_state.yaml";
const SESSION_HEADER_PATH = "control/sessions/SESSION_HEADER.md";
const BOOTSTRAP_STABLE_PATH = "control/sessions/SESSION_BOOTSTRAP_STABLE.md";
const HANDOFFS_DIR = "control/handoffs";
```

### 4. Configure sandbox hooks

Uncomment and adapt the hooks for your project's setup:

```typescript
const hooks = {
  sandbox: {
    onSandboxReady: [
      { command: "npm install" },
      // { command: "pip install -r requirements.txt || true" },
    ],
  },
};
```

### 5. Add npm script

```json
{
  "scripts": {
    "sandcastle": "npx tsx .sandcastle/main.mts"
  }
}
```

### 6. Run

```bash
npm run sandcastle
```

## How It Works

```
Iteration N:
  1. CTO agent (opus) reviews any pending dev return
  2. CTO updates /control docs (TASKS.yaml, current_state.yaml)
  3. CTO selects next task, writes brief (HANDOFF_CTO_DEV_*.yaml)
  4. Dev agent (sonnet) reads brief, implements with TDD
  5. Dev produces tests + return handoff (HANDOFF_DEV_CTO_*.yaml)
  6. Orchestrator evaluates halt conditions (HALT_CONTRACT.yaml)
  7. If no halt -> Iteration N+1
```

## Three Ways to Run

### Option A: Local with Docker (sandcastle)

Your laptop stays on. Full Docker isolation. Mechanical halt enforcement.

```bash
npm run sandcastle
```

### Option B: GitHub Actions (fully remote)

Laptop off. Runs on GitHub infrastructure. Creates a PR with results.

```bash
# Manual trigger
gh workflow run cto-dev-loop.yml

# With custom iterations
gh workflow run cto-dev-loop.yml -f max_iterations=3

# Check status
gh run list --workflow=cto-dev-loop.yml
```

**Setup required:**
- Add `CLAUDE_CODE_OAUTH_TOKEN` (from `claude setup-token`) or `ANTHROPIC_API_KEY`
  to repository secrets (`Settings > Secrets and variables > Actions`)

### Option C: Vercel (fully remote, event-driven)

**C1: Vercel Functions + Vercel Sandbox** — for long-running loops using Vercel
Workflow (durable execution) and Vercel Sandbox (Firecracker microVMs).

**C2: Vercel Cron → GitHub Actions** — simpler: Vercel cron triggers the GitHub
Actions workflow via `gh workflow run`.

See `AFK_EXECUTION_OPTIONS.md` for full details on each option.

## Prerequisites

Before running the loop, your project must have:

- [ ] `control/TASKS.yaml` populated with tasks (run `/to-issues` + `/triage`)
- [ ] Active scope doc linked in TASKS.yaml meta
- [ ] `control/sessions/SESSION_HEADER.md` with immutable rules
- [ ] `control/sessions/SESSION_BOOTSTRAP_STABLE.md` with architectural invariants
- [ ] `control/handoffs/` directory exists
- [ ] Docker installed and running
- [ ] `@ai-hero/sandcastle` installed (`npm install @ai-hero/sandcastle`)
- [ ] Auth configured (OAuth token or API key)

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `MAX_ITERATIONS` | 1 | CTO-Dev cycles before HALT-011 (use 1 during refinement) |
| `CTO_MAX_ITERATIONS` | 1 | Sandcastle sessions per CTO run (1 = single session, no re-invocation) |
| `DEV_MAX_ITERATIONS` | 1 | Sandcastle sessions per Dev run (1 = single session, no re-invocation) |
| `CTO_MODEL` | `claude-opus-4-6` | Model for CTO (judgment-heavy) |
| `DEV_MODEL` | `claude-sonnet-4-6` | Model for Dev (execution-heavy) |

**Why default to 1 session per agent:** Claude Code handles its own internal
tool-call loop within a session. Setting `>1` causes sandcastle to re-invoke
the agent in a new session with no memory of the prior run, wasting tokens
re-discovering done work.

## Halt Conditions

The orchestrator evaluates these after each dev return:

| ID | Condition | Severity |
|----|-----------|----------|
| HALT-001 | Dev returns BLOCKED | HARD — immediate stop |
| HALT-002 | Success criteria failure | SOFT — CTO reviews |
| HALT-003 | No tests produced | HARD — tests are mandatory |
| HALT-004 | Test suite regression | HARD — existing tests broke |
| HALT-006 | Same DC amended 2+ times | HARD — loop is stuck |
| HALT-009 | No eligible P0/P1 tasks | HARD — nothing to do |
| HALT-011 | Max iterations reached | HARD — human checkpoint |
| HALT-012 | Integration test regression | HARD — cross-service contracts broke |

CTO-initiated halts (HALT-008, HALT-009, HALT-010) are handled by the CTO
agent itself — it outputs `"action": "HALT"` in its verdict.

## Structured Output

Both agents produce structured verdicts in XML tags:

- CTO: `<cto_verdict>{ action, dc_reviewed, tasks_closed, next_task, ... }</cto_verdict>`
- Dev: `<dev_verdict>{ outcome, tests_added, tests_failed, success_criteria_passed, ... }</dev_verdict>`

The orchestrator parses these to evaluate halt conditions and track loop state.

## Files

```
.sandcastle/
  main.mts          <- orchestrator (this is what runs the loop)
  cto-prompt.md     <- CTO agent prompt (with {{KEY}} variables)
  dev-prompt.md     <- Dev agent prompt (with {{KEY}} variables)
  Dockerfile        <- Docker image for sandcastle (node + python + claude CLI)
  template.json     <- sandcastle metadata
  README.md         <- you are here
```

Governance docs consumed by the loop live in `control/`.
