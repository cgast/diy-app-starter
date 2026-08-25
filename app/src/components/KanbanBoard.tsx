"use client";

import { useEffect, useState, useCallback, FormEvent } from "react";
import Link from "next/link";
import type { TicketStatus, TicketWithLatestRun } from "@/lib/types";

const COLUMNS: { status: TicketStatus; label: string }[] = [
  { status: "todo", label: "Todo" },
  { status: "in_progress", label: "In Progress" },
  { status: "in_review", label: "In Review" },
  { status: "done", label: "Done" },
];

const RUN_BADGE: Record<string, string> = {
  running: "bg-amber-500/20 text-amber-300",
  succeeded: "bg-emerald-500/20 text-emerald-300",
  failed: "bg-rose-500/20 text-rose-300",
};

export default function KanbanBoard() {
  const [tickets, setTickets] = useState<TicketWithLatestRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/tickets");
    setTickets(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 4000);
    return () => clearInterval(interval);
  }, [load]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });
    setTitle("");
    setDescription("");
    setSubmitting(false);
    load();
  }

  async function moveTicket(id: number, status: TicketStatus) {
    await fetch(`/api/tickets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  async function startAgent(id: number) {
    await fetch(`/api/tickets/${id}/run`, { method: "POST" });
    load();
  }

  async function removeTicket(id: number) {
    await fetch(`/api/tickets/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <form
        onSubmit={handleCreate}
        className="mb-8 flex flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <label className="mb-1 block text-xs text-white/50">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a health check endpoint"
            className="w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-white/30"
          />
        </div>
        <div className="flex-[2]">
          <label className="mb-1 block text-xs text-white/50">Description</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What should the agent actually do?"
            className="w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-white/30"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/90 disabled:opacity-50"
        >
          Add ticket
        </button>
      </form>

      {loading ? (
        <p className="text-white/50">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {COLUMNS.map((col) => (
            <div key={col.status} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/50">
                {col.label} · {tickets.filter((t) => t.status === col.status).length}
              </h2>
              <div className="flex flex-col gap-3">
                {tickets
                  .filter((t) => t.status === col.status)
                  .map((t) => (
                    <div
                      key={t.id}
                      className="rounded border border-white/10 bg-black/30 p-3 text-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-white">{t.title}</p>
                        <button
                          onClick={() => removeTicket(t.id)}
                          className="text-white/30 hover:text-rose-400"
                          title="Delete ticket"
                        >
                          ×
                        </button>
                      </div>
                      {t.description && (
                        <p className="mt-1 text-xs text-white/50">{t.description}</p>
                      )}

                      {t.latest_run_status && (
                        <span
                          className={`mt-2 inline-block rounded px-2 py-0.5 text-[10px] font-medium uppercase ${
                            RUN_BADGE[t.latest_run_status] ?? "bg-white/10 text-white/60"
                          }`}
                        >
                          run {t.latest_run_status}
                        </span>
                      )}

                      <div className="mt-3 flex flex-wrap gap-2">
                        {t.status === "todo" && (
                          <button
                            onClick={() => startAgent(t.id)}
                            className="rounded bg-indigo-500/80 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-500"
                          >
                            Start agent
                          </button>
                        )}
                        {t.status === "in_review" && (
                          <>
                            <button
                              onClick={() => moveTicket(t.id, "done")}
                              className="rounded bg-emerald-500/80 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-500"
                            >
                              Mark done
                            </button>
                            <button
                              onClick={() => moveTicket(t.id, "todo")}
                              className="rounded bg-white/10 px-2 py-1 text-xs font-medium text-white/80 hover:bg-white/20"
                            >
                              Send back
                            </button>
                          </>
                        )}
                        {t.latest_run_id && (
                          <Link
                            href={`/agents/${t.latest_run_id}`}
                            className="rounded bg-white/10 px-2 py-1 text-xs font-medium text-white/80 hover:bg-white/20"
                          >
                            View run
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
