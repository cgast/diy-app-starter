import { db } from "./db";
import type { Run, Ticket, TicketStatus, TicketWithLatestRun, RunWithTicket } from "./types";

export function listTickets(): TicketWithLatestRun[] {
  return db
    .prepare(
      `SELECT t.*,
              lr.status AS latest_run_status,
              lr.id AS latest_run_id
       FROM tickets t
       LEFT JOIN (
         SELECT r1.*
         FROM runs r1
         WHERE r1.id = (SELECT r2.id FROM runs r2 WHERE r2.ticket_id = r1.ticket_id ORDER BY r2.id DESC LIMIT 1)
       ) lr ON lr.ticket_id = t.id
       ORDER BY t.updated_at DESC`
    )
    .all() as TicketWithLatestRun[];
}

export function getTicket(id: number): Ticket | undefined {
  return db.prepare("SELECT * FROM tickets WHERE id = ?").get(id) as Ticket | undefined;
}

export function createTicket(title: string, description: string): Ticket {
  const info = db
    .prepare("INSERT INTO tickets (title, description) VALUES (?, ?)")
    .run(title, description);
  return getTicket(Number(info.lastInsertRowid))!;
}

export function updateTicketStatus(id: number, status: TicketStatus): Ticket | undefined {
  db.prepare("UPDATE tickets SET status = ?, updated_at = datetime('now') WHERE id = ?").run(
    status,
    id
  );
  return getTicket(id);
}

export function setTicketWorktree(id: number, branch: string, worktreePath: string): void {
  db.prepare(
    "UPDATE tickets SET branch = ?, worktree_path = ?, updated_at = datetime('now') WHERE id = ?"
  ).run(branch, worktreePath, id);
}

export function deleteTicket(id: number): void {
  db.prepare("DELETE FROM runs WHERE ticket_id = ?").run(id);
  db.prepare("DELETE FROM tickets WHERE id = ?").run(id);
}

export function listRuns(): RunWithTicket[] {
  return db
    .prepare(
      `SELECT r.*, t.title AS ticket_title
       FROM runs r
       JOIN tickets t ON t.id = r.ticket_id
       ORDER BY r.id DESC`
    )
    .all() as RunWithTicket[];
}

export function getRun(id: number): Run | undefined {
  return db.prepare("SELECT * FROM runs WHERE id = ?").get(id) as Run | undefined;
}

export function createRun(ticketId: number, logPath: string, sessionName: string): Run {
  const info = db
    .prepare(
      "INSERT INTO runs (ticket_id, log_path, pi_session_name) VALUES (?, ?, ?)"
    )
    .run(ticketId, logPath, sessionName);
  return getRun(Number(info.lastInsertRowid))!;
}

export function finishRun(id: number, status: "succeeded" | "failed", exitCode: number | null): void {
  db.prepare(
    "UPDATE runs SET status = ?, exit_code = ?, finished_at = datetime('now') WHERE id = ?"
  ).run(status, exitCode, id);
}
