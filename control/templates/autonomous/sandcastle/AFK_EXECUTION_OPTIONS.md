# AFK Execution Options

**Version:** 1.0
**Created:** 2026-05-20
**Purpose:** Documents three approaches for running the CTO-Dev loop autonomously,
from simplest to most capable. Choose based on your isolation needs, infrastructure,
and how truly "hands off" you want to be.

---

## Option A: Shell Script (simplest, runs today)

A bash script that calls `claude` CLI in non-interactive mode, alternating CTO and
Dev prompts on the host machine. No sandbox isolation.

### How it works

```bash
#!/bin/bash
# afk-loop.sh — minimal CTO-Dev loop
set -euo pipefail

MAX_ITERATIONS=${1:-5}
HANDOFFS_DIR="docs/handoffs"
DATE=$(date +%Y-%m-%d)

for i in $(seq 1 $MAX_ITERATIONS); do
  echo "=== Iteration $i/$MAX_ITERATIONS ==="

  # CTO: review + select + brief
  claude --print \
    --system-prompt "$(cat docs/control/CTO_AUTONOMOUS_SESSION.md)" \
    --allowedTools "Read,Write,Glob,Grep,Bash(git *),Bash(ls *)" \
    "Review any pending dev return, select next task, write brief. Date: $DATE"

  # Find the latest brief
  BRIEF=$(ls -t $HANDOFFS_DIR/HANDOFF_CTO_DEV_*.yaml 2>/dev/null | head -1)
  if [ -z "$BRIEF" ]; then
    echo "No brief found. CTO may have halted. Stopping."
    break
  fi

  # Dev: execute the brief
  claude --print \
    --system-prompt "$(cat docs/control/DEV_AUTONOMOUS_SESSION.md)" \
    --allowedTools "Read,Write,Edit,Glob,Grep,Bash(*)" \
    "Execute the brief at $BRIEF. Date: $DATE"

  echo "Iteration $i complete."
done

echo "Loop finished."
```

### Pros
- Works immediately — no dependencies beyond `claude` CLI
- Easy to understand and modify
- Full access to host filesystem (no copy overhead)

### Cons
- No sandbox isolation — dev agent can touch any file
- No mechanical halt enforcement — script doesn't parse verdicts
- No branch management — all work happens on current branch
- Fragile — if agent output format changes, script doesn't adapt
- Must leave terminal running

### When to use
- Testing the governance templates before investing in sandcastle setup
- Simple projects with low risk tolerance for agent mistakes
- Quick iteration on prompt design

---

## Option B: Sandcastle (recommended, needs Docker)

The `cto-dev-loop` sandcastle template in this repo. Runs CTO and Dev agents in
isolated Docker containers with proper branch management and halt condition evaluation.

### How it works

```
your-project/
├── .sandcastle/
│   ├── template.json       ← template metadata
│   ├── main.mts            ← orchestration script (TypeScript)
│   ├── cto-prompt.md       ← CTO agent prompt with {{KEY}} variables
│   └── dev-prompt.md       ← Dev agent prompt with {{KEY}} variables
├── docs/
│   ├── control/            ← governance docs (TASKS.yaml, etc.)
│   └── handoffs/           ← briefs and returns
└── ...
```

### Setup

```bash
# 1. Install sandcastle
npm install @ai-hero/sandcastle

# 2. Copy template to your project
cp -r dev-system/roles-control/templates/sandcastle/cto-dev-loop/ your-project/.sandcastle/

# 3. Configure paths in main.mts (edit the configuration block)

# 4. Build Docker image
cd your-project && sandcastle build-image docker

# 5. Run
npx tsx .sandcastle/main.mts
```

### Pros
- Docker isolation — dev agent can only touch files in the sandbox
- Branch management — each iteration gets its own branch (merge-to-head)
- Mechanical halt enforcement — orchestrator parses verdicts, evaluates HALT_CONTRACT
- Structured output — typed JSON verdicts from both agents
- Proper logging — each iteration logged to `.sandcastle/logs/`
- Reproducible — same sandbox image every time

### Cons
- Requires Docker installed and running
- Slower startup (container creation per iteration)
- Must leave terminal running (not truly remote)
- TypeScript orchestration — more complex to modify than bash

### When to use
- Production-grade autonomous execution
- Projects where dev mistakes are costly (schema changes, data corruption)
- When you want proper audit trail and halt enforcement
- Multi-developer projects where branch management matters

### Configuration

See `cto-dev-loop/README.md` for full setup instructions and configuration options.

---

## Option C: Remote Execution (Vercel / cloud, fully AFK)

