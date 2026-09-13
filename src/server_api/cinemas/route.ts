import { NextResponse } from "next/server";
import { cinemaStore } from "@/lib/booking-service";

export async function GET(req: Request) {
  const cinemas = cinemaStore.getCinemas();
  return NextResponse.json({
    cinemas,
    count: cinemas.length,
  });
}


