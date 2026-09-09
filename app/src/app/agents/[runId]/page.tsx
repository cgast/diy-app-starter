import RunLogViewer from "@/components/RunLogViewer";

export default async function RunDetailPage({
  params,
}: {
  params: Promise<{ runId: string }>;
}) {
  const { runId } = await params;
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-white/40">agent perspective</p>
      <h1 className="mt-1 text-2xl font-semibold text-white">Run #{runId}</h1>
      <div className="mt-6">
        <RunLogViewer runId={Number(runId)} />
      </div>
    </div>
  );
}
