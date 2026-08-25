import { NextResponse } from "next/server";
import { createTicket, listTickets } from "@/lib/tickets";

export async function GET() {
  return NextResponse.json(listTickets());
}

export async function POST(request: Request) {
  const body = await request.json();
  const title = String(body.title ?? "").trim();
  const description = String(body.description ?? "").trim();

  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const ticket = createTicket(title, description);
  return NextResponse.json(ticket, { status: 201 });
}
