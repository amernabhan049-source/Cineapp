"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Building2, Calendar, Clock, Sparkles, ArrowRight } from "lucide-react";
import { SeedCinema } from "@/db/seed-data";

interface ShowtimeClientProps {
  movieId: string;
  cinemas: SeedCinema[];
  initialShowtimes: any[];
}

export function ShowtimeSectionClient({
  movieId,
  cinemas,
  initialShowtimes,
}: ShowtimeClientProps) {
  const [selectedCinemaId, setSelectedCinemaId] = useState<string>("ALL");
  const [selectedDate, setSelectedDate] = useState<string>("");

  // Generate 4 day tabs
  const dateTabs = Array.from({ length: 4 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() + idx);
    const iso = d.toISOString().slice(0, 10);
    let label = d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    if (idx === 0) label = "Today";
    if (idx === 1) label = "Tomorrow";
    return { label, value: iso, dayNumber: d.getDate(), dayName: d.toLocaleDateString("en-US", { weekday: "short" }) };
  });

  const activeDate = selectedDate || dateTabs[0].value;

  // Filter showtimes
  const filteredShowtimes = initialShowtimes.filter((st) => {
    const stDate = st.startTime.slice(0, 10);
    const dateMatch = stDate === activeDate;
    const cinemaMatch =
      selectedCinemaId === "ALL" || st.cinema?.id === selectedCinemaId;
    return dateMatch && cinemaMatch;
  });

  // Group showtimes by cinema
  const groupedByCinema: Record<string, { cinema: SeedCinema; showtimes: any[] }> = {};
  for (const st of filteredShowtimes) {
    const cId = st.cinema.id;
    if (!groupedByCinema[cId]) {
      groupedByCinema[cId] = {
        cinema: st.cinema,
        showtimes: [],
      };
    }
    groupedByCinema[cId].showtimes.push(st);
  }

  const cinemaGroups = Object.values(groupedByCinema);

  return (
    <div className="space-y-6">
      {/* Date & Cinema Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-900/80 p-3 shadow-lg">
        {/* Date Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {dateTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedDate(tab.value)}
              className={`flex flex-col items-center justify-center px-4 py-2 rounded-xl transition-all ${
                activeDate === tab.value
                  ? "bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20 scale-105"
                  : "bg-slate-950 text-slate-300 hover:bg-slate-800 border border-white/5"
              }`}
            >
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                {tab.dayName}
              </span>
              <span className="text-sm font-bold">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Cinema Selector Dropdown */}
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-amber-400 shrink-0" />
          <select
            value={selectedCinemaId}
            onChange={(e) => setSelectedCinemaId(e.target.value)}
            className="rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
          >
            <option value="ALL">All Cinema Locations</option>
            {cinemas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.city})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Screenings Listings */}
      {cinemaGroups.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-12 text-center">
          <Clock className="mx-auto h-12 w-12 text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-white">
            No Screenings Scheduled for Selected Date
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Please select another date or cinema location.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {cinemaGroups.map(({ cinema, showtimes }) => (
            <div
              key={cinema.id}
              className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-xl space-y-4"
            >
              {/* Cinema Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-amber-400" />
                    <h3 className="font-bold text-white text-base">
                      {cinema.name}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {cinema.address}, {cinema.city}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {cinema.amenities.slice(0, 3).map((amenity) => (
                    <span
                      key={amenity}
                      className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300 border border-white/5"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              {/* Showtimes Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {showtimes.map((st) => {
                  const startTimeStr = new Date(st.startTime).toLocaleTimeString(
                    [],
                    { hour: "2-digit", minute: "2-digit" }
                  );
                  const priceStr = `$${(st.basePriceCents / 100).toFixed(2)}`;

                  return (
                    <Link
                      key={st.id}
                      href={`/showtimes/${st.id}`}
                      className="group flex flex-col items-center justify-center rounded-xl border border-white/10 bg-slate-950/80 p-3 text-center transition-all hover:border-amber-500 hover:bg-amber-500/10 hover:shadow-lg hover:shadow-amber-500/15 cursor-pointer"
                    >
                      <span className="text-base font-black text-white group-hover:text-amber-300">
                        {startTimeStr}
                      </span>
                      <span className="mt-0.5 rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-cyan-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                        {st.format}
                      </span>
                      <span className="mt-1 text-[11px] font-semibold text-slate-400">
                        {st.auditorium.name.split("-")[0]}
                      </span>
                      <span className="text-[11px] font-bold text-amber-400 mt-0.5">
                        {priceStr}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
