import { NextResponse } from "next/server";
import { cinemaStore } from "@/lib/booking-service";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const ticketData = cinemaStore.getTicketDetails(params.id);
  if (!ticketData) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  return NextResponse.json(ticketData);
}
