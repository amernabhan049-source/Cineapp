import { NextResponse } from "next/server";
import { cinemaStore } from "@/lib/booking-service";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const booking = cinemaStore.getBookingDetails(params.id);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  return NextResponse.json({ booking });
}
