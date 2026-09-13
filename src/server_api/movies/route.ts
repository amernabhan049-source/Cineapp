import { NextResponse } from "next/server";
import { cinemaStore } from "@/lib/booking-service";

export async function GET(req: Request) {
  const movies = cinemaStore.getMovies();
  const genres = Array.from(cinemaStore.genres.values());

  return NextResponse.json({
    movies,
    genres,
    count: movies.length,
  });
}


