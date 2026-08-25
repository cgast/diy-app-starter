import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { config } from "./config";

function git(args: string[], cwd: string) {
  return execFileSync("git", args, { cwd, encoding: "utf8" });
}

/**
 * The workspace is the app the agents build — a separate git repo from
 * this starter/harness repo, so agent runs never touch the harness's own
 * code. Idempotent: safe to call on every server start.
 */
export function ensureWorkspaceRepo(): void {
  const root = config.workspaceRoot;
  fs.mkdirSync(root, { recursive: true });

  if (fs.existsSync(path.join(root, ".git"))) return;

  git(["init", "-b", "main"], root);
  git(["config", "user.email", "agent@localhost"], root);
  git(["config", "user.name", "Self-Developing App Agent"], root);

  const readme =
    "# Workspace\n\n" +
    "This repo is what the agents build, one kanban ticket at a time.\n" +
    "It's intentionally empty — it's the blank frontend/backend the owner\n" +
    "describes tickets against. Nobody edits this by hand; agents work in\n" +
    "a git worktree per ticket and this main branch collects merged work.\n";
  fs.writeFileSync(path.join(root, "README.md"), readme);
  git(["add", "."], root);
  git(["commit", "-m", "Initial empty workspace"], root);
}

/** Create (or reuse) a git worktree + branch dedicated to one ticket. */
export function ensureTicketWorktree(ticketId: number): { branch: string; worktreePath: string } {
  const root = config.workspaceRoot;
  const branch = `agent/ticket-${ticketId}`;
  const worktreePath = path.join(root, ".worktrees", `ticket-${ticketId}`);

  if (fs.existsSync(worktreePath)) {
    return { branch, worktreePath };
  }

  fs.mkdirSync(path.dirname(worktreePath), { recursive: true });

  const branchExists =
    git(["branch", "--list", branch], root).trim().length > 0;

  if (branchExists) {
    git(["worktree", "add", worktreePath, branch], root);
  } else {
    git(["worktree", "add", "-b", branch, worktreePath], root);
  }

  return { branch, worktreePath };
}
