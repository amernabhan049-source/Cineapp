import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cinemaStore } from "@/lib/booking-service";
import {
  Building2,
  MapPin,
  Phone,
  Sparkles,
  ChevronLeft,
  Tv,
  Film,
  Clock,
  Ticket,
} from "lucide-react";

export function generateStaticParams() {
  const cinemas = cinemaStore.getCinemas();
  return cinemas.map((c) => ({ id: c.id }));
}

export default async function CinemaDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const cinema = cinemaStore.getCinemaById(params.id);
  if (!cinema) {
    notFound();
  }

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

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Back Link */}
      <div>
        <Link
          href="/cinemas"
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>All Cinemas</span>
        </Link>
      </div>

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-slate-900 p-6 sm:p-10 shadow-2xl">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
              <Building2 className="h-3.5 w-3.5" />
              <span>Flagship Cinema Experience</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white">
              {cinema.name}
            </h1>
            <div className="space-y-1.5 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-amber-400 shrink-0" />
                <span>
                  {cinema.address}, {cinema.city}, {cinema.state} {cinema.postalCode}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-amber-400 shrink-0" />
                <span>{cinema.phone}</span>
              </div>
            </div>

            {/* Amenities Badges */}
            <div className="pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Theater Amenities
              </span>
              <div className="flex flex-wrap gap-2">
                {cinema.amenities.map((a) => (
                  <span
                    key={a}
                    className="rounded-lg bg-slate-950 px-3 py-1 text-xs text-slate-200 border border-white/10"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="overflow-hidden rounded-2xl border border-white/10 shadow-xl">
              <img
                src={cinema.imageUrl}
                alt={cinema.name}
                className="w-full aspect-video object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Movies Showing at This Cinema */}
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <Film className="h-4 w-4" />
            <span>Now Playing Here</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Today's Movie Schedule
          </h2>
        </div>

        {moviesWithShowtimes.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-12 text-center">
            <Clock className="mx-auto h-10 w-10 text-slate-600 mb-2" />
            <p className="text-sm text-slate-400">
              No movies currently scheduled at this location today.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {moviesWithShowtimes.map((movie) => (
              <div
                key={movie.id}
                className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-xl flex flex-col md:flex-row gap-6 items-start"
              >
                {/* Poster */}
                <div className="w-32 shrink-0 rounded-xl overflow-hidden border border-white/10 shadow-md">
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-full aspect-[2/3] object-cover"
                  />
                </div>

                {/* Info & Showtimes */}
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="rounded bg-black/60 px-2 py-0.5 text-[10px] font-bold border border-white/15 text-white">
                        {movie.rating}
                      </span>
                      <span className="text-xs text-slate-400">
                        {movie.durationMins} mins
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-400">
                        {movie.language}
                      </span>
                    </div>
                    <Link
                      href={`/movies/${movie.id}`}
                      className="text-xl font-bold text-white hover:text-amber-400 transition-colors"
                    >
                      {movie.title}
                    </Link>
                  </div>

                  {/* Showtimes Grid */}
                  <div className="flex flex-wrap gap-2.5 pt-2">
                    {movie.showtimes.map((st) => {
                      const timeStr = new Date(st.startTime).toLocaleTimeString(
                        [],
                        { hour: "2-digit", minute: "2-digit" }
                      );
                      return (
                        <Link
                          key={st.id}
                          href={`/showtimes/${st.id}`}
                          className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-slate-950 px-4 py-2.5 text-center transition-all hover:border-amber-500 hover:bg-amber-500/10 hover:shadow-md cursor-pointer"
                        >
                          <span className="text-sm font-black text-white">
                            {timeStr}
                          </span>
                          <span className="text-[10px] font-bold text-cyan-400 mt-0.5">
                            {st.format}
                          </span>
                          <span className="text-[10px] font-semibold text-amber-400 mt-0.5">
                            ${(st.basePriceCents / 100).toFixed(2)}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
