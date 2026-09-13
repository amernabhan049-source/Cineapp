import { NextResponse } from "next/server";
import { cinemaStore } from "@/lib/booking-service";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const movies = cinemaStore.getMovies();
  return NextResponse.json({ movies });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      title,
      description,
      posterUrl,
      backdropUrl,
      trailerUrl,
      durationMins,
      rating,
      imdbScore,
      releaseDate,
      language,
      director,
      cast,
      status,
      genreSlugs,
    } = body;

    if (!title || !description || !posterUrl || !durationMins) {
      return NextResponse.json(
        { error: "Title, description, poster, and duration are required." },
        { status: 400 }
      );
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const newMovie = cinemaStore.addMovie({
      title,
      slug,
      description,
      posterUrl,
      backdropUrl:
        backdropUrl ||
        "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=80",
      trailerUrl: trailerUrl || "https://www.youtube.com/watch?v=Way9Dexny3w",
      durationMins: Number(durationMins),
      rating: rating || "PG-13",
      imdbScore: imdbScore || "8.5",
      releaseDate: releaseDate || new Date().toISOString(),
      language: language || "English",
      director: director || "Acclaimed Director",
      cast: cast || "Ensemble Cast",
      status: status || "NOW_SHOWING",
      genreSlugs: Array.isArray(genreSlugs) && genreSlugs.length ? genreSlugs : ["action"],
    });

    return NextResponse.json({ success: true, movie: newMovie });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
