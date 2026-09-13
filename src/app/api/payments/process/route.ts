import { NextResponse } from "next/server";
import { cinemaStore } from "@/lib/booking-service";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();
    const { bookingId, paymentMethod, idempotencyKey, promoCode } = body;

    if (!bookingId || !paymentMethod || !idempotencyKey) {
      return NextResponse.json(
        { error: "Booking ID, payment method, and idempotency key are required." },
        { status: 400 }
      );
    }

    const booking = cinemaStore.getBookingDetails(bookingId);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const userId = user?.id || booking.userId;

    const result = cinemaStore.confirmPaymentAndBooking({
      bookingId,
      userId,
      idempotencyKey,
      paymentMethod,
      promoCode,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      booking: result.booking,
      payment: result.payment,
      tickets: result.tickets,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Payment processing failed." },
      { status: 500 }
    );
  }
}
