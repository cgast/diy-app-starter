"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface RunDetail {
  id: number;
  ticket_id: number;
  status: string;
  started_at: string;
  finished_at: string | null;
  exit_code: number | null;
  pi_session_name: string | null;
  log: string;
  pi_web_url: string;
}

export default function RunLogViewer({ runId }: { runId: number }) {
  const [run, setRun] = useState<RunDetail | null>(null);
  const logRef = useRef<HTMLPreElement>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/runs/${runId}`);
    if (!res.ok) return;
    const data = await res.json();
    setRun(data);
  }, [runId]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 2500);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [run?.log]);

  if (!run) return <p className="text-white/50">Loading…</p>;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-white/60">
        <span className="rounded bg-white/10 px-2 py-1 text-xs uppercase">{run.status}</span>
        <span>started {run.started_at}</span>
        {run.finished_at && <span>finished {run.finished_at}</span>}
        {run.exit_code !== null && <span>exit code {run.exit_code}</span>}
        {run.pi_session_name && (
          <a
            href={run.pi_web_url}
            target="_blank"
            rel="noreferrer"
            className="ml-auto rounded bg-white px-3 py-1 text-xs font-medium text-black hover:bg-white/90"
          >
            Resume in pi-web ↗
          </a>
        )}
      </div>
      <pre
        ref={logRef}
        className="h-[60vh] overflow-auto whitespace-pre-wrap rounded border border-white/10 bg-black/50 p-4 text-xs text-white/80"
      >
        {run.log || "(no output yet)"}
      </pre>
    </div>
  );
}
