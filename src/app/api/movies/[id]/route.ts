import { NextResponse } from "next/server";
import { cinemaStore } from "@/lib/booking-service";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(req.url);
  const cinemaId = searchParams.get("cinemaId") || undefined;
  const dateStr = searchParams.get("date") || undefined;

  const movie = cinemaStore.getMovieById(params.id);
  if (!movie) {
    return NextResponse.json({ error: "Movie not found" }, { status: 404 });
  }

  const showtimes = cinemaStore.getShowtimesForMovie(
    movie.id,
    cinemaId,
    dateStr
  );
  const cinemas = cinemaStore.getCinemas();

  return NextResponse.json({
    movie,
    showtimes,
    cinemas,
  });
}
