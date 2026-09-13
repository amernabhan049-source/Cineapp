import { NextResponse } from "next/server";
import { cinemaStore } from "@/lib/booking-service";

export function generateStaticParams() {
  return cinemaStore.getMovies().map((m) => ({ id: m.id }));
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const movie = cinemaStore.getMovieById(params.id);
  if (!movie) {
    return NextResponse.json({ error: "Movie not found" }, { status: 404 });
  }

  const showtimes = cinemaStore.getShowtimesForMovie(movie.id);
  const cinemas = cinemaStore.getCinemas();

  return NextResponse.json({
    movie,
    showtimes,
    cinemas,
  });
}

