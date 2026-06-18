// CTO-Dev Loop — Role-alternating autonomous execution
//
// This template drives a two-role governance loop:
//   Phase 1 (CTO):  Reviews any pending dev return, selects next task,
//                   writes a brief (HANDOFF_CTO_DEV_*.yaml).
//   Phase 2 (Dev):  Reads the brief, implements with TDD, produces tests,
//                   writes a return handoff (HANDOFF_DEV_CTO_*.yaml).
//
// The CTO and Dev share a single sandbox per iteration so both roles see
// the same repo state. The CTO runs first (review + brief), then the Dev
// executes the brief on a dedicated branch.
//
// Halt conditions from HALT_CONTRACT.yaml are evaluated after each Dev
// return. The loop stops when any HARD halt fires, or after MAX_ITERATIONS.
//
// Setup:
//   1. Copy this directory to your project's .sandcastle/
//   2. Add a Dockerfile (see Dockerfile in this directory)
//   3. Configure the paths below to match your project
//   4. Run: npx tsx .sandcastle/main.mts
//
// Or add to package.json:
//   "scripts": { "sandcastle": "npx tsx .sandcastle/main.mts" }
//
// Auth (one of):
//   - CLAUDE_CODE_OAUTH_TOKEN in .sandcastle/.env (via: claude setup-token)
//   - ANTHROPIC_API_KEY env var (API billing)

import * as sandcastle from "@ai-hero/sandcastle";
import { docker } from "@ai-hero/sandcastle/sandboxes/docker";
import * as fs from "node:fs";
import * as path from "node:path";

// ---------------------------------------------------------------------------
// Configuration — adapt these to your project
// ---------------------------------------------------------------------------

// Outer loop: how many CTO-Dev cycles to run before pausing for human review.
// Default 1 during refinement; increase once stable.
const MAX_ITERATIONS = parseInt(process.env.MAX_ITERATIONS ?? "1", 10);

// Agent session count — how many times sandcastle re-invokes each agent.
// Each invocation is a separate Claude Code session. Claude Code handles its
// own internal tool-call loop within a session, so 1 session is sufficient
// for a well-scoped DC. Setting >1 causes re-invocations where the agent
// has no memory of prior runs and wastes tokens re-discovering done work.
const CTO_MAX_ITERATIONS = parseInt(process.env.CTO_MAX_ITERATIONS ?? "1", 10);
const DEV_MAX_ITERATIONS = parseInt(process.env.DEV_MAX_ITERATIONS ?? "1", 10);

// Paths relative to project root. Update these for your project layout.
// These use the restructured control/ layout from dev-system v2.
const TASKS_PATH = "control/TASKS.yaml";
const CURRENT_STATE_PATH = "control/current_state.yaml";
const SESSION_HEADER_PATH = "control/sessions/SESSION_HEADER.md";
const BOOTSTRAP_STABLE_PATH = "control/sessions/SESSION_BOOTSTRAP_STABLE.md";
const HANDOFFS_DIR = "control/handoffs";
// const SCOPE_PATH = "control/SCOPE-001.md";  // read by CTO via TASKS.yaml meta

// Agent model selection — opus for CTO (judgment), sonnet for Dev (speed)
const CTO_MODEL = "claude-opus-4-6";
const DEV_MODEL = "claude-sonnet-4-6";

// Hooks run inside the sandbox before the agent starts.
// Adapt to your project's setup (npm install, pip install, etc.)
const hooks = {
  sandbox: {
    onSandboxReady: [
      // { command: "npm install" },
      // { command: "pip install -r requirements.txt || true" },
    ],
  },
};

// Files to copy from host into the worktree before sandbox starts.
// Speeds up setup by avoiding fresh installs.
const copyToWorktree: string[] = [
  // "node_modules",
  // ".venv",
];

// ---------------------------------------------------------------------------
// Halt condition types
// ---------------------------------------------------------------------------

