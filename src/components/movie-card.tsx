"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, Clock, Play, Ticket, Sparkles } from "lucide-react";
import { SeedMovie, SeedGenre } from "@/db/seed-data";
import { TrailerModal } from "@/components/trailer-modal";

interface MovieCardProps {
  movie: SeedMovie & { genres?: SeedGenre[] };
}

export function MovieCard({ movie }: MovieCardProps) {
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);

  return (
    <>
      <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 shadow-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-500/40 hover:shadow-2xl hover:shadow-amber-500/10">
        {/* Poster Image Container */}
        <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-950">
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            <span className="rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white backdrop-blur-md border border-white/15">
              {movie.rating}
            </span>
            {movie.status === "COMING_SOON" && (
              <span className="rounded-md bg-rose-500/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-md backdrop-blur-md">
                Coming Soon
              </span>
            )}
          </div>

          {/* Rating Badge */}
          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-md bg-amber-500/95 px-2 py-0.5 text-[10px] font-black text-slate-950 shadow-md backdrop-blur-md z-10">
            <Star className="h-3 w-3 fill-slate-950" />
            <span>{movie.imdbScore}</span>
          </div>

          {/* Hover Overlay with Trailer Button */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex flex-col justify-end p-4 z-20">
            <button
              onClick={() => setIsTrailerOpen(true)}
              className="mb-3 flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/20 py-2 text-xs font-bold text-white backdrop-blur-md hover:bg-amber-500 hover:text-slate-950 hover:border-amber-500 transition-all cursor-pointer"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Watch Trailer</span>
            </button>
            <Link
              href={`/movies/${movie.id}`}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-2.5 text-xs font-black text-slate-950 shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-amber-500 transition-all"
            >
              <Ticket className="h-3.5 w-3.5" />
              <span>Book Tickets</span>
            </Link>
          </div>
        </div>

        {/* Content Details */}
        <div className="flex flex-1 flex-col p-4">
          {/* Genres */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {movie.genreSlugs?.slice(0, 2).map((genre) => (
              <span
                key={genre}
                className="text-[10px] uppercase font-bold tracking-wider text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded"
              >
                {genre}
              </span>
            ))}
          </div>

          {/* Title */}
          <Link
            href={`/movies/${movie.id}`}
            className="font-bold text-white text-base hover:text-amber-400 transition-colors line-clamp-1"
          >
            {movie.title}
          </Link>

          {/* Metadata */}
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-slate-500" />
              <span>{movie.durationMins} mins</span>
            </div>
            <span>{movie.language}</span>
          </div>
        </div>
      </div>

      <TrailerModal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        trailerUrl={movie.trailerUrl}
        movieTitle={movie.title}
      />
    </>
  );
}
