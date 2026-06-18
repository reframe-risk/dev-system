# CLAUDE_CODE_SETTINGS.md — Tooling Layer

**Version:** 1.0
**Created:** 2026-03-05
**Status:** ACTIVE — the practical tooling implementation of AUTONOMOUS_EXECUTION.md

---

## What This Document Is

AUTONOMOUS_EXECUTION.md defines *what* agents are allowed to do without pausing.
This document defines *how* Claude Code is configured to enforce that at the tooling
level. The two must be kept in sync — if AUTONOMOUS_EXECUTION.md says an action is
autonomous but settings.json has no allow rule for it, the agent will still be prompted.

---

## The Three Sources of "Press Enter" Friction

Understanding the problem requires distinguishing three separate causes:

**1. Permission prompts for file edits and bash commands**
Claude Code asks before editing files or running commands. Solved by `acceptEdits`
mode and `permissions.allow` rules.

**2. Sandbox gaps**
Commands not sandboxed or not covered by allow rules still prompt, even with
`--dangerously-skip-permissions` in some configurations. Solved by enabling sandbox
with `autoAllowBashIfSandboxed: true`.

**3. The interactive loop itself**
Claude Code is designed to wait for human input between turns. This is different from
the permission problem — it is the architecture of the tool. Solved only by running
headless agents, scripted loops, or full auto-approval mode.

The goal of this document is to solve (1) and (2) selectively, without going fully
unsafe on (3).

---

## Permission Mode Hierarchy

From least to most permissive:

| Mode | What it does | When to use |
|---|---|---|
| Default (ask) | Prompts for all edits and commands | Never — too much friction |
| `acceptEdits` | Auto-accepts file edits, still prompts for bash | Safe baseline for all agents |
| `acceptEdits` + `allow` rules | Auto-accepts edits + named command patterns | Recommended for dev agents |
| `acceptEdits` + sandbox | Auto-accepts edits + sandboxed bash | Recommended with sandbox enabled |
| `--dangerously-skip-permissions` | Skips ALL permission prompts | YOLO mode — use only for trusted, bounded tasks |

---

## The Baseline Configuration

This is the standard `~/.claude/settings.json` for all agent sessions in this system.
Project-specific extensions are added on top of this baseline.

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "defaultMode": "acceptEdits",
    "allow": [
      "Bash(git status)",
      "Bash(git diff *)",
      "Bash(git log *)",
      "Bash(git show *)",
      "Bash(git branch *)",
      "Bash(git stash list)",
      "Bash(git remote -v)",
      "Bash(grep *)",
      "Bash(cat *)",
      "Bash(ls *)",
      "Bash(find *)",
      "Bash(head *)",
      "Bash(tail *)",
      "Bash(wc *)",
      "Bash(which *)",
      "Bash(echo *)",
      "Bash(pwd)",
      "Bash(* --help)",
      "Bash(* --version)"
    ],
    "ask": [
      "Bash(git push *)",
      "Bash(git merge *)",
      "Bash(git rebase *)",
      "Bash(git reset *)",
      "Bash(rm *)",
      "Bash(curl *)",
      "Bash(wget *)"
    ],
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./secrets/**)",
      "Read(**/.env)",
      "Read(**/.env.*)"
    ]
  },
  "sandbox": {
    "enabled": true,
    "autoAllowBashIfSandboxed": true
  }
}
```

**Why this is the right baseline:**
- `acceptEdits` removes edit confirmations entirely
- Sandboxed bash is auto-approved — most routine commands run without prompting
- Read-only commands (grep, cat, ls, git log, --help) are explicitly allowed
- Risky operations (git push, rm, curl) still prompt
- Secrets files are blocked regardless of other settings

---

## Role-Specific Extensions

Each role adds project-specific allow rules on top of the baseline.
These go in the project's local `.claude/settings.json` (project-level config
overrides global `~/.claude/settings.json`).

### CTO Session Extensions

```json
{
  "permissions": {
    "allow": [
      "Bash(python3 scripts/admin/measure_ground_truth.py *)",
      "Bash(python3 scripts/admin/*.py --dry-run *)",
      "Bash(sqlite3 * .tables)",
      "Bash(sqlite3 * SELECT *)"
    ],
    "ask": [
      "Bash(python3 scripts/admin/*.py)",
      "Bash(./scripts/run_5_phase_pipeline.sh *)"
    ]
  }
}
```

### Pipeline Dev Extensions

```json
{
  "permissions": {
    "allow": [
      "Bash(python3 scripts/infrastructure/phase* *)",
      "Bash(python3 scripts/core_modules/* *)",
      "Bash(python3 scripts/adr013/* *)",
      "Bash(pytest *)",
      "Bash(python3 -m pytest *)",
      "Bash(sqlite3 /tmp/* *)"
    ],
    "ask": [
      "Bash(./scripts/run_5_phase_pipeline.sh *)",
      "Bash(python3 scripts/admin/apply_migrations.py *)"
    ],
    "deny": [
      "Bash(./scripts/admin/sync_turso_schema.sh)",
      "Bash(turso db shell *)"
    ]
  }
}
```

### Infrastructure Dev Extensions

```json
{
  "permissions": {
    "allow": [
      "Bash(turso db shell * --location *)",
      "Bash(./scripts/admin/sync_turso_schema.sh)",
      "Bash(python3 scripts/admin/apply_migrations.py *)",
      "Bash(turso auth token *)"
    ],
    "ask": [
      "Bash(turso db destroy *)",
      "Bash(git push *)"
    ]
  }
}
```

### Test/Validation Dev Extensions

```json
{
  "permissions": {
    "allow": [
      "Bash(python3 scripts/admin/measure_ground_truth.py *)",
      "Bash(python3 scripts/admin/compare_registers.py *)",
      "Bash(sqlite3 * SELECT *)"
    ],
    "deny": [
      "Bash(python3 scripts/admin/apply_migrations.py *)",
      "Bash(./scripts/admin/sync_turso_schema.sh)",
      "Bash(git commit *)",
      "Bash(git push *)"
    ]
  }
}
```

---

## The Agent Loop Pattern

For sessions that need to run autonomously for extended periods (e.g. a pipeline
dev implementing a multi-phase brief), the recommended launch pattern is:

```bash
# Standard launch — uses settings.json allow rules
claude --dangerously-skip-permissions

