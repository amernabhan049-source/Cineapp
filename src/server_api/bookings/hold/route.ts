import { NextResponse } from "next/server";
import { cinemaStore } from "@/lib/booking-service";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();
    const {
      showtimeId,
      seatIds,
      customerEmail,
      customerName,
      customerPhone,
      idempotencyKey,
    } = body;

    // Use current authenticated user id or guest id
    const userId = user?.id || `guest-${Date.now()}`;
    const email = customerEmail || user?.email;
    const name = customerName || user?.name || "Guest Patron";

    if (!showtimeId || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return NextResponse.json(
        { error: "Showtime ID and at least one Seat ID are required." },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: "Customer email is required for booking confirmation." },
        { status: 400 }
      );
    }

    const result = cinemaStore.createSeatHold({
      showtimeId,
      seatIds,
      userId,
      customerEmail: email,
      customerName: name,
      customerPhone,
      idempotencyKey,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    return NextResponse.json({
      success: true,
      booking: result.booking,
      items: result.items,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create seat hold." },
      { status: 500 }
    );
  }
}
