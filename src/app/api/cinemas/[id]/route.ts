import { NextResponse } from "next/server";
import { cinemaStore } from "@/lib/booking-service";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const cinema = cinemaStore.getCinemaById(params.id);
  if (!cinema) {
    return NextResponse.json({ error: "Cinema not found" }, { status: 404 });
  }

  // Get all movies showing at this cinema
  const allMovies = cinemaStore.getMovies({ status: "NOW_SHOWING" });
  const moviesWithShowtimes = allMovies
    .map((m) => {
      const showtimes = cinemaStore.getShowtimesForMovie(m.id, cinema.id);
      return {
        ...m,
        showtimes,
      };
    })
    .filter((m) => m.showtimes.length > 0);

  return NextResponse.json({
    cinema,
    movies: moviesWithShowtimes,
  });
}
