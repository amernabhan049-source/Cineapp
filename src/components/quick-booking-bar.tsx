"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Film, Building2, Calendar, Clock, ArrowRight } from "lucide-react";
import { SeedMovie, SeedCinema } from "@/db/seed-data";
import { cinemaStore } from "@/lib/booking-service";

interface QuickBookingBarProps {
  movies: SeedMovie[];
  cinemas: SeedCinema[];
}

export function QuickBookingBar({ movies, cinemas }: QuickBookingBarProps) {
  const router = useRouter();
  const nowShowingMovies = movies.filter((m) => m.status === "NOW_SHOWING");

  const [selectedMovieId, setSelectedMovieId] = useState(
    nowShowingMovies[0]?.id || ""
  );
  const [selectedCinemaId, setSelectedCinemaId] = useState(
    cinemas[0]?.id || ""
  );
  const [dates, setDates] = useState<{ label: string; value: string }[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [showtimes, setShowtimes] = useState<any[]>([]);
  const [selectedShowtimeId, setSelectedShowtimeId] = useState("");
  const [isLoadingTimes, setIsLoadingTimes] = useState(false);

  // Initialize next 5 days
  useEffect(() => {
    const list: { label: string; value: string }[] = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      let label = d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      if (i === 0) label = "Today";
      if (i === 1) label = "Tomorrow";
      list.push({ label, value: iso });
    }
    setDates(list);
    setSelectedDate(list[0]?.value || "");
  }, []);

  // Fetch showtimes whenever movie, cinema, or date changes
  useEffect(() => {
    if (!selectedMovieId || !selectedCinemaId || !selectedDate) return;

    function loadTimes() {
      setIsLoadingTimes(true);
      try {
        const found = cinemaStore.getShowtimesForMovie(
          selectedMovieId,
          selectedCinemaId,
          selectedDate
        );
        if (found && found.length > 0) {
          setShowtimes(found);
          setSelectedShowtimeId(found[0].id);
        } else {
          setShowtimes([]);
          setSelectedShowtimeId("");
        }
      } catch (e) {
        setShowtimes([]);
      } finally {
        setIsLoadingTimes(false);
      }
    }

    loadTimes();
  }, [selectedMovieId, selectedCinemaId, selectedDate]);

  const handleProceed = () => {
    if (selectedShowtimeId) {
      router.push(`/showtimes/${selectedShowtimeId}`);
    } else if (selectedMovieId) {
      router.push(`/movies/${selectedMovieId}`);
    }
  };

  return (
    <div className="w-full rounded-2xl border border-white/15 bg-slate-900/90 p-4 sm:p-5 shadow-2xl backdrop-blur-xl glow-gold">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10 text-xs font-bold uppercase tracking-wider text-amber-400">
        <span>Fast Ticket Booking</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* 1. Pick Movie */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
            <Film className="h-3.5 w-3.5 text-amber-400" />
            1. Select Movie
          </label>
          <select
            value={selectedMovieId}
            onChange={(e) => setSelectedMovieId(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            {nowShowingMovies.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title} ({m.rating})
              </option>
            ))}
          </select>
        </div>

        {/* 2. Pick Cinema */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-amber-400" />
            2. Select Cinema
          </label>
          <select
            value={selectedCinemaId}
            onChange={(e) => setSelectedCinemaId(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            {cinemas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.city})
              </option>
            ))}
          </select>
        </div>

        {/* 3. Pick Date */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-amber-400" />
            3. Select Date
          </label>
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            {dates.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Pick Showtime & CTA */}
        <div className="space-y-1.5 flex flex-col justify-end">
          <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-amber-400" />
            4. Showtime & Seats
          </label>
          <div className="flex gap-2">
            <select
              value={selectedShowtimeId}
              onChange={(e) => setSelectedShowtimeId(e.target.value)}
              disabled={isLoadingTimes || showtimes.length === 0}
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-50"
            >
              {showtimes.length === 0 ? (
                <option value="">No showtimes</option>
              ) : (
                showtimes.map((st) => (
                  <option key={st.id} value={st.id}>
                    {new Date(st.startTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    - {st.format} (${(st.basePriceCents / 100).toFixed(2)})
                  </option>
                ))
              )}
            </select>
            <button
              onClick={handleProceed}
              disabled={!selectedShowtimeId && !selectedMovieId}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 hover:scale-[1.02] transition-all whitespace-nowrap cursor-pointer"
            >
              <span>Book</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
