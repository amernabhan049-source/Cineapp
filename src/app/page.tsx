import React from "react";
import Link from "next/link";
import { cinemaStore } from "@/lib/booking-service";
import { QuickBookingBar } from "@/components/quick-booking-bar";
import { MovieCard } from "@/components/movie-card";
import {
  Film,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Ticket,
  Tv,
  Crown,
  Flame,
  Calendar,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const allMovies = cinemaStore.getMovies();
  const nowShowing = allMovies.filter((m) => m.status === "NOW_SHOWING");
  const comingSoon = allMovies.filter((m) => m.status === "COMING_SOON");
  const cinemas = cinemaStore.getCinemas();
  const genres = Array.from(cinemaStore.genres.values());

  const featuredMovie = nowShowing[0] || allMovies[0];

  return (
    <div className="flex flex-col gap-14 pb-20">
      {/* Hero Cinematic Section */}
      <section className="relative w-full overflow-hidden bg-slate-950 pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-white/10">
        {/* Backdrop Ambient Background */}
        <div className="absolute inset-0 z-0 opacity-30">
          <img
            src={featuredMovie?.backdropUrl || ""}
            alt="Hero Backdrop"
            className="h-full w-full object-cover object-center filter blur-sm scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080b11] via-[#080b11]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080b11] via-transparent to-[#080b11]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-300">
                <Flame className="h-3.5 w-3.5 text-amber-400" />
                <span>Now In Theaters Worldwide</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                {featuredMovie?.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                <span className="rounded bg-black/60 px-2 py-0.5 font-bold border border-white/15">
                  {featuredMovie?.rating}
                </span>
                <span className="text-slate-400">•</span>
                <span>{featuredMovie?.durationMins} Mins</span>
                <span className="text-slate-400">•</span>
                <span>{featuredMovie?.language}</span>
                <span className="text-slate-400">•</span>
                <span className="text-amber-400 font-bold">
                  ★ {featuredMovie?.imdbScore} Rating
                </span>
              </div>

              <p className="text-sm sm:text-base text-slate-300 line-clamp-3 leading-relaxed max-w-2xl">
                {featuredMovie?.description}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link
                  href={`/movies/${featuredMovie?.id}`}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 text-sm font-black text-slate-950 shadow-xl shadow-amber-500/25 hover:from-amber-400 hover:to-amber-500 hover:scale-[1.02] transition-all"
                >
                  <Ticket className="h-4 w-4" />
                  <span>Book Tickets Now</span>
                </Link>
                <Link
                  href={`/movies/${featuredMovie?.id}`}
                  className="flex items-center gap-2 rounded-xl border border-white/20 bg-slate-900/80 px-6 py-3 text-sm font-bold text-white hover:bg-white/10 hover:border-white/40 transition-all"
                >
                  <span>More Details</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Right Hero Poster & Screen Type Showcase */}
            <div className="lg:col-span-5 hidden lg:flex justify-center">
              <div className="relative w-72 rounded-2xl overflow-hidden border border-white/20 shadow-2xl shadow-amber-500/20 group">
                <img
                  src={featuredMovie?.posterUrl}
                  alt={featuredMovie?.title}
                  className="w-full object-cover aspect-[2/3] group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-4 left-4 right-4 text-center">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
                    IMAX 70MM Experience
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Integrated Quick Booking Bar */}
          <div className="mt-12">
            <QuickBookingBar movies={allMovies} cinemas={cinemas} />
          </div>
        </div>
      </section>

      {/* Now Showing Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>In Cinemas This Week</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Now Showing
            </h2>
          </div>
          <Link
            href="/movies"
            className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
          >
            <span>View All Movies ({allMovies.length})</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Genre Pill Filter Quick Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          <Link
            href="/movies"
            className="whitespace-nowrap rounded-full bg-amber-500 px-4 py-1.5 text-xs font-bold text-slate-950 shadow-md"
          >
            All Genres
          </Link>
          {genres.map((g) => (
            <Link
              key={g.id}
              href={`/movies?genre=${g.slug}`}
              className="whitespace-nowrap rounded-full border border-white/10 bg-slate-900 px-4 py-1.5 text-xs font-medium text-slate-300 hover:border-amber-500/40 hover:text-amber-300 transition-all"
            >
              {g.name}
            </Link>
          ))}
        </div>

        {/* Movies Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {nowShowing.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      {/* Luxury Experience Showcase Banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/60 p-8 sm:p-12 shadow-2xl">
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
                <Tv className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">
                  IMAX Laser & Dolby Atmos
                </h3>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                  Next-gen 4K dual-laser projection paired with 128-channel spatial sound.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400">
                <Crown className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">
                  VIP Luxe Recliners
                </h3>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                  Italian heated leather power-recliners with gourmet in-seat butler dining.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">
                  Instant QR Smart Passes
                </h3>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                  Fast contactless admission, Apple/Google wallet sync, and flexible refunds.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400">
              <Calendar className="h-3.5 w-3.5" />
              <span>Upcoming Blockbusters</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Coming Soon
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {comingSoon.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>
    </div>
  );
}
