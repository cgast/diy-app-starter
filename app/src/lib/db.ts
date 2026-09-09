import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { config } from "./config";

fs.mkdirSync(path.dirname(config.dbPath), { recursive: true });

// A module-level singleton. Next.js dev mode reloads modules on change but
// keeps the process alive, so stash the instance on `global` to avoid
// re-opening the file (and re-running the schema) on every hot reload.
const globalForDb = globalThis as unknown as { __db?: Database.Database };

export const db = globalForDb.__db ?? new Database(config.dbPath);
globalForDb.__db = db;

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'todo',
    branch TEXT,
    worktree_path TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id INTEGER NOT NULL REFERENCES tickets(id),
    status TEXT NOT NULL DEFAULT 'running',
    started_at TEXT NOT NULL DEFAULT (datetime('now')),
    finished_at TEXT,
    exit_code INTEGER,
    log_path TEXT NOT NULL,
    pi_session_name TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_runs_ticket_id ON runs(ticket_id);
`);
