import { spawn, execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { config } from "./config";
import { ensureTicketWorktree, ensureWorkspaceRepo } from "./workspace";
import { createRun, finishRun, getTicket, setTicketWorktree, updateTicketStatus } from "./tickets";
import type { Run, Ticket } from "./types";

function buildPrompt(ticket: Ticket): string {
  return [
    `Ticket #${ticket.id}: ${ticket.title}`,
    "",
    ticket.description || "(no further description provided)",
    "",
    "Implement this directly in the current working directory. Commit is",
    "handled separately, so just leave the working tree in the state you",
    "want reviewed.",
  ].join("\n");
}

/**
 * Kicks off a `pi` agent run for a ticket in its own git worktree.
 * Returns immediately with the created Run row; the process continues in
 * the background and updates the DB when it exits.
 */
export function startRun(ticketId: number): Run {
  ensureWorkspaceRepo();
  const ticket = getTicket(ticketId);
  if (!ticket) throw new Error(`Ticket ${ticketId} not found`);

  const { branch, worktreePath } = ensureTicketWorktree(ticketId);
  setTicketWorktree(ticketId, branch, worktreePath);
  updateTicketStatus(ticketId, "in_progress");

  fs.mkdirSync(config.runsDir, { recursive: true });
  fs.mkdirSync(config.piAgentDir, { recursive: true });

  // Created before the run row so the log path can be deterministic-ish;
  // we patch it in once we have the real run id.
  const sessionName = `ticket-${ticketId}-${Date.now()}`;
  const logPath = path.join(config.runsDir, `${sessionName}.log`);
  const run = createRun(ticketId, logPath, sessionName);

  const logStream = fs.createWriteStream(logPath, { flags: "a" });
  logStream.write(`$ pi --print --mode json -a --name ${sessionName}\n\n`);

  const child = spawn(
    "pi",
    ["--print", "--mode", "json", "-a", "--name", sessionName, "--", buildPrompt(ticket)],
    {
      cwd: worktreePath,
      env: {
        ...process.env,
        PI_CODING_AGENT_DIR: config.piAgentDir,
      },
    }
  );

  child.stdout.pipe(logStream, { end: false });
  child.stderr.pipe(logStream, { end: false });

  child.on("error", (err) => {
    logStream.write(`\n[harness] failed to start pi: ${err.message}\n`);
    logStream.end();
    finishRun(run.id, "failed", null);
    updateTicketStatus(ticketId, "in_review");
  });

  child.on("close", (code) => {
    logStream.write(`\n[harness] pi exited with code ${code}\n`);

    try {
      commitWorktreeIfDirty(worktreePath, ticket, run.id);
    } catch (err) {
      logStream.write(`[harness] commit step failed: ${(err as Error).message}\n`);
    }

    logStream.end();
    finishRun(run.id, code === 0 ? "succeeded" : "failed", code);
    updateTicketStatus(ticketId, "in_review");
  });

  return run;
}

function commitWorktreeIfDirty(worktreePath: string, ticket: Ticket, runId: number): void {
  const status = execFileSync("git", ["status", "--porcelain"], {
    cwd: worktreePath,
    encoding: "utf8",
  });
  if (!status.trim()) return;

  execFileSync("git", ["add", "-A"], { cwd: worktreePath });
  execFileSync(
    "git",
    ["commit", "-m", `Ticket #${ticket.id}: ${ticket.title} (run #${runId})`],
    { cwd: worktreePath }
  );
}

export function readLog(logPath: string): string {
  try {
    return fs.readFileSync(logPath, "utf8");
  } catch {
    return "";
  }
}
