import React from "react";
import { cinemaStore } from "@/lib/booking-service";
import { Building2, MapPin, Phone, Tv, Sparkles } from "lucide-react";


export default function AdminCinemasPage() {
  const cinemas = cinemaStore.getCinemas();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Cinemas & Screen Matrices</h2>
        <p className="text-xs text-slate-400">
          Auditoriums, screen configurations, seating capacities, and amenity packages.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cinemas.map((c) => (
          <div
            key={c.id}
            className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 shadow-xl backdrop-blur-xl space-y-5"
          >
            <div className="flex items-start justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="font-bold text-white text-lg">{c.name}</h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                  <MapPin className="h-3.5 w-3.5 text-amber-400" />
                  <span>
                    {c.address}, {c.city}, {c.state}
                  </span>
                </div>
              </div>
              <span className="rounded-md bg-rose-500/20 px-2.5 py-1 text-xs font-bold text-rose-300 border border-rose-500/30">
                {c.screens.length} Screens
              </span>
            </div>

            {/* Screens List */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Auditorium Layouts
              </span>
              <div className="space-y-2">
                {c.screens.map((scr) => (
                  <div
                    key={scr.id}
                    className="flex items-center justify-between rounded-xl bg-slate-950 p-3 border border-white/5 text-xs"
                  >
                    <div>
                      <span className="font-bold text-white block">{scr.name}</span>
                      <span className="text-[11px] text-cyan-400 font-semibold">
                        {scr.screenType}
                      </span>
                    </div>
                    <div className="text-right text-slate-300">
                      <span className="font-bold text-amber-400">
                        {scr.rows.length * scr.seatsPerRow} Seats
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Rows {scr.rows[0]}-{scr.rows[scr.rows.length - 1]} ({scr.seatsPerRow}/row)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="pt-2 border-t border-white/5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Amenities
              </span>
              <div className="flex flex-wrap gap-1.5">
                {c.amenities.map((a) => (
                  <span
                    key={a}
                    className="rounded bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300 border border-white/5"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