interface CtoVerdict {
  action: "APPROVE" | "AMEND" | "HALT";
  dc_reviewed: string | null;
  tasks_closed: string[];
  tasks_opened: string[];
  halt_reason: string | null;
  next_task: string | null;
}

interface DevVerdict {
  outcome: "COMPLETE" | "PARTIAL" | "BLOCKED";
  dc_id: string;
  tests_added: number;
  tests_passed: number;
  tests_failed: number;
  success_criteria_passed: number;
  success_criteria_total: number;
  files_changed: string[];
  blocker: string | null;
}

// ---------------------------------------------------------------------------
// Verdict parsing
// ---------------------------------------------------------------------------

function parseCtoVerdict(stdout: string): CtoVerdict | null {
  const match = stdout.match(/<cto_verdict>\s*([\s\S]*?)\s*<\/cto_verdict>/);
  if (!match) return null;
  try {
    // Strip markdown code fences if present
    const json = match[1]!.replace(/^```json?\n?/m, "").replace(/\n?```$/m, "");
    return JSON.parse(json) as CtoVerdict;
  } catch {
    console.error("Failed to parse CTO verdict JSON");
    return null;
  }
}

function parseDevVerdict(stdout: string): DevVerdict | null {
  const match = stdout.match(/<dev_verdict>\s*([\s\S]*?)\s*<\/dev_verdict>/);
  if (!match) return null;
  try {
    const json = match[1]!.replace(/^```json?\n?/m, "").replace(/\n?```$/m, "");
    return JSON.parse(json) as DevVerdict;
  } catch {
    console.error("Failed to parse Dev verdict JSON");
    return null;
  }
}

// ---------------------------------------------------------------------------
// Halt condition evaluation
// ---------------------------------------------------------------------------

function evaluateHaltConditions(
  devVerdict: DevVerdict,
  ctoVerdict: CtoVerdict | null,
  iteration: number,
  consecutiveAmends: number,
): { halt: boolean; reason: string } | null {

  // HALT-001: Dev blocked
  if (devVerdict.outcome === "BLOCKED") {
    return {
      halt: true,
      reason: `HALT-001: Dev returned BLOCKED on ${devVerdict.dc_id}. Blocker: ${devVerdict.blocker}`,
    };
  }

  // HALT-002: Success criteria failure (SOFT — CTO may amend)
  if (devVerdict.success_criteria_passed < devVerdict.success_criteria_total) {
    const failed = devVerdict.success_criteria_total - devVerdict.success_criteria_passed;
    console.warn(
      `WARNING HALT-002: ${failed} success criteria failed on ${devVerdict.dc_id}`,
    );
    // Soft halt — CTO will review and decide
  }

  // HALT-003: No tests produced for feature/fix DC
  if (devVerdict.tests_added === 0) {
    return {
      halt: true,
      reason: `HALT-003: DC ${devVerdict.dc_id} produced no tests. Tests are mandatory (SESSION_HEADER.md Rule 0).`,
    };
  }

  // HALT-004: Test suite regression
  if (devVerdict.tests_failed > 0) {
    return {
      halt: true,
      reason: `HALT-004: Test suite regression after ${devVerdict.dc_id}: ${devVerdict.tests_failed} failures.`,
    };
  }

  // HALT-006: Consecutive amendment limit
  if (consecutiveAmends >= 2) {
    return {
      halt: true,
      reason: `HALT-006: Same DC amended ${consecutiveAmends} times without resolution. Loop is stuck.`,
    };
  }

  // HALT-011: Maximum iterations
  if (iteration >= MAX_ITERATIONS) {
    return {
      halt: true,
      reason: `HALT-011: Loop completed ${iteration} iterations. Pausing for human review.`,
    };
  }

  return null;
}

// ---------------------------------------------------------------------------
// Find latest brief path
// ---------------------------------------------------------------------------

