import KanbanBoard from "@/components/KanbanBoard";

export default function KanbanPage() {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-white/40">maintainer perspective</p>
      <h1 className="mt-1 text-2xl font-semibold text-white">Kanban</h1>
      <p className="mt-2 max-w-2xl text-sm text-white/60">
        File tickets here. Starting a ticket spawns a real{" "}
        <code className="rounded bg-white/10 px-1 py-0.5">pi</code> agent run in
        its own git worktree/branch off the workspace repo. Watch it live on
        the <span className="text-white/80">Agents</span> tab.
      </p>
      <div className="mt-6">
        <KanbanBoard />
      </div>
    </div>
  );
}