# OR: project-level settings only (no global override)
claude --dangerously-skip-permissions --config .claude/settings.json
```

With `--dangerously-skip-permissions` + a well-scoped brief + negative constraints
in the prompt, the agent runs autonomously within its defined scope without pausing.

**The safety comes from the brief, not from permission prompts.**
A brief with tight `do_not` constraints and a clear `autonomous_authority` section
prevents scope creep. Permission prompts are a fallback for when the brief is
underspecified — fix the brief, not the permissions.

---

## The "Runs For Hours" Pattern

Teams running AI agents unattended for extended periods use this stack:

```
Well-scoped YAML brief
+ --dangerously-skip-permissions
+ Test/lint/build loop in the brief's verification phase
+ Git commit to working branch on phase completion
+ Handoff artifact at session end
```

The agent writes code → runs tests → fixes errors → iterates → commits → produces
handoff. Human reviews the handoff (not the session). The interactive loop is broken
by the brief's self-contained verification cycle.

**Practical reality:** Even teams running agents for hours check in every 15-30 minutes
and review commits. The goal is reducing interruptions, not eliminating oversight.

---

## Notification Hook (Optional)

Claude Code can fire a notification when waiting for input, so you don't have to
watch the terminal. Add to `~/.claude/settings.json`:

```json
{
  "hooks": {
    "Notification": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "osascript -e 'display notification \"Claude is waiting\" with title \"Claude Code\"'"
          }
        ]
      }
    ]
  }
}
```

Adapt the command for your OS (macOS shown above).

---

## Sync With AUTONOMOUS_EXECUTION.md

When updating either document, check the other for consistency:

| AUTONOMOUS_EXECUTION.md says | settings.json should have |
|---|---|
| "All read-only shell commands autonomous" | `allow` rules for grep, cat, ls, find, git log, --help |
| "SELECT queries autonomous" | `allow` rule for sqlite3 SELECT |
| "git push requires checkpoint" | `ask` rule for git push |
| "Remote sync requires checkpoint" | `deny` or `ask` rule for sync scripts |
| "Secrets files blocked" | `deny` rules for .env, secrets/ |

If they diverge, agents get prompted for things the brief says are autonomous.
Treat this as a bug — fix the settings, not the prompt.
