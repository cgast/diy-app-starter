import { NextResponse } from "next/server";
import { listRuns } from "@/lib/tickets";

export async function GET() {
  return NextResponse.json(listRuns());
}