function findLatestBrief(handoffsDir: string): string | null {
  if (!fs.existsSync(handoffsDir)) return null;
  // Sort by mtime (not filename) — filenames may not sort chronologically
  // when multiple briefs are written on the same date.
  const files = fs.readdirSync(handoffsDir)
    .filter(f => f.startsWith("HANDOFF_CTO_DEV_") && f.endsWith(".yaml"))
    .map(f => ({ name: f, mtime: fs.statSync(path.join(handoffsDir, f)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);
  return files.length > 0 ? path.join(handoffsDir, files[0]!.name) : null;
}

// ---------------------------------------------------------------------------
// Main loop
// ---------------------------------------------------------------------------

const today = new Date().toISOString().split("T")[0]!;
let consecutiveAmends = 0;
let lastDcId: string | null = null;

console.log(`\n${"=".repeat(60)}`);
console.log(`CTO-Dev Autonomous Loop — [PROJECT]`);
console.log(`Date: ${today}`);
console.log(`Outer loop: ${MAX_ITERATIONS} CTO-Dev cycle(s)`);
console.log(`CTO sessions: ${CTO_MAX_ITERATIONS} (${CTO_MODEL})`);
console.log(`Dev sessions: ${DEV_MAX_ITERATIONS} (${DEV_MODEL})`);
console.log(`${"=".repeat(60)}\n`);

for (let iteration = 1; iteration <= MAX_ITERATIONS; iteration++) {
  console.log(`\n--- Iteration ${iteration}/${MAX_ITERATIONS} ---\n`);

  const branch = `sandcastle/cto-dev-loop/${Date.now()}`;

  // Create a shared sandbox for CTO + Dev this iteration
  const sandbox = await sandcastle.createSandbox({
    branch,
    sandbox: docker(),
    hooks,
    copyToWorktree,
  });

  try {
    // -------------------------------------------------------------------
    // Phase 1: CTO — review pending return + select task + write brief
    // -------------------------------------------------------------------
    console.log("[CTO] Starting CTO session...");

    // Determine CTO task based on loop state
    let ctoTask: string;
    if (iteration === 1) {
      ctoTask =
        "Check for any unreviewed dev return in the handoffs directory. " +
        "If found, review it first. Then select the next eligible task and write a brief. " +
        "If a brief already exists for the active DC (check current_state.yaml active_dc), " +
        "skip brief writing and just output the verdict with next_task set.";
    } else {
      ctoTask =
        "Review the dev return handoff from the previous iteration. " +
        "If approved, update /control docs, then select the next task and write a brief. " +
        "If the return has failures, decide whether to AMEND or HALT.";
    }

    const ctoStart = Date.now();
    const ctoResult = await sandbox.run({
      name: "cto",
      maxIterations: CTO_MAX_ITERATIONS,
      agent: sandcastle.claudeCode(CTO_MODEL),
      promptFile: "./.sandcastle/cto-prompt.md",
      promptArgs: {
        ITERATION: String(iteration),
        MAX_ITERATIONS: String(MAX_ITERATIONS),
        DATE: today,
        TASKS_PATH,
        CURRENT_STATE_PATH,
        SESSION_HEADER_PATH,
        HANDOFFS_DIR,
        CTO_TASK: ctoTask,
      },
    });

    const ctoElapsed = ((Date.now() - ctoStart) / 1000).toFixed(0);
    console.log(`[CTO] Finished in ${ctoElapsed}s`);

    const ctoVerdict = parseCtoVerdict(ctoResult.stdout);

    if (!ctoVerdict) {
      console.error("[CTO] No verdict produced. Halting.");
      console.log("\nHALT: CTO did not produce a parseable <cto_verdict>.");
      break;
    }

    console.log(`[CTO] Verdict: ${ctoVerdict.action}`);
    if (ctoVerdict.dc_reviewed) {
      console.log(`[CTO] Reviewed: ${ctoVerdict.dc_reviewed}`);
    }
    if (ctoVerdict.tasks_closed.length > 0) {
      console.log(`[CTO] Closed: ${ctoVerdict.tasks_closed.join(", ")}`);
    }

    // Check CTO halt
    if (ctoVerdict.action === "HALT") {
      console.log(`\nHALT (CTO): ${ctoVerdict.halt_reason}`);
      break;
    }

    // Track consecutive amends
    if (ctoVerdict.action === "AMEND") {
      if (ctoVerdict.next_task === lastDcId) {
        consecutiveAmends++;
      } else {
        consecutiveAmends = 1;
      }
    } else {
      consecutiveAmends = 0;
    }

    if (!ctoVerdict.next_task) {
      console.log("\nHALT: CTO selected no next task (HALT-009: no eligible tasks).");
      break;
    }

    lastDcId = ctoVerdict.next_task;

    // Find the brief the CTO just wrote
    const briefPath = findLatestBrief(HANDOFFS_DIR);
    if (!briefPath) {
      console.error("[CTO] No brief found in handoffs dir. Halting.");
      break;
    }

    console.log(`[CTO] Brief written: ${briefPath}`);
    console.log(`[CTO] Next task: ${ctoVerdict.next_task}`);

    // -------------------------------------------------------------------
    // Phase 2: Dev — execute the brief
    // -------------------------------------------------------------------
    console.log(`\n[DEV] Starting dev session for DC-${ctoVerdict.next_task}...`);
    console.log(`[DEV] Sessions: ${DEV_MAX_ITERATIONS}`);

    const devStart = Date.now();
    const devResult = await sandbox.run({
      name: "dev",
      maxIterations: DEV_MAX_ITERATIONS,
      agent: sandcastle.claudeCode(DEV_MODEL),
      promptFile: "./.sandcastle/dev-prompt.md",
      promptArgs: {
        DATE: today,
        DC_ID: `DC-${ctoVerdict.next_task}`,
        SESSION_HEADER_PATH,
        BOOTSTRAP_STABLE_PATH,
        BRIEF_PATH: briefPath,
        HANDOFFS_DIR,
      },
    });

    const devElapsed = ((Date.now() - devStart) / 1000).toFixed(0);
    const devVerdict = parseDevVerdict(devResult.stdout);

    if (!devVerdict) {
      console.error(`[DEV] No verdict produced after ${devElapsed}s. Halting.`);
      console.log("\nHALT: Dev did not produce a parseable <dev_verdict>.");
      break;
    }

    console.log(`[DEV] Finished in ${devElapsed}s`);
    console.log(`[DEV] Outcome: ${devVerdict.outcome}`);
    console.log(`[DEV] Tests: ${devVerdict.tests_added} added, ${devVerdict.tests_passed} passed, ${devVerdict.tests_failed} failed`);
    console.log(`[DEV] SCs: ${devVerdict.success_criteria_passed}/${devVerdict.success_criteria_total} passed`);
    console.log(`[DEV] Files changed: ${devVerdict.files_changed.length}`);
    console.log(`[DEV] Commits: ${devResult.commits.length}`);

    // -------------------------------------------------------------------
    // Evaluate halt conditions
    // -------------------------------------------------------------------
    const halt = evaluateHaltConditions(
      devVerdict,
      ctoVerdict,
      iteration,
      consecutiveAmends,
    );

    if (halt) {
      console.log(`\n${halt.reason}`);

      // If not the last iteration, let CTO review the return before halting
      if (iteration < MAX_ITERATIONS && halt.reason.includes("HALT-002")) {
        console.log("Soft halt — CTO will review in next iteration.");
        continue;
      }

      break;
    }

    console.log(`\n[LOOP] Iteration ${iteration} complete. Continuing...`);

  } finally {
    await sandbox.close();
  }
}

console.log(`\n${"=".repeat(60)}`);
console.log("CTO-Dev loop finished.");
console.log(`${"=".repeat(60)}\n`);