Deploy the orchestrator as a server-side process. The loop runs on remote
infrastructure — your laptop can be off. Results pushed to a branch, human
notified via webhook.

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Vercel / Cloud Server                                   │
│                                                          │
│  Cron trigger (e.g. every 2 hours)                       │
│       ↓                                                  │
│  Orchestrator (main.mts adapted for serverless)          │
│       ├── CTO agent (Anthropic API)                      │
│       │   └── reads/writes via git clone                 │
│       ├── Dev agent (Vercel Sandbox or API)               │
│       │   └── isolated execution environment             │
│       └── Halt evaluator                                  │
│            └── webhook to Slack/email on halt             │
│                                                          │
│  Results: git push to feature branch                     │
│  Notification: webhook with iteration summary            │
└─────────────────────────────────────────────────────────┘
```

### Approaches

**C1: Vercel Functions + Vercel Sandbox**

Use Vercel's serverless functions as the orchestrator and Vercel Sandbox
(Firecracker microVMs) for dev agent isolation.

```typescript
// api/loop/route.ts (Next.js API route)
import * as sandcastle from "@ai-hero/sandcastle";
import { vercel } from "@ai-hero/sandcastle/sandboxes/vercel";

export async function POST() {
  const result = await sandcastle.run({
    agent: sandcastle.claudeCode("claude-sonnet-4-6"),
    sandbox: vercel(),
    promptFile: "./prompts/dev-prompt.md",
    // ...
  });

  // Push results, send webhook
  return Response.json({ status: "complete", commits: result.commits.length });
}
```

Trigger via Vercel Cron:
```json
// vercel.json
{
  "crons": [{
    "path": "/api/loop",
    "schedule": "0 */2 * * *"
  }]
}
```

**C2: GitHub Actions**

Run the orchestrator as a GitHub Actions workflow, triggered by cron or webhook.

```yaml
# .github/workflows/afk-loop.yml
name: CTO-Dev Loop
on:
  schedule:
    - cron: '0 */4 * * *'  # Every 4 hours
  workflow_dispatch:         # Manual trigger

jobs:
  loop:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm install
      - run: npx tsx .sandcastle/main.mts
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
      - uses: peter-evans/create-pull-request@v6
        with:
          title: "AFK Loop — iteration results"
          branch: afk-loop/${{ github.run_number }}
```

**C3: Dedicated Server (Railway / Render / EC2)**

Long-running process on a dedicated server. Most flexible, most ops overhead.

```bash
# Run with nohup or systemd
nohup npx tsx .sandcastle/main.mts > loop.log 2>&1 &
```

### Pros
- Truly AFK — laptop off, loop runs
- Can trigger on schedule (cron) or event (new scope approved)
- Webhook notifications on halt
- Git push on completion — human reviews a PR, not raw files

### Cons
- Most complex setup — needs API keys, git credentials, webhook config
- Cost — compute + API calls running unattended
- Debugging is harder — logs are remote
- Security — API keys stored in cloud, git credentials needed
- Vercel function timeout limits (may need Vercel Workflow for long runs)

### When to use
- Mature projects with stable governance templates
- When you want overnight/weekend execution
- When iteration count is high (10+ DCs per scope)
- When multiple team members need visibility into loop progress

### Prerequisites for remote
- Anthropic API key stored securely (Vercel env vars, GitHub secrets, etc.)
- Git credentials for pushing (deploy key or GitHub App token)
- Webhook endpoint for halt notifications (Slack, email, or custom)
- Tested locally with Option B first — do not go straight to remote

---

## Migration Path

```
Option A (shell script)     ← start here to test prompts
    ↓ once prompts are stable
Option B (sandcastle)       ← move here for proper isolation
    ↓ once loop is reliable
Option C (remote)           ← move here for fully AFK
```

Each option uses the same governance templates (CTO_AUTONOMOUS_SESSION.md,
DEV_AUTONOMOUS_SESSION.md, HALT_CONTRACT.yaml). The prompts are portable —
only the orchestration layer changes.

---

## Comparison

| | Option A | Option B | Option C |
|---|---|---|---|
| **Setup time** | Minutes | 1-2 hours | Half day |
| **Isolation** | None | Docker container | VM / container |
| **Branch mgmt** | Manual | Automatic | Automatic + PR |
| **Halt enforcement** | None | Mechanical | Mechanical + webhook |
| **Laptop required** | Yes (terminal open) | Yes (terminal open) | No |
| **Cost** | Free (local compute) | Free (local compute) | API + compute costs |
| **Debugging** | Easy (local) | Easy (logs) | Harder (remote logs) |
| **Best for** | Testing | Production (local) | Production (remote) |
