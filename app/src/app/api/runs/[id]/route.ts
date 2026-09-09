import { NextResponse } from "next/server";
import { getRun } from "@/lib/tickets";
import { readLog } from "@/lib/pi";
import { config } from "@/lib/config";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const run = getRun(Number(id));
  if (!run) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...run,
    log: readLog(run.log_path),
    pi_web_url: config.piWebUrl,
  });
}
