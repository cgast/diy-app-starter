"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import type { RunWithTicket } from "@/lib/types";

const STATUS_COLOR: Record<string, string> = {
  running: "bg-amber-500/20 text-amber-300",
  succeeded: "bg-emerald-500/20 text-emerald-300",
  failed: "bg-rose-500/20 text-rose-300",
};

export default function RunList({ piWebUrl }: { piWebUrl: string }) {
  const [runs, setRuns] = useState<RunWithTicket[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/runs");
    setRuns(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 4000);
    return () => clearInterval(interval);
  }, [load]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
        <div>
          <p className="text-sm font-medium text-white">Live session supervision</p>
          <p className="text-xs text-white/50">
            pi-web tracks every session pi writes to the shared agent data dir.
          </p>
        </div>
        <a
          href={piWebUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded bg-white px-3 py-2 text-xs font-medium text-black hover:bg-white/90"
        >
          Open pi-web ↗
        </a>
      </div>

      {loading ? (
        <p className="text-white/50">Loading…</p>
      ) : runs.length === 0 ? (
        <p className="text-white/50">No runs yet — start a ticket from the Kanban board.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {runs.map((r) => (
            <Link
              key={r.id}
              href={`/agents/${r.id}`}
              className="flex items-center justify-between rounded border border-white/10 bg-black/30 px-4 py-3 text-sm hover:border-white/30"
            >
              <div>
                <p className="font-medium text-white">{r.ticket_title}</p>
                <p className="text-xs text-white/50">
                  run #{r.id} · started {r.started_at}
                </p>
              </div>
              <span
                className={`rounded px-2 py-1 text-[10px] font-medium uppercase ${
                  STATUS_COLOR[r.status] ?? "bg-white/10 text-white/60"
                }`}
              >
                {r.status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
