"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MovieCard } from "@/components/movie-card";
import { Film, Search, Filter, Sparkles } from "lucide-react";
import { cinemaStore } from "@/lib/booking-service";
import { SeedMovie, SeedGenre } from "@/db/seed-data";

function MoviesContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const initialGenre = searchParams.get("genre") || "";
  const initialStatus = searchParams.get("status") || "ALL";

  const [movies, setMovies] = useState<(SeedMovie & { genres: SeedGenre[] })[]>([]);
  const [genres, setGenres] = useState<SeedGenre[]>([]);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedGenre, setSelectedGenre] = useState(initialGenre);
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const [selectedLanguage, setSelectedLanguage] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    function load() {
      setIsLoading(true);
      try {
        const filtered = cinemaStore.getMovies({
          search: searchTerm || undefined,
          genre: selectedGenre || undefined,
          status: selectedStatus !== "ALL" ? (selectedStatus as any) : undefined,
          language: selectedLanguage !== "ALL" ? selectedLanguage : undefined,
        });
        setMovies(filtered);
        setGenres(Array.from(cinemaStore.genres.values()));
      } catch (e) {
        setMovies([]);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [searchTerm, selectedGenre, selectedStatus, selectedLanguage]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
          <Film className="h-4 w-4" />
          <span>Cinema Catalog</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mt-1">
          Explore Movies & Showtimes
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Browse blockbuster releases, search by director or cast, and reserve your luxury seats.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-xl backdrop-blur-xl space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, director, or cast..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-950 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Status Tabs */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              Release Status
            </label>
            <div className="flex rounded-xl bg-slate-950 p-1 border border-white/10">
              {[
                { label: "All", value: "ALL" },
                { label: "Now Showing", value: "NOW_SHOWING" },
                { label: "Coming Soon", value: "COMING_SOON" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setSelectedStatus(tab.value)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    selectedStatus === tab.value
                      ? "bg-amber-500 text-slate-950 shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Genre Dropdown */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              Genre
            </label>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="">All Genres</option>
              {genres.map((g) => (
                <option key={g.id} value={g.slug}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Language Dropdown */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              Language
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="ALL">All Languages</option>
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="Japanese">Japanese</option>
            </select>
          </div>
        </div>
      </div>

      {/* Movies Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] rounded-2xl bg-slate-900/60 animate-pulse border border-white/5"
            />
          ))}
        </div>
      ) : movies.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-12 text-center">
          <Film className="mx-auto h-12 w-12 text-slate-600 mb-3" />
          <h3 className="text-lg font-bold text-white">No Movies Found</h3>
          <p className="text-xs text-slate-400 mt-1">
            Try adjusting your search criteria or filters.
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedGenre("");
              setSelectedStatus("ALL");
              setSelectedLanguage("ALL");
            }}
            className="mt-4 rounded-xl bg-amber-500/20 border border-amber-500/30 px-4 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/30"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function MoviesPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-12 text-center text-slate-400">
          Loading movies...
        </div>
      }
    >
      <MoviesContent />
    </Suspense>
  );
}
