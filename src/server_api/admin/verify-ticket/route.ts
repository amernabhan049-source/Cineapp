import { NextResponse } from "next/server";
import { cinemaStore } from "@/lib/booking-service";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
  }

  const { ticketCode } = await req.json();
  if (!ticketCode) {
    return NextResponse.json({ error: "Ticket code is required." }, { status: 400 });
  }

  const result = cinemaStore.verifyAndCheckInTicket(ticketCode.trim());
  if (!result.success) {
    return NextResponse.json(
      { error: result.error, ticket: result.ticket, booking: result.booking },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Ticket successfully verified and checked in!",
    ticket: result.ticket,
    booking: result.booking,
  });
}
