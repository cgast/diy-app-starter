import RunList from "@/components/RunList";
import { config } from "@/lib/config";

export default function AgentsPage() {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-white/40">agent perspective</p>
      <h1 className="mt-1 text-2xl font-semibold text-white">Agent runs</h1>
      <p className="mt-2 max-w-2xl text-sm text-white/60">
        The agent is the only thing that touches the workspace repo — the
        owner works through tickets and this dashboard, never the code
        directly.
      </p>
      <div className="mt-6">
        <RunList piWebUrl={config.piWebUrl} />
      </div>
    </div>
  );
}
