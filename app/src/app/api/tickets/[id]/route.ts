import { NextResponse } from "next/server";
import { deleteTicket, getTicket, updateTicketStatus } from "@/lib/tickets";
import type { TicketStatus } from "@/lib/types";

const VALID_STATUSES: TicketStatus[] = ["todo", "in_progress", "in_review", "done"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ticketId = Number(id);
  const ticket = getTicket(ticketId);
  if (!ticket) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const body = await request.json();
  if (body.status && !VALID_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "invalid status" }, { status: 400 });
  }

  const updated = body.status ? updateTicketStatus(ticketId, body.status) : ticket;
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  deleteTicket(Number(id));
  return NextResponse.json({ ok: true });
}
