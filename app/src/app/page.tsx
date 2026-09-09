export default function HomePage() {
  return (
    <div className="flex h-full min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-xs uppercase tracking-widest text-white/40">user perspective</p>
      <h1 className="mt-3 text-2xl font-semibold text-white">Nothing here yet</h1>
      <p className="mt-2 max-w-md text-white/60">
        This is the blank frontend of the app your agents are building. File a
        ticket on the <span className="text-white/80">Kanban</span> board and
        it&apos;ll start showing up here.
      </p>
    </div>
  );
}
