import { NextResponse } from "next/server";
import { cinemaStore } from "@/lib/booking-service";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city") || undefined;

  const cinemas = cinemaStore.getCinemas(city);
  return NextResponse.json({
    cinemas,
    count: cinemas.length,
  });
}
