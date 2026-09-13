import { NextResponse } from "next/server";
import { cinemaStore } from "@/lib/booking-service";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const showtimes = Array.from(cinemaStore.showtimes.values()).map((st) => {
    const movie = cinemaStore.getMovieById(st.movieId);
    let cinema: any = null;
    let screen: any = null;
    for (const c of cinemaStore.cinemas.values()) {
      const scr = c.screens.find((s) => s.id === st.auditoriumId);
      if (scr) {
        cinema = c;
        screen = scr;
        break;
      }
    }
    return {
      ...st,
      movie,
      cinema,
      screen,
    };
  });

  return NextResponse.json({ showtimes });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { movieId, auditoriumId, startTime, basePriceCents, format } = body;

    if (!movieId || !auditoriumId || !startTime || !basePriceCents) {
      return NextResponse.json(
        { error: "Movie, auditorium, start time, and base price are required." },
        { status: 400 }
      );
    }

    const movie = cinemaStore.movies.get(movieId);
    if (!movie) {
      return NextResponse.json({ error: "Movie not found." }, { status: 404 });
    }

    const start = new Date(startTime);
    const end = new Date(start.getTime() + (movie.durationMins + 20) * 60 * 1000);

    const newShowtime = cinemaStore.addShowtime({
      movieId,
      auditoriumId,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      basePriceCents: Number(basePriceCents),
      format: format || "2D",
    });

    return NextResponse.json({ success: true, showtime: newShowtime });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
