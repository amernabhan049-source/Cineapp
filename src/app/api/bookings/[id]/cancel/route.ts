import { NextResponse } from "next/server";
import { cinemaStore } from "@/lib/booking-service";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const reason = body?.reason || "Customer requested cancellation";

    const result = cinemaStore.cancelBooking({
      bookingId: params.id,
      userId: user.id,
      isAdmin: user.role === "ADMIN",
      reason,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Booking cancelled and refund processed successfully.",
      refundAmountCents: result.refundAmountCents,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to cancel booking" },
      { status: 500 }
    );
  }
}
