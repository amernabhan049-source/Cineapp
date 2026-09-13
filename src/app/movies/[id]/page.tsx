import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cinemaStore } from "@/lib/booking-service";
import {
  Clock,
  Star,
  Film,
  Building2,
  Calendar,
  Ticket,
  ChevronLeft,
  Sparkles,
} from "lucide-react";
import { ShowtimeSectionClient } from "./showtime-client";

export const dynamic = "force-dynamic";

export default async function MovieDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const movie = cinemaStore.getMovieById(params.id);
  if (!movie) {
    notFound();
  }

  const allCinemas = cinemaStore.getCinemas();
  const allShowtimes = cinemaStore.getShowtimesForMovie(movie.id);

  return (
    <div className="pb-24">
      {/* Backdrop Section */}
      <div className="relative w-full h-[380px] sm:h-[460px] overflow-hidden bg-slate-950 border-b border-white/10">
        <img
          src={movie.backdropUrl}
          alt={movie.title}
          className="h-full w-full object-cover object-center filter blur-xs scale-105 opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080b11] via-[#080b11]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080b11] via-transparent to-[#080b11]" />

        {/* Back Link */}
        <div className="absolute top-6 left-4 sm:left-8 z-20">
          <Link
            href="/movies"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2 text-xs font-semibold text-slate-200 backdrop-blur-md hover:bg-white/10 hover:text-white transition-all"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>All Movies</span>
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-44 sm:-mt-56">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Poster */}
          <div className="lg:col-span-4 flex flex-col items-center">
            <div className="w-64 sm:w-72 overflow-hidden rounded-2xl border border-white/20 bg-slate-900 shadow-2xl glow-gold">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-full aspect-[2/3] object-cover"
              />
            </div>
          </div>

          {/* Right Details */}
          <div className="lg:col-span-8 space-y-6">
            <div>
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="rounded-md bg-amber-500 px-2.5 py-0.5 text-xs font-black text-slate-950">
                  {movie.rating}
                </span>
                <span className="flex items-center gap-1 rounded-md bg-slate-800/90 border border-white/10 px-2.5 py-0.5 text-xs font-bold text-amber-400">
                  <Star className="h-3 w-3 fill-amber-400" />
                  {movie.imdbScore} Rating
                </span>
                <span className="rounded-md bg-slate-800/90 border border-white/10 px-2.5 py-0.5 text-xs text-slate-300">
                  {movie.language}
                </span>
                <span className="rounded-md bg-slate-800/90 border border-white/10 px-2.5 py-0.5 text-xs text-slate-300">
                  {movie.durationMins} Mins
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                {movie.title}
              </h1>

              {/* Genres */}
              <div className="flex flex-wrap gap-2 mt-3">
                {movie.genres?.map((g) => (
                  <span
                    key={g.id}
                    className="text-xs uppercase font-bold tracking-wider text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-lg"
                  >
                    {g.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Synopsis */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-lg backdrop-blur-xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
                Synopsis
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {movie.description}
              </p>
            </div>

            {/* Cast & Director */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Director
                </span>
                <span className="text-sm font-semibold text-white">
                  {movie.director}
                </span>
              </div>
              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Starring Cast
                </span>
                <span className="text-sm font-semibold text-white line-clamp-2">
                  {movie.cast}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Showtimes & Seat Booking Selector Section */}
        <div className="mt-14 pt-10 border-t border-white/10">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
            <Ticket className="h-4 w-4" />
            <span>Select Cinema & Showtime</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-6">
            Available Screenings
          </h2>

          <ShowtimeSectionClient
            movieId={movie.id}
            cinemas={allCinemas}
            initialShowtimes={allShowtimes}
          />
        </div>
      </div>
    </div>
  );
}
