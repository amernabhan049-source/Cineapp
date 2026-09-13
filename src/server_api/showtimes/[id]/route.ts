import { NextResponse } from "next/server";
import { cinemaStore } from "@/lib/booking-service";

export function generateStaticParams() {
  return Array.from(cinemaStore.showtimes.values()).map((st) => ({ id: st.id }));
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const details = cinemaStore.getShowtimeDetails(params.id);
  if (!details) {
    return NextResponse.json({ error: "Showtime not found" }, { status: 404 });
  }

  return NextResponse.json(details);
}
