import { NextResponse } from "next/server";
import { getTicket } from "@/lib/tickets";
import { startRun } from "@/lib/pi";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ticketId = Number(id);
  const ticket = getTicket(ticketId);
  if (!ticket) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (ticket.status !== "todo") {
    return NextResponse.json(
      { error: `ticket is '${ticket.status}', can only start from 'todo'` },
      { status: 409 }
    );
  }

  const run = startRun(ticketId);
  return NextResponse.json(run, { status: 201 });
}
