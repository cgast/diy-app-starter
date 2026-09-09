export type TicketStatus = "todo" | "in_progress" | "in_review" | "done";
export type RunStatus = "running" | "succeeded" | "failed";

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: TicketStatus;
  branch: string | null;
  worktree_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface Run {
  id: number;
  ticket_id: number;
  status: RunStatus;
  started_at: string;
  finished_at: string | null;
  exit_code: number | null;
  log_path: string;
  pi_session_name: string | null;
}

export interface TicketWithLatestRun extends Ticket {
  latest_run_status: RunStatus | null;
  latest_run_id: number | null;
}

export interface RunWithTicket extends Run {
  ticket_title: string;
}
