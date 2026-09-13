import { NextResponse } from "next/server";
import { cinemaStore } from "@/lib/booking-service";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || undefined;
  const genre = searchParams.get("genre") || undefined;
  const language = searchParams.get("language") || undefined;
  const status = (searchParams.get("status") as any) || undefined;

  const movies = cinemaStore.getMovies({ search, genre, language, status });
  const genres = Array.from(cinemaStore.genres.values());

  return NextResponse.json({
    movies,
    genres,
    count: movies.length,
  });
}
